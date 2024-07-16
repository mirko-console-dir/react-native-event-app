import mongoose from "mongoose";
import redisClient from "../redisClient.js";
import {eventHasTodoRedis, restoreEventsRedis} from "../events/redisEvents.js"

// not need to get from server is already taking when I get the events and populate with the todos 
//export const getServerEventTodos = async (userId) => {

// not need to get from redis is already taking when I get the events 
//export const getEventRedisTodos = async (userId) =>{


// check todo exist in redis
const isTodoInRedis = async (userId, todoId) => {
  try {
    const todoKey = `todo:${todoId}`
    const keyExists = await redisClient.exists(todoKey);
    if(!keyExists){
      await restoreEventsRedis(userId)
      return false;
    }
    return true
  } catch (error) {
    console.log('Error checking if isTodo In Redis',error);
  }
}
// check if comment exist in redis
const isCommentInRedis = async (userId,commentId) => {
  try {
    const commentKey = `comment:${commentId}`;
    const keyExists = await redisClient.exists(commentKey);
    if(!keyExists){
      await restoreEventsRedis(userId)
      return false;
    }
    return true
  } catch (error) {
    console.log('Error checking if isComment In Redis',error);
  }
}
// check todo has image
const todoHasImage = async (userId, todoId, imageId) => {
  const todoImagesKey = `todo:${todoId}:images`;
  const cachedTodoImages = await redisClient.sMembers(todoImagesKey);
  if(!cachedTodoImages.includes(imageId)){
    await restoreEventsRedis(userId)
    return false; 
  }
  return true;
}

