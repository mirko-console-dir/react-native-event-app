import { Project } from "../../models/Project.js";
import mongoose from "mongoose";
import redisClient from "../redisClient.js";

const DEFAULT_EXPIRATION = 3600  // 1 HOURS

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
          const eventTodosKey = `event:${event.id}:todos`;
  
          await redisClient.sAdd(eventTodosKey);
          await redisClient.expire(eventTodosKey, DEFAULT_EXPIRATION);
          await redisClient.hSet(eventKey, 'todos', eventTodosKey);
        }
  
        if (event.collaborators && event.collaborators.length > 0) {
          const eventCollaboratorsKey = `event:${event.id}:collaborators`;
  
          await redisClient.sAdd(eventCollaboratorsKey);
          await redisClient.expire(eventCollaboratorsKey, DEFAULT_EXPIRATION);
          await redisClient.hSet(eventKey, 'collaborators', eventCollaboratorsKey);
        }
  
        await redisClient.expire(eventKey, DEFAULT_EXPIRATION);
    }));
    } catch (redisErr) {
      console.error("Redis Error:", redisErr);
    } 
  }