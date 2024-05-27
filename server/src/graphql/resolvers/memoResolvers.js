import { Memo } from "../../models/Memo.js";

export default {
    Query: {
        getMemo: async (_, { id }) => await Memo.findById(id),
        getMemos: async  (_, __, contextValue) => {
            if (!contextValue.user) {
              throw new Error("Not authenticated");
            }
            const memos = await Memo.find(
                { owner: contextValue.user._id }, // Memos where the user is the owner
            )
            .populate('owner')
            
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
              });
              await newMemo.populateOwner();

              await newMemo.save()
              
              return newMemo
            } catch(err){
                console.log(err);
            }
        }, 
        editMemo: async (_, { memoId, input }, contextValue) => {
          console.log('====================================');
          console.log('wjw');
          console.log('====================================');
          if (!contextValue.user) {
            throw new Error('Not authenticated');
          }
      
          try {
            const memo = await Memo.findById(memoId);
      
            if (!memo) {
              throw new ApolloError('Memo not found');
            }
      
            if (memo.owner.toString() !== contextValue.user._id.toString()) {
              throw new Error('Unauthorized');
            }
      
            if (input.title) {
              memo.title = input.title;
            }
            if (input.content) {
                memo.content = input.content;
            }

            await memo.populateOwner();
            
            await memo.save();
      
            return memo;
          } catch (error) {
            console.error(error);
            throw new Error('Failed to edit the Memo');
          }
        },
        deleteMemo: async (_, { id }) => {
            /* const result = await Memo.deleteOne({ _id: id });
            return result.deletedCount > 0; */
              try {
                // Find the Memo by ID
                const memo = await Memo.findById(id);
        
                // Check if the Memo exists
                if (!memo) {
                  throw new Error("Memo not found");
                }
        
                // Delete the Memo
                const result = await Memo.deleteOne({ _id: id });
        
                if (result.deletedCount > 0) {
                  console.log(`Memo with ID ${id} deleted successfully`);
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