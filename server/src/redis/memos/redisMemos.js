import { Memo } from "../../models/Memo.js";
import mongoose from "mongoose";
import redisClient from "../redisClient.js";

const DEFAULT_EXPIRATION = 3600  // 1 HOURS

export const getServerMemos = async (userId) => {
  const memos = await Memo.find(
    { owner: userId },
  )
 
  if(memos.length){
    await Promise.all(memos.map(async memo => {
      await memo.populateOwner();
    }));
  }
  return memos;
}
  
export const storeMemosRedis = async (userId, redisClient, memos) =>{
  const key = `user:${userId}:memos`;
  try {
    await Promise.all(memos.map(async (memo) => {
      // if the key exists is gonna create and add otherwise is gonna add
      await redisClient.sAdd(key, memo.id);
      await redisClient.expire(key, DEFAULT_EXPIRATION);

      // create a new hash for the new memo 
      // hset store fields id, title, content etc...
      const memoKey = `memo:${memo.id}`;
      await redisClient.hSet(memoKey, 'title', memo.title);
      await redisClient.hSet(memoKey, 'content', memo.content);
      await redisClient.hSet(memoKey, 'owner', userId);

      await redisClient.expire(memoKey, DEFAULT_EXPIRATION);
  }));
  } catch (redisErr) {
    console.error("Redis Error:", redisErr);
  } 
}
  
export const getMemosRedis = async (key) =>{
  let memos = null;
  try {
    const cachedMemos = await redisClient.sMembers(key);
    if (cachedMemos) {
      console.log('Memos from Redis');
      console.log(cachedMemos);
      memos = await Promise.all(cachedMemos.map(async memoId => {
        const memo = await redisClient.hGetAll(`memo:${memoId}`);
        memo.id = memoId;
        const owner = {
          id: new mongoose.Types.ObjectId(memo.owner),
          fullname: await redisClient.hGet(`user:${memo.owner}`, 'fullname')
        };
        memo.owner = owner
        return { ...memo }; 
      }));
    }
  } catch (error) {
    console.error("Error retrieving memos from Redis:", error);
  }
  return memos;
}
  
export const editMemoRedis = async (userId, keyCachedMemos, updatedMemo) => {
  const cachedMemos = await redisClient.sMembers(keyCachedMemos);
  try {
    if (cachedMemos) {
      if(!cachedMemos.includes(updatedMemo.id)){
        await restoreMemosRedis(userId)
        return;
      }

      const memoKey = `memo:${updatedMemo.id}`;
      await redisClient.hSet(memoKey, 'title', updatedMemo.title);
      await redisClient.hSet(memoKey, 'content', updatedMemo.content);
      await redisClient.expire(memoKey, DEFAULT_EXPIRATION);

    } else {
      await restoreMemosRedis(userId)
    }    
  } catch (error) {
    console.error("Error retrieving memos from Redis:", error);
  }
}
  
export const deleteMemoRedis = async (userId, keyCachedMemos, deletedMemoId) => {
  const cachedMemos = await redisClient.sMembers(keyCachedMemos);
  try {
    if (cachedMemos) {
      if(!cachedMemos.includes(deletedMemoId)){
        await restoreMemosRedis(userId)
        return;
      }

      const memoKey = `memo:${deletedMemoId}`;
      await redisClient.del(memoKey);

    } else {
      await restoreMemosRedis(userId)
    }    
  } catch (error) {
    console.error("Error retrieving memos from Redis:", error);
  }
}
  
export const restoreMemosRedis = async (userId) => {
  try {
   // case if the memos are expired in cache, reload them in cache
   const memos = await getServerMemos(userId);
   // Store memos in Redis for future requests
   storeMemosRedis(userId, redisClient, memos);
 } catch (error) {
   console.error("Error retrieving memos from Mongi Db Server:", error);
 }
}