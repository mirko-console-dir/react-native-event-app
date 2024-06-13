import { Todo } from "../../models/Todo.js"
import { User } from "../../models/User.js"
import { Project } from "../../models/Project.js";
import uploadToS3 from '../../utils/uploadToS3.js'
import deleteFromS3 from "../../utils/deleteFromS3.js";
import getImagesFromS3 from "../../utils/getImagesFromS3.js";
import { PubSub } from 'graphql-subscriptions'
import { withFilter } from 'graphql-subscriptions'; // withFilter for subscription filtering

import { ApolloError } from "apollo-server-express";

import { storeTodosRedis, editTodoRedis, deleteTodoRedis, editCheckedStatusTodo, addTodoCommentRedis,deleteTodoCommentRedis,editTodoCommentRedis,deleteTodoImageRedis } from "../../redis/todos/redisTodos.js";
import { updateEventStatus } from "../../redis/events/redisEvents.js";

// functions that resolve specific query
const pubsub = new PubSub()

const checkUserAuthorizedAction = async (userId, todoId, commentId) => {
    try {
        const todoMatchComment = await Todo.findOne(
            {
              _id: todoId,
              "comments._id": commentId,
            },
            {
              "comments.$": 1, // Project only the specific comment
            }
        );
          
        if (!todoMatchComment) {
          return new ApolloError("Todo or comment not found", "NOT_FOUND");
        }
        
        const comment = todoMatchComment.comments[0]; // accesses the specific comment because the projection returns an array with a single element (the matching comment).
    
        const authorId = comment.author._id;
          
        if (userId != authorId) {
            return false
        }
        return true
    } catch (error) {
        console.error('checkUserAuthorizedAction '+error);
    }
  
}
export default {
    Query: {
        hello: () => "Hello world!", 
        getTodo: async (_,{ID}) => { // the first paramenter is for the parent and we ingnoire that
            return await Todo.findById(ID)
        },
        /* getTodos: async () => await Todo.find(), */
        /* -1 is taking from the old */
        /* async getTodos(_,{amount}) {
            return await Todo.find().sort({createdAt: -1}).limit(amount)
        } */
        getTodos: async (_, { page, pageSize }) => { 
            // Calculate the skip value based on the page and pageSize
            const skip = (page - 1) * pageSize;
            
            // Query the database to get a page of todos
            const todos = await Todo.find()
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(pageSize);
        
            // Count the total number of todos (for pagination info)
            const totalItems = await Todo.countDocuments();
        
            // Calculate the total number of pages
            const totalPages = Math.ceil(totalItems / pageSize);
        
            // Return the result as a TodoPagination object
            return {
                todos,
                totalItems,
                totalPages
            };
        },
        getTodoImages: async (_, { todoId }) => {

            const todo = await Todo.findById(todoId)
            if (!todo) throw new Error('No such todo')

            const imagesUrls = await getImagesFromS3(todo.images)
        
            console.log('========imagesUrls==============');
            console.log(imagesUrls);
            console.log('====================================');
            
            return imagesUrls
        },
    },
    Mutation: {
        createTodo: async (_,{ input }, contextValue) => {
            const { content, expireDate, projectId, images } = input;
            try{
                let uploadedImages = []
                if(images){
                    // Upload images to S3
                    uploadedImages = await uploadToS3(images); 
                }
                
                // Create a new Todo with the S3 URLs
                const newTodo = new Todo({
                    content: content,
                    expireDate: expireDate,
                    project: projectId,
                    checkedStatus: false,
                    images: uploadedImages,
                });
                
                await newTodo.save() // mongodb saving
                
                await Project.findByIdAndUpdate(
                    projectId,
                    {
                        $push: { todos: newTodo.id },
                    },
                    { new: true }
                );
    
                pubsub.publish('TASK_CREATED', {
                    taskCreated: {
                        todo: newTodo,
                    },
                    userIdTriggedSub: contextValue.user._id,
                });

                // redis cache
                await storeTodosRedis(projectId.toString(), [newTodo])
                // END redis cache

                // Save the updated Project
                // return the id and the rest of the parameter texting _doc to show all the difference props
                // return in the apollo server
                return newTodo
            } catch(e){
                console.log('====================================');
                console.log(e);
                console.log('====================================');
            }
        },
        deleteTodo: async (_,{ID}, contextValue) => { 
            // _id is the mongo db providede id
            // forom doc after delete return an obj wuth 3 fields one of this is deletedCount return 1 if deleted 0 if nothing was deleted
            /* const wasDeleted = (await Todo.deleteOne({_id : ID})).deletedCount;
            return wasDeleted;  */
                try {
                // Find the todo by ID
                    const todo = await Todo.findById(ID);
                // Check if the todo exists
                    if (!todo) {
                        throw new Error('Todo not found');
                    }

                // Delete the todo from the associated project
                await Project.findByIdAndUpdate(
                    todo.project,
                    {
                        $pull: { todos: todo.id },
                    },
                    { new: true }
                );

                // delete images from AWS s3
                if(todo.images.length > 0){
                  todo.images.forEach( async (image) => {
                    await deleteFromS3(image.imageName)
                  })
                }
                // Delete the todo from the database
                const wasDeleted = (await Todo.deleteOne({ _id: ID })).deletedCount;

                pubsub.publish('TASK_DELETED', {
                    taskDeleted: {
                        projectId: todo.project,
                        todoId: todo.id,
                    },
                    userIdTriggedSub: contextValue.user._id,
                });
                // redis cache
                await deleteTodoRedis(
                    contextValue.user._id,
                    todo.project.toString(), 
                    todo.id.toString(), 
                    todo.images.length ? todo.images.length : null, 
                    todo.comments.length ? todo.comments.length : null, 
                ) 
                // END redis cache

                  // wasDeleted return true if the todo was deleted, false otherwise
               
                  return wasDeleted === 1;
                } catch (error) {
                  // console.error(error);
                  throw new Error('Failed to delete the todo');
                }
        },
        editTodo: async (_, { todoId, input }, contextValue) => {
            const {content, expireDate, images} = input
            try {
                let uploadedImages = []
                if(images){
                    // Upload images to S3
                    uploadedImages = await uploadToS3(images); 
                }
                const todo = await Todo.findByIdAndUpdate(
                    todoId,
                    {
                        $set : {content : content, expireDate : expireDate},
                        $push: { images: { $each: uploadedImages } },
                    },
                    { new: true }
                );
                // redis cache
                await editTodoRedis(contextValue.user._id,todo.project.toString(), todo)
                // END redis cache

                return true;
            } catch (error) {
                console.error(error);
                throw new Error('Failed to edit the todo');
            }
        },
        checkedStatusTodo: async (_, { todoId, input },contextValue) => {
            try {
                const wasEdited = (await Todo.updateOne({ _id: todoId }, input)).modifiedCount;
                const todo = await Todo.findById({_id: todoId})
                // check if one of the todos is completed
                const project = await Project.findById({_id: todo.project}).populate('todos')
                const todosLenght = project.todos.length
                let checkedTodos = 0
                project.todos.forEach(todo => {
                    if(todo.checkedStatus){
                        checkedTodos ++
                    }
                }) 
                if(todosLenght == checkedTodos){
                    await Project.findByIdAndUpdate(
                        todo.project,
                        {
                            $set: { "status": 'Completed' },
                        },
                        { new: true }
                    );
                    // redis cache
                    await updateEventStatus(contextValue.user._id,todo.project.toString(), 'Completed')
                    // END redis cache
                } else if (todosLenght > checkedTodos && checkedTodos !== 0) {
                    await Project.findByIdAndUpdate(
                        todo.project,
                        {
                            $set: { "status": 'In Progress' },
                        },
                        { new: true }
                    );
                    // redis cache
                    await updateEventStatus(contextValue.user._id,todo.project.toString(), 'In Progress')
                    // END redis cache
                } else {
                    await Project.findByIdAndUpdate(
                        todo.project,
                        {
                            $set: { "status": 'Pending' },
                        },
                        { new: true }
                    );
                    // redis cache
                    await updateEventStatus(contextValue.user._id,todo.project.toString(), 'Pending')
                    // END redis cache
                }

                pubsub.publish('TASK_CHECKED_STATUS', {
                    taskCheckedStatus: {
                        projectId: todo.project,
                        todoId: todo.id,
                    },
                    userIdTriggedSub: contextValue.user._id,
                });
                // END check if one of the todos is completed
                // redis cache
                await editCheckedStatusTodo(contextValue.user._id,todoId, input.checkedStatus.toString())
                // END redis cache
                return wasEdited === 1;
            } catch (error) {
               console.error(error);
               throw new Error('Failed to edit the todo');
            }
        },
        addCommentTodo: async (_,{ todoId, input },contextValue) => {
            const { commentText } = input;

            if (!contextValue.user) {
                throw new Error("Not authenticated");
            };
            try {
                const user = await User.findById(contextValue.user._id);
                const author = {id: user._id, fullname:user.fullname, avatar: user.avatar};

                const newComment = {    
                    commentText: commentText, 
                    author: author,
                }
                    
                const todo = await Todo.findByIdAndUpdate(
                    todoId,
                    {
                        $push: { comments: newComment },
                    },
                    { new: true }
                );
                if (!todo) throw new Error("Todo not found");
                const storedComment = todo.comments[todo.comments.length - 1];

                  /* PING THE SUBSCRIPTION 'triggername', {name of the subscription and type of commentCreated } */
                pubsub.publish('COMMENT_CREATED', {
                    commentCreated: {
                        comment: storedComment,
                        projectId: todo.project.toString(),
                        todoId: todoId
                    },
                    userIdTriggedSub: user._id,
                });
                // redis cache
                await addTodoCommentRedis(contextValue.user._id, todoId, storedComment);
                // END redis cache

                return storedComment;
            }catch (err) {
                throw new Error("Error add comment ", err);
            }
        },
        deleteCommentTodo: async (_,{ todoId, commentId },contextValue) => {
            try {
                const isAuthorized = await checkUserAuthorizedAction(contextValue.user._id, todoId, commentId);
                if(!isAuthorized) {
                    return new ApolloError("You are not authorized to edit or delete other users' comments.", "USER_IS_NOT_AUTHORIZED_COMMENT");
                }
                const todo = await Todo.findByIdAndUpdate(
                  todoId,
                  {
                    $pull: { comments: { _id: commentId } },
                  },
                  { new: true }
                );
            
                if (!todo) {
                  throw new Error("Todo not found");
                }
                pubsub.publish('COMMENT_DELETED', {
                    commentDeleted: {
                        commentId: commentId,
                        projectId: todo.project.toString(),
                        todoId: todoId
                    },
                    userIdTriggedSub: contextValue.user._id,
                });
                  // redis cache
                  await deleteTodoCommentRedis(contextValue.user._id, todoId, commentId);
                  // END redis cache
                return true
            } catch (error) {
                console.error('Failed to delete comment', error);
                throw new Error('Failed to delete comment');
            }
        },
        editCommentTodo: async (_,{ todoId, commentId, input }, contextValue) => {
            try {
                // if you are not author of the comment you cannot edit or delete
                const isAuthorized = await checkUserAuthorizedAction(contextValue.user._id, todoId, commentId);
                if(!isAuthorized) {
                    return new ApolloError("You are not authorized to edit or delete other users' comments.", "USER_IS_NOT_AUTHORIZED_COMMENT");
                }
                const todo = await Todo.findOneAndUpdate(
                  {
                    _id: todoId,
                    "comments._id": commentId,
                  },
                  {
                    $set: { "comments.$.commentText": input.commentText },
                  },
                  { new: true }
                );
            
                if (!todo) {
                  throw new Error("Todo or comment not found");
                }
                const commentUpdated = todo.comments.find(comment => {
                    return comment.id === commentId;
                });
                
                pubsub.publish('COMMENT_UPDATED', {
                    commentUpdated: {
                        comment: commentUpdated,
                        projectId: todo.project.toString(),
                        todoId: todo.id
                    },
                    userIdTriggedSub: contextValue.user._id,
                });
                // redis cache
                await editTodoCommentRedis(contextValue.user._id, commentId, input.commentText)
                // END redis cache

                return true;
              } catch (error) {
                // Handle errors, log them, or throw a custom error
                console.error(error);
                throw new Error("Failed to edit comment");
              }
        },
        deleteTaskImage: async (_,{ todoId, imageId, imageName }, contextValue) => {
            try {
                const todo = await Todo.findByIdAndUpdate(
                    todoId,
                    {
                      $pull: { images: { _id: imageId } },
                    },
                    { new: true }
                  );
                await deleteFromS3(imageName)
                // redis cache
                await deleteTodoImageRedis(contextValue.user._id, todoId, imageId)
                // END redis cache

                return true
            }catch(error){
                console.error(error);
                throw new Error("Failed to remove image");
            }
        }
    },
    Subscription: {
        taskCreated: {
            subscribe: withFilter(() => pubsub.asyncIterator(['TASK_CREATED']), async (payload, __, context) => {

                const project = await Project.findById(payload.taskCreated.todo.project);
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
        taskDeleted: {
            subscribe: withFilter(() => pubsub.asyncIterator(['TASK_DELETED']), async (payload, __, context) => {
                const project = await Project.findById(payload.taskDeleted.projectId);
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
        taskCheckedStatus: {
            subscribe: withFilter(() => pubsub.asyncIterator(['TASK_CHECKED_STATUS']), async (payload, __, context) => {
                const project = await Project.findById(payload.taskCheckedStatus.projectId);
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
        commentCreated: {
            /*() => pubsub.asyncIterator(['COMMENT_CREATED']), async (payload, variables, context) => {
            variables is sended from the client */
            subscribe: withFilter(() => pubsub.asyncIterator(['COMMENT_CREATED']), async (payload, __, context) => {

                const todoId  = payload.commentCreated.todoId;
                const todo = await Todo.findById(todoId);
                if (!todo) {
                    throw new Error('Todo not found');
                }
                const project = await Project.findById(todo.project);
                if (!project) {
                    throw new Error('Project not found');
                }
                const currentUserId = context.currentUser._id
                // check who is subscribing
                const isCollaborator = project.collaborators.some(collaborator => {return collaborator.toString() === currentUserId})
                const isOwner = project.owner.toString() === context.currentUser._id
                
                const userIdTriggedSub = payload.userIdTriggedSub.toString()

                if(isCollaborator && (currentUserId != userIdTriggedSub) || isOwner && (currentUserId != userIdTriggedSub)){
                    return true
                } else {
                    return false
                }
            }),
        },
        commentUpdated: {
            subscribe: withFilter(() => pubsub.asyncIterator(['COMMENT_UPDATED']), async (payload, __, context) => {
                console.log('====================================');
                console.log(payload);
                console.log('====================================');
                const todoId = payload.commentUpdated.todoId;
                const todo = await Todo.findById(todoId);
                if (!todo) {
                    throw new Error('Todo not found');
                }
                const project = await Project.findById(todo.project);
                if (!project) {
                    throw new Error('Project not found');
                }
                const currentUserId = context.currentUser._id
                console.log(currentUserId);

                // check who is subscribing
                const isCollaborator = project.collaborators.some(collaborator => {return collaborator.toString() === currentUserId})
                const isOwner = project.owner.toString() === context.currentUser._id
                
                const userIdTriggedSub = payload.userIdTriggedSub.toString()
                if(isCollaborator && (currentUserId != userIdTriggedSub) || isOwner && (currentUserId != userIdTriggedSub)){
                    return true
                } else {
                    return false
                }
            }),
        },
        commentDeleted: {
            subscribe: withFilter(() => pubsub.asyncIterator(['COMMENT_DELETED']), async (payload, __, context) => {
                
                const todoId = payload.commentDeleted.todoId;
                const todo = await Todo.findById(todoId);
               
                if (!todo) {
                    throw new Error('Todo not found');
                }
                const project = await Project.findById(payload.commentDeleted.projectId);
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
            }),
        },
    },
}
