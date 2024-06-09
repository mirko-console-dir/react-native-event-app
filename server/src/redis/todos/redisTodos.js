import mongoose from "mongoose";
import redisClient from "../redisClient.js";

const DEFAULT_EXPIRATION = 3600  // 1 HOURS

// not need to get from server is already taking when I get the events and populate with the todos 
//export const getServerEventTodos = async (userId) => {

// not need to get from redis is already taking when I get the events 
//export const getEventRedisTodos = async (userId) =>{

// check status update todo data on redis 
const isTodoRedisUpdate = async (eventId, todoId) => {
  try {
    const keyCachedEventTodos = `event:${eventId}:todos`
    const cachedEventTodos = await redisClient.sMembers(keyCachedEventTodos);
    if(!cachedEventTodos.includes(todoId) || !cachedEventTodos){
      //await restoreEventsRedis(userId)
      return false;
    }
    return true
  } catch (error) {
    console.log('Error checking if tido redis is update',error);
  }
}
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
export const editTodoRedis = async (eventId, updatedTodo) => {
  try {
    // check if redis us update
    const isRedisUpdate = await isTodoRedisUpdate(eventId,updatedTodo._id.toString())
    if(!isRedisUpdate) return;
    //console.log(eventId)
    // 665c43f8cfc5839367eff2a3
    //console.log(updatedTodo)
    // {_id: new ObjectId("666186e6d2ef53472e922e71"),content: 'Dttt',expireDate: '2024/06/01',comments: null,images: [],checkedStatus: false,project: new ObjectId("665c43f8cfc5839367eff2a3")}
    // edit in redis
    await storeTodosRedis(eventId, [updatedTodo])
  } catch (error) {
    console.log('Error editTodoRedis',error);
  }
}
export const deleteTodoRedis = async (eventId, deletedTodoId, images, comments) => {
  try {
    // check if redis us update
    const isRedisUpdate = await isTodoRedisUpdate(eventId,deletedTodoId)
    if(!isRedisUpdate) return;
    // remove todo comments
    if(comments){
      const keyCachedTodoComments = `todo:${todoId}:comments`
      const cachedTodoComments = await redisClient.sMembers(keyCachedTodoComments);
      if(!cachedTodoComments){
        //await restoreEventsRedis(userId)
        return;
      }
      cachedTodoComments.forEach(async (commentId) => {
        const keyComment = `comment:${commentId}`
        await redisClient.del(keyComment); 
      })
      await redisClient.del(keyCachedTodoComments); 
    }
    // remove todo images
    if(images){
      const keyCachedTodoImages = `todo:${todoId}:images`
      const cachedTodoImages = await redisClient.sMembers(keyCachedTodoImages);
      if(!cachedTodoImages){
        //await restoreEventsRedis(userId)
        return;
      }
      cachedTodoImages.forEach(async (imageId) => {
        const keyImage = `image:${imageId}`
        await redisClient.del(keyImage); 
      })
      await redisClient.del(keyCachedTodoImages); 
    }

    // remove todo from event todos list 
    const cachedEventTodosKey = `event:${eventId}:todos`
    await redisClient.sRem(cachedEventTodosKey, deletedTodoId);

    const cachedEventTodos = await redisClient.sMembers(cachedEventTodosKey);
    if(!cachedEventTodos.length){
      await redisClient.del(cachedEventTodosKey)
      return
    }
    // remove todo  
    const todoKey = `todo:${deletedTodoId}`;
    await redisClient.del(todoKey); 
  } catch (error) {
    console.log('Error deleteTodoRedis',error);
  }
  
}

export const editCheckedStatusTodo = async (todoId, status) => {
  //console.log(todoId);
  // 666186485aa1434fc64c14c5
  //console.log(status);
  // 'false'
  const todoKey = `todo:${todoId}`
  await redisClient.hSet(todoKey, 'checkedStatus', status);  
}

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
