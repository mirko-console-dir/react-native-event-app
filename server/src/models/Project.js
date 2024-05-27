import mongoose from "mongoose";

const { Schema } = mongoose;

const ProjectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    expireDate: {
        type: String,
    },
    todos: [{ type: Schema.Types.ObjectId, ref: 'Todo' }],
    status: {
        type: String,
        enum: ['Completed', 'In Progress', 'Pending'],
        default: 'Pending'
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    collaborators: [{ type: Schema.Types.ObjectId, ref: 'User' }]
   
}, {timestamps: true});

ProjectSchema.methods.populateOwner = function() {
    return this.populate({
        path: 'owner',
        select: '_id fullname'
    });
};

ProjectSchema.methods.populateTodos = function () {
    return this.populate({
      path: 'todos',
      select: '_id content comments checkedStatus images project',
    });
};
ProjectSchema.methods.populateCollaborators = function () {
    return this.populate({
      path: 'collaborators',
      select: '_id fullname email avatar',
    });
};

export const Project = mongoose.model('Projects', ProjectSchema);
