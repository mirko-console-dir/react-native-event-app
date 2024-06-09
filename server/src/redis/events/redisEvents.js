import { Project } from "../../models/Project.js";
import mongoose from "mongoose";
import redisClient from "../redisClient.js";
import { checkUserExist } from "../user/redisUser.js";
import { storeTodosRedis } from "../todos/redisTodos.js";

const DEFAULT_EXPIRATION = 3600  // 1 HOURS

export const getServerEvents = async (userId) => {
  let projects = [];
  try {
    projects = await Project.find({
      $or: [
        { owner: new mongoose.Types.ObjectId(userId) }, // Projects where the user is the owner
        { collaborators: new mongoose.Types.ObjectId(userId) }, // Projects where the user is a collaborator
      ],
    })
    .populate('owner')
    .populate('todos')
    .populate('collaborators')
  } catch (error) {
    console.error("Error retrieving events from MGDB:", error);
    
  }
  return projects;
}

export const getRedisEvents = async (userId) =>{
    let events = [];
    try {
      const key = `user:${userId}:events`;

      const cachedEvents = await redisClient.sMembers(key);
      if (cachedEvents) {
        events = await Promise.all(cachedEvents.map(async eventId => {
          const event = await redisClient.hGetAll(`event:${eventId}`);
          event.id = eventId;

          const owner = {
            id: new mongoose.Types.ObjectId(event.owner),
            fullname: await redisClient.hGet(`user:${event.owner}`, 'fullname')
          };

          let eventCollaborators = [];
          const cachedEventCollaborator = await redisClient.sMembers(`event:${eventId}:collaborators`);
          if(cachedEventCollaborator){
            eventCollaborators = await Promise.all(cachedEventCollaborator.map(async collaboratorId => {
                const collaboratorData = { _id: new mongoose.Types.ObjectId(collaboratorId)}; // Add collaboratorId
                let key = `user:${collaboratorId}`
                const redisData = await redisClient.hGetAll(key);
                //console.log(redisData)
                if (redisData.avatar) {
                  collaboratorData.avatar = redisData.avatar;
                }
                // Merge redis data with collaboratorData 
                return Object.assign({}, collaboratorData, redisData);
            }))
          }

          let todos = [];
          const cachedEventTodos = await redisClient.sMembers(`event:${eventId}:todos`);
          if(cachedEventTodos){
            todos = await Promise.all(cachedEventTodos.map(async todoId => {
              const todoData = { id: new mongoose.Types.ObjectId(todoId)}; 

              let todoKey = `todo:${todoId}`
              const redisDataTodo = await redisClient.hGetAll(todoKey);
              redisDataTodo.checkedStatus = JSON.parse(redisDataTodo.checkedStatus)

              let comments = []
              const cachedCommentsTodo = await redisClient.sMembers(`todo:${todoId}:comments`);
              if(cachedCommentsTodo){
                comments = await Promise.all(cachedCommentsTodo.map(async commentId => {
                  const comment = {id: new mongoose.Types.ObjectId(commentId)}
                  let commentKey = `comment:${commentId}`
                  const redisDataComment = await redisClient.hGetAll(commentKey);
              
                  const author = {_id: new mongoose.Types.ObjectId(comment.author)}
                  const athorKey = `user:${comment.author}`
                  const authorRedisData = await redisClient.hGetAll(athorKey);
                  author.fullname = authorRedisData.fullname
                  author.email = authorRedisData.email
                  authorRedisData.avatar ? author.avatar = authorRedisData.avatar : null;
                  comment.author = author;
                  return Object.assign({}, comment, redisDataComment);
                }))
              }
              todoData.comments = comments;

              let images = []
              const cachedImagesTodo = await redisClient.sMembers(`todo:${todoId}:images`);
              if(cachedImagesTodo){
                images = await Promise.all(cachedImagesTodo.map(async imageId => {
                  const image = {id: new mongoose.Types.ObjectId(imageId)}
                  let imageKey = `image:${imageId}`
                  const redisDataImage = await redisClient.hGetAll(imageKey);
             
                  return Object.assign({}, image, redisDataImage);
                }))
              }
              todoData.images = images;
              // Merge redis data with todoData 

              return Object.assign({}, todoData, redisDataTodo);

            }))
          }

          event.owner = owner
          event.collaborators = eventCollaborators
          event.todos = todos
          return { ...event }; 
        }));
      }
    } catch (error) {
      console.error("Error retrieving getRedisEvents from Redis:", error);
    }
    return events;
}