export const storeTodosRedis = async (eventId, todos) =>{
    const eventTodosKey = `event:${eventId}:todos`;
    try {
        await Promise.all(todos.map(async (todo) => {
            let todoId = todo._id.toString();
            // Check if the todo already exists in the event's todos set
            const eventListTodoExists = await redisClient.sIsMember(eventTodosKey, todoId);
            if (!eventListTodoExists) {
              // if the key exists is gonna create and add otherwise is gonna add
              await redisClient.sAdd(eventTodosKey, todoId);
              await redisClient.expire(eventTodosKey, process.env.DEFAULT_EXPIRATION_REDIS);
              
              const todoKey = `todo:${todoId}`;
              const todoKeyExists = await redisClient.exists(todoKey);
              if(!todoKeyExists){
                await redisClient.hSet(todoKey, 'content', todo.content);
                await redisClient.hSet(todoKey, 'expireDate', todo.expireDate);
                await redisClient.hSet(todoKey, 'project', todo.project.toString());  
                await redisClient.hSet(todoKey, 'checkedStatus', todo.checkedStatus.toString());  
        
                if (todo.comments && todo.comments.length > 0) {
                    const todoCommentsKey = `todo:${todoId}:comments`;
                    
                    todo.comments.forEach(async (comment) => {
                        await redisClient.sAdd(todoCommentsKey, comment._id.toString());

                        let commentKey = `comment:${comment._id.toString()}`
                        const commentKeyExist = await redisClient.exists(commentKey);
                        if(commentKeyExist){
                          await redisClient.hSet(commentKey, 'commentText', comment.commentText);
                          await redisClient.hSet(commentKey, 'author', comment.author._id.toString());
                          await redisClient.expire(commentKey, process.env.DEFAULT_EXPIRATION_REDIS);
                        }
                    })
                    await redisClient.expire(todoCommentsKey, process.env.DEFAULT_EXPIRATION_REDIS);
                }
    
                if (todo.images && todo.images.length > 0) {
                  const todoImageKey = `todo:${todoId}:images`;
                  todo.images.forEach(async (image) => {
                      const imageId = image._id.toString();
                      await redisClient.sAdd(todoImageKey, imageId);
                      const imageKey = `image:${imageId}`;
                      const imageKeyExists = await redisClient.exists(imageKey);
                      if(!imageKeyExists){
                        await redisClient.hSet(imageKey, 'caption', image.caption);
                        await redisClient.hSet(imageKey, 'imageName', image.imageName);
                        await redisClient.expire(imageKey, process.env.DEFAULT_EXPIRATION_REDIS);                      
                      }
                  })
                  await redisClient.expire(todoImageKey, process.env.DEFAULT_EXPIRATION_REDIS);
                }  
                await redisClient.expire(todoKey, process.env.DEFAULT_EXPIRATION_REDIS);
              }
            }
        }));
        await redisClient.expire(eventTodosKey, process.env.DEFAULT_EXPIRATION_REDIS);
    } catch (redisErr) {
      console.error("Redis Error storeEventTodosRedis:", redisErr);
    } 
}
export const editTodoRedis = async (userId, eventId, updatedTodo) => {
  try {
    // check if redis is update
    const isRedisUpdate = await eventHasTodoRedis(userId, eventId,updatedTodo._id.toString())
    if(!isRedisUpdate) return;
    // check if todo exist 
    const todoExist = await isTodoInRedis(userId, updatedTodo._id.toString())
    if(!todoExist) return;
    // edit in redis
    await storeTodosRedis(eventId, [updatedTodo])
  } catch (error) {
    console.log('Error editTodoRedis',error);
  }
}
export const deleteTodoRedis = async (userId, eventId, deletedTodoId, imagesLength, commentsLength) => {
  try {
    // check if redis is update
    const isRedisUpdate = await eventHasTodoRedis(userId,eventId,deletedTodoId)
    if(!isRedisUpdate) return;
    // check if todo exist 
    const todoExist = await isTodoInRedis(userId,deletedTodoId)
    if(!todoExist) return;
    // remove todo comments
    if(imagesLength){
      const keyCachedTodoComments = `todo:${todoId}:comments`
      const cachedTodoComments = await redisClient.sMembers(keyCachedTodoComments);
      if(!cachedTodoComments){
        await restoreEventsRedis(userId)
        return;
      }
      
      cachedTodoComments.forEach(async (commentId) => {
        const keyComment = `comment:${commentId}`
        await redisClient.del(keyComment); 
      })
      await redisClient.del(keyCachedTodoComments); 
    }
    // remove todo images
    if(commentsLength){
      const keyCachedTodoImages = `todo:${todoId}:images`
      const cachedTodoImages = await redisClient.sMembers(keyCachedTodoImages);
      if(!cachedTodoImages){
        await restoreEventsRedis(userId)
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
export const editCheckedStatusTodo = async (userId, todoId, status) => {
  try {
    // check if redis is update
    const isRedisUpdate = await eventHasTodoRedis(userId,eventId,todoId)
    if(!isRedisUpdate) return;
    // check if todo exist 
    const todoExist = await isTodoInRedis(userId,todoId)
    if(!todoExist) return;

    await redisClient.hSet(todoKey, 'checkedStatus', status);  
  } catch (error) {
    console.error('Error editCheckedStatusTodo redis',error);
  }
}
export const addTodoCommentRedis = async (userId, eventId,todoId, comment) => {
  try {
    // check if redis is update
    const isRedisUpdate = await eventHasTodoRedis(userId, eventId,todoId)
    if(!isRedisUpdate) return;
    // check if todo exist 
    const todoExist = await isTodoInRedis(userId, todoId)
    if(!todoExist) return;

    const todoCommentsKey = `todo:${todoId}:comments`;
    // update todo comments list redis
    await redisClient.sAdd(todoCommentsKey, comment._id.toString());
    await redisClient.expire(todoCommentsKey, process.env.DEFAULT_EXPIRATION_REDIS);

    // add redis comment
    const commentKey = `comment:${comment._id.toString()}`;
    await redisClient.hSet(commentKey, 'commentText', comment.commentText);
    await redisClient.hSet(commentKey, 'author', comment.author._id.toString());
    await redisClient.expire(commentKey, process.env.DEFAULT_EXPIRATION_REDIS);
  } catch (error) {
    console.error('Error addTodoComment redis',error);

  }
}
export const deleteTodoCommentRedis = async (userId, todoId, commentId) => {
  try {
    const todoCommentsKey = `todo:${todoId}:comments`;
    const cachedTodoComments = await redisClient.sMembers(todoCommentsKey);
    if(!cachedTodoComments.includes(commentId)){
      await restoreEventsRedis(userId)
      return;
    }
    await redisClient.sRem(todoCommentsKey, commentId);

    // add redis comment
    const commentKey = `comment:${commentId}`;
    await redisClient.del(commentKey)
  } catch (error) {
    console.error('Error deleteTodoCommentRedis',error);
  }
}
export const editTodoCommentRedis = async (userId, commentId, commentText) => {
  try {
    const commentExist = await isCommentInRedis(userId, commentId)
    if(!commentExist) return;

    await redisClient.hSet(commentKey, 'commentText', commentText)

  } catch (error) {
    console.error('Error editTodoCommentRedis',error);
  }
}
export const deleteTodoImageRedis = async (userId, todoId, imageId) => {
  const isTodoUpdate = await todoHasImage(userId, todoId, imageId)
  if(!isTodoUpdate) return;
  // remove image from todo images list 
  const todoImagesKey = `todo:${todoId}:images`;
  
  await redisClient.sRem(todoImagesKey, imageId);

  const cachedTodoImages = await redisClient.sMembers(todoImagesKey);
  if(!cachedTodoImages.length){
    await redisClient.del(todoImagesKey)
    return
  }

  // remove image
  const imageKey = `image:${imageId}`;
  await redisClient.del(imageKey); 
}