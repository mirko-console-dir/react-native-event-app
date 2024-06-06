import mongoose from "mongoose";
import redisClient from "../redisClient.js";

const DEFAULT_EXPIRATION = 3600  // 1 HOURS

// not need to get from server is already taking when I get the events and populate with the todos 
//export const getServerEventTodos = async (userId) => {

// not need to get from redis is already taking when I get the events 
//export const getEventRedisTodos = async (userId) =>{

export const storeTodosRedis = async (eventId, todos) =>{
    const eventTodosKey = `event:${eventId}:todos`;
    try {
        await Promise.all(todos.map(async (todo) => {
            let todoId = todo._id.toString();
            // if the key exists is gonna create and add otherwise is gonna add
            await redisClient.sAdd(eventTodosKey, todoId);
            await redisClient.expire(eventTodosKey, DEFAULT_EXPIRATION);
    
            const todoKey = `todo:${todoId}`;
        
            await redisClient.hSet(todoKey, 'content', todo.content);
            await redisClient.hSet(todoKey, 'expireDate', todo.expireDate);
            await redisClient.hSet(todoKey, 'project', todo.project.toString());  
            await redisClient.hSet(todoKey, 'checkedStatus', todo.checkedStatus.toString());  
    
            if (todo.comments && todo.comments.length > 0) {
                const todoCommentsKey = `todo:${todoId}:comments`;
                todo.comments.forEach(async (comment) => {
                    await redisClient.sAdd(todoCommentsKey, comment._id.toString());

                    let commentKey = `comment:${comment._id.toString()}`
                    await redisClient.hSet(commentKey, 'commentText', comment.commentText);
                    await redisClient.hSet(commentKey, 'author', comment.author._id.toString());
                    await redisClient.expire(commentKey, DEFAULT_EXPIRATION);
                })
                await redisClient.expire(eventTodosKey, DEFAULT_EXPIRATION);
            }

            if (todo.images && todo.images.length > 0) {
            const todoImageKey = `todo:${todoId}:images`;
            todo.images.forEach(async (image) => {
                const imageId = image._id.toString();
                await redisClient.sAdd(todoImageKey, imageId);

                const imageKey = `image:${imageId}`;
                await redisClient.hSet(imageKey, 'imageName', image.imageName);
                await redisClient.hSet(imageKey, 'url', image.url);
                await redisClient.expire(imageKey, DEFAULT_EXPIRATION);                      
            })
            }  

            await redisClient.expire(todoKey, DEFAULT_EXPIRATION);
        }));
        await redisClient.expire(eventTodosKey, DEFAULT_EXPIRATION);
    } catch (redisErr) {
      console.error("Redis Error storeEventTodosRedis:", redisErr);
    } 
}

/* export const editEventRedis = async (userId, keyCachedEvents, updatedEvent) => {
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
} */

/* export const addCollaboratorsEvent = async (userId, keyCachedEvents, eventId, collaboratorIds) => {
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
} */

/* export const deleteCollaboratorEvent = async (userId, keyCachedEvents, eventId, collaboratorId) => {
  const cachedEvents = await redisClient.sMembers(keyCachedEvents);
  try {
    if (cachedEvents) {
      if(!cachedEvents.includes(eventId)){
        //await restoreEventsRedis(userId)
        return;
      }
      const keyEventCollaborators = `event:${eventId}:collaborators`
      const eventCollaboratorsCached = await redisClient.sMembers(keyEventCollaborators);
  
      const updatedEventCollaborators = eventCollaboratorsCached.filter(collaborator => {collaborator !== collaboratorId})
      if(!updatedEventCollaborators.length){
        await redisClient.del(keyEventCollaborators);
      } else {
        await redisClient.del(keyEventCollaborators); 
        await redisClient.sAdd(keyEventCollaborators, ...updatedEventCollaborators); 
      }
    } else {
      await restoreEventsRedis(userId) 
    }
  } catch (error) {
    console.error("Error delete Collaborator Redis:", error);
  }
} */

/* const restoreEventsRedis = async (userId) => {
  try {
    const eventsFromServer = getServerEvents(userId)
    await storeEventsRedis(userId, eventsFromServer)
  } catch (error) {
    console.error("Error restore Events Redis:", error);
  }
} */
