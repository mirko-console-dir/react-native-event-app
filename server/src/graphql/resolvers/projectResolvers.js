import { Project } from "../../models/Project.js";
import { Todo } from "../../models/Todo.js";
import { User } from "../../models/User.js";
import deleteFromS3 from "../../utils/deleteFromS3.js";
import { ApolloError } from 'apollo-server-express';
import { PubSub } from 'graphql-subscriptions'
import { withFilter } from 'graphql-subscriptions'; // withFilter for subscription filtering
import { getServerEvents, getRedisEvents, storeEventsRedis, editEventRedis, addCollaboratorsEvent, deleteCollaboratorEvent  } from "../../redis/events/redisEvents.js";

// functions that resolve specific query
const pubsub = new PubSub()

export default {
    Query: {
        getProject: async (_, { id }) => await Project.findById(id),
        getProjects: async  (_, __, contextValue) => {
            if (!contextValue.user) {
              throw new Error("Not authenticated");
            }
            // try in redis
            let projects = [];
            // Try to get memos from Redis
            projects = await getRedisEvents(contextValue.user._id)
            
            // END try in redis
            // if not in cache get from server
            if(!projects.length){
              try {
                projects = await getServerEvents(contextValue.user._id)             
              } catch (error) {
                console.error("Error retrieving projects from Mongi Db Server:", error);
              }
              // Store projects in Redis for future requests
              await storeEventsRedis(contextValue.user._id, projects)
            }
        
            return projects;
          }
    },
    Mutation: {
        createProject: async (_, { input }, contextValue) => {
            try{
              if (!contextValue.user) throw new Error("Not authenticated");
                const { title, expireDate } = input;
                const newProject = new Project({
                title,
                expireDate,
                owner: contextValue.user._id, 
              });
              await newProject.populateOwner();

              await newProject.save()
              // redis cache
              await storeEventsRedis(contextValue.user._id, [newProject])
              // END redis cache
              return newProject
            } catch(err){
                console.log(err);
            }
        }, 
        editProject: async (_, { projectId, input }, contextValue) => {
          try {
            if (!contextValue.user) {
              throw new Error('Not authenticated');
            }
            const project = await Project.findById(projectId);
      
            if (!project) {
              throw new Error('Project not found');
            }
      
            if (project.owner.toString() !== contextValue.user._id.toString()) {
              throw new Error('Unauthorized');
            }

            const updatedProject = await Project.findByIdAndUpdate(
              projectId,
              {
                $set: {
                  ...(input.title && { title: input.title }),
                  ...(input.expireDate && { expireDate : input.expireDate }),
                },
              },
              { new: true }
            );
            
            pubsub.publish('EVENT_UPDATED', {
              eventUpdated: {
                projectId: projectId,
                title: input.title,
                expireDate: input.expireDate
              },
              userIdTriggedSub: contextValue.user._id,
            });
            // redis cache
            const keyCachedEvents = `user:${contextValue.user._id}:events`;
            await editEventRedis(contextValue.user._id, keyCachedEvents, updatedProject);
            //END redis cache

            return updatedProject;
          } catch (error) {
            console.error(error);
            throw new Error('Failed to edit the project');
          }
        },
        deleteProject: async (_, { id }, contextValue) => {
            /* const result = await Project.deleteOne({ _id: id });
            return result.deletedCount > 0; */
              try {
                // Find the project by ID
                const project = await Project.findById(id);

                /* needs for subscriptions check */
                const eventOwner = project.owner
                const eventCollaborators = project.collaborators.length ? project.collaborators : [];
                /* needs for subscriptions check */

                // Check if the project exists
                if (!project) {
                  throw new Error("Project not found");
                }
        
                // Delete images in the associates todos
                const todosToDelete = await Todo.find({ project: id });
          
                 // Check if the todo exists
                 if (todosToDelete) {
                   todosToDelete.forEach((todo)=>{
                     // delete images from s3
                     if(todo.images.length > 0){
                        todo.images.forEach( async (image) => {
                           await deleteFromS3(image.imageName)
                        })
                     }
                    })
                    
                    // Delete associated todos
                    await Todo.deleteMany({ project: id });
                 }

        
                // Delete the project
                const result = await Project.deleteOne({ _id: id });
        
                if (result.deletedCount > 0) {
                  pubsub.publish('EVENT_DELETED', {
                    eventDeleted: {
                      projectId: id,
                    },
                    eventOwner: eventOwner,
                    eventCollaborators: eventCollaborators,
                    userIdTriggedSub: contextValue.user._id,
                  });
                  return true;
                } else {
                  console.log(`Project with ID ${id} not found or not deleted`);
                  throw new Error("Failed to delete the project");
                }
              } catch (error) {
                console.error(error);
                throw new Error("Failed to delete the project");
              }
        },
        addCollaboratorToProject: async (_, { projectId, collaboratorEmails }, contextValue) => {
              try {
                // Check if the user is authenticated                
                if (!contextValue.user) {
                  throw new Error("Not authenticated");
                }
                // Find the project by ID
                const project = await Project.findById(projectId);
        
                // Check if the project exists
                if (!project) {
                  throw new Error("Project not found");
                }
        
                // Check if the user is the owner of the project or a collaborator
                if (
                  project.owner.toString() !== contextValue.user._id.toString() &&
                  !project.collaborators.includes(contextValue.user._id.toString())
                ) {
                  throw new Error("Unauthorized");
                }
                // Find the user by email
                let collaboratorsToReturn = []
                let collaboratorIds = []
                for (const collaboratorEmail of collaboratorEmails) {
                  try {
                    const collaborator = await User.findOne({ email: collaboratorEmail.toLowerCase() });
                    
                    // Check if the collaborator exists
                    if (!collaborator) { 
                      collaboratorEmail.toLowerCase()
                      return new ApolloError(`User email not found ${collaboratorEmail}`, "COLLABORATOR_EMAIL_NOT_EXIST");
                    } 
                    console.log(collaborator.avatar)
                    if (!project.collaborators.some((c) => c.equals(collaborator._id))) {
                      collaboratorsToReturn.push({
                        id: collaborator._id.toString(), 
                        fullname: collaborator.fullname,
                        email: collaborator.email,
                        avatar: collaborator.avatar,
                      });        
                    } 

                    collaboratorIds.push(collaborator.id)
                    
                    await User.findByIdAndUpdate(
                      collaborator._id,
                      {
                        $addToSet: { collaborators: contextValue.user._id },
                      },
                      { new: true }
                    );

                  } catch (error) {
                    // Handle the error here
                    console.error(error);
                    throw new Error("Failed to add collaborator to the project");
                  }
                }

                await Project.findByIdAndUpdate(
                  projectId,
                  {
                    $addToSet: { collaborators: { $each: collaboratorIds } },
                  },
                  { new: true }
                );

                await User.findByIdAndUpdate(
                  contextValue.user._id,
                  {
                    $addToSet: { collaborators: { $each: collaboratorIds } },
                  },
                  { new: true }
                );

                pubsub.publish('EVENT_ADD_COLLABORATORS', {
                  eventAddCollab: {
                    projectId: projectId,
                    collaborators: collaboratorsToReturn
                  },
                  userIdTriggedSub: contextValue.user._id,
                });

                // redis cache
                // events add collaborator
                const keyCachedEvents = `user:${contextValue.user._id}:events`
                await addCollaboratorsEvent(contextValue.user._id, keyCachedEvents, projectId, collaboratorIds);
                // END redis cache

                return collaboratorsToReturn
              } catch (error) {
                console.error(error);
                throw new Error("Failed to add collaborator to the project");
              }
        },
        deleteCollaboratorProject: async (_, { projectId, collaboratorId }, contextValue) => {
          try{
            await Project.findByIdAndUpdate(
              projectId,
              {
                $pull: { collaborators: collaboratorId },
              },
              { new: true }
            );

            pubsub.publish('DELETED_COLLABORATOR', {
              eventDeletedCollab: {
                projectId: projectId,
                collaboratorId: collaboratorId
              },
              userIdTriggedSub: contextValue.user._id,
            });
            // redis cache
            // delete collaborator
            const keyCachedEvents = `user:${contextValue.user._id}:events`
            await deleteCollaboratorEvent(contextValue.user._id, keyCachedEvents, projectId, collaboratorId);
            //END redis cache
            
            return true
          }catch(error) {
            console.error(error);
            throw new Error('Failed to remove collaborator');
          }
        }
    },
    Subscription: {
      eventUpdated: {
          subscribe: withFilter(() => pubsub.asyncIterator(['EVENT_UPDATED']), async (payload, __, context) => {

              const project = await Project.findById(payload.eventUpdated.projectId);
              if (!project) {
                  throw new Error('Project not found');
              }
            
              const currentUserId = context.currentUser._id
              // check who is subscribing
              const isCollaborator = project.collaborators.some(collaborator => {return collaborator.toString() === currentUserId})
              const isOwner = project.owner.toString() === context.currentUser._id
              
              const userIdTriggedSub = payload.userIdTriggedSub
              if(isCollaborator && (currentUserId != userIdTriggedSub) || isOwner && (currentUserId != userIdTriggedSub)){
                  return true
              } else {
                  return false
              }
          })
      },
      eventDeleted: {
        subscribe: withFilter(() => pubsub.asyncIterator(['EVENT_DELETED']), async (payload, __, context) => {
            const currentUserId = context.currentUser._id
            // check who is subscribing
            const isCollaborator = payload.eventCollaborators.some(collaborator => {return collaborator.toString() === currentUserId})
            const isOwner = payload.eventOwner.toString() === context.currentUser._id
            const userIdTriggedSub = payload.userIdTriggedSub
            if(isCollaborator && (currentUserId != userIdTriggedSub) || isOwner && (currentUserId != userIdTriggedSub)){
                return true
            } else {
                return false
            } 
        })
      },
      eventAddCollab: {
        subscribe: withFilter(() => pubsub.asyncIterator(['EVENT_ADD_COLLABORATORS']), async (payload, __, context) => {

            const project = await Project.findById(payload.eventAddCollab.projectId);
            if (!project) {
                throw new Error('Project not found');
            }
          
            const currentUserId = context.currentUser._id
            // check who is subscribing
            const isCollaborator = project.collaborators.some(collaborator => {return collaborator.toString() === currentUserId})
            const isOwner = project.owner.toString() === context.currentUser._id
            
            const userIdTriggedSub = payload.userIdTriggedSub
            if(isCollaborator && (currentUserId != userIdTriggedSub) || isOwner && (currentUserId != userIdTriggedSub)){
                return true
            } else {
                return false
            }
        })
      },
      eventDeletedCollab: {
        subscribe: withFilter(() => pubsub.asyncIterator(['DELETED_COLLABORATOR']), async (payload, __, context) => {

            const project = await Project.findById(payload.eventDeletedCollab.projectId);
            if (!project) {
                throw new Error('Project not found');
            }
          
            const currentUserId = context.currentUser._id
            // check who is subscribing
            const isCollaborator = project.collaborators.some(collaborator => {return collaborator.toString() === currentUserId})
            const isOwner = project.owner.toString() === context.currentUser._id
            
            const userIdTriggedSub = payload.userIdTriggedSub
            if(isCollaborator && (currentUserId != userIdTriggedSub) || isOwner && (currentUserId != userIdTriggedSub)){
                return true
            } else {
                return false
            }
        })
      },
    }
};