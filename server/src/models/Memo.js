import mongoose from "mongoose";
const { Schema } = mongoose;

const MemoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
}, {timestamps: true});

MemoSchema.methods.populateOwner = function() {
    return this.populate({
        path: 'owner',
        select: '_id fullname'
    });
};

export const Memo = mongoose.model('Memos', MemoSchema);
