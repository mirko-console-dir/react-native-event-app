import mongoose from "mongoose";

const RefreshTokenSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    token: {
        type: String,
        required: true,
        unique: true
    },
    expiresIn: {
        type: Date,
        required: true,
    }
}, {timestamps: true});

export const RefreshToken = mongoose.model('RefreshToken', RefreshTokenSchema);
