import mongoose from "mongoose";
const { Schema } = mongoose;

const UserSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    avatar: {
        type: Buffer
    },
    collaborators: [{ type: Schema.Types.ObjectId, ref: 'User' }]
}, {timestamps: true});

UserSchema.methods.populateCollaborators = function () {
    return this.populate({
      path: 'collaborators',
      select: '_id fullname email avatar',
    });
};
export const User = mongoose.model('User', UserSchema);