export const storeEventsRedis = async (userId, events) =>{
    const key = `user:${userId}:events`;
    try {
      await Promise.all(events.map(async (event) => {
        // if the key exists is gonna create and add otherwise is gonna add
        await redisClient.sAdd(key, event.id);
        await redisClient.expire(key, DEFAULT_EXPIRATION);
  
        const eventKey = `event:${event.id}`;
        await redisClient.hSet(eventKey, 'title', event.title);
        await redisClient.hSet(eventKey, 'expireDate', event.expireDate);
        await redisClient.hSet(eventKey, 'status', event.status);
        await redisClient.hSet(eventKey, 'owner', userId);
  
  
        if (event.todos && event.todos.length > 0) {
          await storeTodosRedis(event.id, event.todos)
        }
  
        if (event.collaborators && event.collaborators.length > 0) {
          const eventCollaboratorsKey = `event:${event._id}:collaborators`;
          const ownerCollaboratorsKey = `user:${userId}:collaborators`;
          event.collaborators.forEach(async (collaborator) => {
            await redisClient.sAdd(eventCollaboratorsKey, collaborator.id)
            await redisClient.sAdd(ownerCollaboratorsKey, collaborator.id)
            // store collaborator as user
            // Check if the collaborator user key already exists            
            await checkUserExist(collaborator._id);
           
          })
          await redisClient.expire(eventCollaboratorsKey, DEFAULT_EXPIRATION);
          await redisClient.expire(ownerCollaboratorsKey, DEFAULT_EXPIRATION);

        }
  
        await redisClient.expire(eventKey, DEFAULT_EXPIRATION);
    }));
    } catch (redisErr) {
      console.error("Redis Error storeEventsRedis:", redisErr);
    } 
}

export const editEventRedis = async (userId, keyCachedEvents, updatedEvent) => {
    try {
      const cachedEvents = await redisClient.sMembers(keyCachedEvents);
      console.log(updatedEvent)
      console.log(updatedEvent.id)
      if (cachedEvents) {
        if(!cachedEvents.includes(updatedEvent.id)){
          //await restoreEventsRedis(userId)
          return;
        }
  
        const eventKey = `event:${updatedEvent.id}`;
        await redisClient.hSet(eventKey, 'title', updatedEvent.title);
        await redisClient.hSet(eventKey, 'expireDate', updatedEvent.expireDate);
        await redisClient.expire(eventKey, DEFAULT_EXPIRATION);
  
      } else {
        await restoreEventsRedis(userId)
      }    
    } catch (error) {
      console.error("Error edit Events from Redis:", error);
    }
}

export const addCollaboratorsEvent = async (userId, keyCachedEvents, eventId, collaboratorIds) => {
  try {
    const cachedEvents = await redisClient.sMembers(keyCachedEvents);
    console.log(collaboratorIds)

    if (cachedEvents) {
      if(!cachedEvents.includes(eventId)){
        await restoreEventsRedis(userId)
        return;
      }

      const eventKey = `event:${eventId}:collaborators`;
      const ownerKey = `user:${userId}:collaborators`;

      await Promise.all(collaboratorIds.map(async (collaboratorId)=>{
        console.log(collaboratorId)
        console.log(userId)

        await redisClient.sAdd(eventKey, collaboratorId);
        // owner event add collaborator if not exist 
        await redisClient.sAdd(ownerKey, collaboratorId);

        // collaborator user add owner as collaborator 
        const collaboratorKey = `user:${collaboratorId}:collaborators`;  
        await redisClient.sAdd(collaboratorKey, userId);
        await redisClient.expire(collaboratorKey, DEFAULT_EXPIRATION);

        // store collaborator as user
        // Check if the collaborator user key already exists
        await checkUserExist(collaboratorId)
      }))
      await redisClient.expire(eventKey, DEFAULT_EXPIRATION);
      await redisClient.expire(ownerKey, DEFAULT_EXPIRATION);
     

    } else {
      await restoreEventsRedis(userId)
    }    
  } catch (error) {
    console.error("Error add collaborator Redis:", error);
  }
}

export const deleteCollaboratorEvent = async (userId, keyCachedEvents, eventId, collaboratorId) => {
  const cachedEvents = await redisClient.sMembers(keyCachedEvents);
  try {
    if (cachedEvents) {
      if(!cachedEvents.includes(eventId)){
        //await restoreEventsRedis(userId)
        return;
      }
      const keyEventCollaborators = `event:${eventId}:collaborators`
      await redisClient.sRem(keyEventCollaborators, collaboratorId);

      const eventCollaboratorsCached = await redisClient.sMembers(keyEventCollaborators);
  
      if(!eventCollaboratorsCached.length) await redisClient.del(keyEventCollaborators);
      

    } else {
      await restoreEventsRedis(userId) 
    }
  } catch (error) {
    console.error("Error delete Collaborator Redis:", error);
  }
}

export const updateEventStatus = async (eventId, status)=>{
  try {
    const eventKey = `event:${eventId}`
    await redisClient.hSet(eventKey, 'status', status);  
  } catch (error) {
    console.error("Error delete updateEventStatus Redis:", error);
  }
}

const restoreEventsRedis = async (userId) => {
  try {
    const eventsFromServer = getServerEvents(userId)
    await storeEventsRedis(userId, eventsFromServer)
  } catch (error) {
    console.error("Error restore Events Redis:", error);
  }
}
