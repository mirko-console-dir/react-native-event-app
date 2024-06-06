import { Memo } from "../../models/Memo.js";
import redisClient from "../../redis/redisClient.js";
import {getServerMemos, storeMemosRedis, getRedisMemos, editMemoRedis, deleteMemoRedis} from "../../redis/memos/redisMemos.js"


export default {
    Query: {
        getMemo: async (_, { id }) => await Memo.findById(id),
        getMemos: async  (_, __, contextValue) => {
            if (!contextValue.user) {
              throw new Error("Not authenticated");
            }
            // try in redis
            const key = `user:${contextValue.user._id}:memos`;
            let memos = [];
                      
            // Try to get memos from Redis
            memos = await getRedisMemos(key)
            // END try in redis
            // if not in cache get from server
            if(!memos.length){
              try {
                memos = await getServerMemos(contextValue.user._id);
                console.log(memos)
                // Store memos in Redis for future requests
                storeMemosRedis(contextValue.user._id, memos)
              } catch (error) {
                console.error("Error retrieving memos from Mongi Db Server:", error);
              }
            }
        
            return memos;
          }
    },
    Mutation: {
        createMemo: async (_, { input }, contextValue) => {
            if (!contextValue.user) throw new Error("Not authenticated");
            try{
                const { title,content } = input;
                const newMemo = new Memo({
                  title,
                  content,
                  owner: contextValue.user._id, // Set the owner to the user's ID
                })
                //console.log(contextValue.user)
                await newMemo.populateOwner();
                await newMemo.save()
                // redis cache 
                storeMemosRedis(contextValue.user._id, redisClient, [newMemo])
                // END redis cache
                return newMemo
              } catch(err){
                  console.log(err);
              }
        }, 
        editMemo: async (_, { memoId, input }, contextValue) => {
         
          if (!contextValue.user) {
            throw new Error('Not authenticated');
          }
      
          try {
            //  ...(input.title && { title: input.title }), in case there is input title otherwise leave the previous one
            const updatedMemo = await Memo.findByIdAndUpdate(
              memoId,
              {
                $set: {
                  ...(input.title && { title: input.title }),
                  ...(input.content && { content: input.content }),
                },
              },
              { new: true }
            );
      
            if (!updatedMemo) {
              throw new ApolloError('Memo not found');
            }
      
            if (updatedMemo.owner.toString() !== contextValue.user._id.toString()) {
              throw new Error('Unauthorized');
            }
            await updatedMemo.populateOwner();
            // redis cache
            const keyCachedMemos = `user:${contextValue.user._id}:memos`;
            await editMemoRedis(contextValue.user._id, keyCachedMemos, updatedMemo)
            // END redis cache

            return updatedMemo;
          } catch (error) {
            console.error(error);
            throw new Error('Failed to edit the Memo');
          }
        },
        deleteMemo: async (_, { id }, contextValue) => {
            /* const result = await Memo.deleteOne({ _id: id });
            return result.deletedCount > 0; */
              try {
                // Find the Memo by ID
                const deletedMemo = await Memo.findById(id);
        
                // Check if the Memo exists
                if (!deletedMemo) {
                  throw new Error("Memo not found");
                }
        
                // Delete the Memo
                const result = await Memo.deleteOne({ _id: id });
        
                if (result.deletedCount > 0) {
                  console.log(`Memo with ID ${id} deleted successfully`);

                  // redis
                  const keyCachedMemos = `user:${contextValue.user._id}:memos`;
                  await deleteMemoRedis(contextValue.user._id, keyCachedMemos, id);
                  // END redis

                  return true;
                } else {
                  console.log(`Memo with ID ${id} not found or not deleted`);
                  throw new Error("Failed to delete the Memo");
                }
              } catch (error) {
                console.error(error);
                throw new Error("Failed to delete the Memo");
              }
        },
    }
};