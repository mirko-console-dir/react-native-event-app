import mongoose from "mongoose"

const { Schema } = mongoose;

const authorSchema = new mongoose.Schema({
    fullname: {
        type: String,
    },
    avatar: {
        type: Buffer
    }
})
const commentSchema = new mongoose.Schema({
    commentText: {
      type: String,
    },
    author: {
        type: authorSchema,
    },
  }, {timestamps: true});
  
  const imageSchema = new mongoose.Schema({
    caption: {
        type: String
    },
    imageName: {
        type: String
    }
  }, {timestamps: true});
  
const TodoSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    expireDate: {
        type: String,
    },
    comments: [commentSchema], 
    images: [imageSchema],    
    checkedStatus: {
        type:  Boolean
    },
    project: { // Referencing the Project
        type: Schema.Types.ObjectId,
        ref: 'Project',
    }
}, {timestamps: true})

export const Todo = mongoose.model('Todo', TodoSchema)