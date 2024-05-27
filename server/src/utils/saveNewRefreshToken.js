
import { RefreshToken } from '../models/RefreshToken.js';

const saveRefreshToken = async (_id, refreshToken) => {
    try {
        // Delete any existing refresh tokens for the user
        await RefreshToken.deleteMany({ user: _id });

        // Save the new refresh token in the database
        const newRefreshToken = new RefreshToken({
            user: _id,
            token: refreshToken,
            expiresIn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7days into the future
        });
        await newRefreshToken.save();
    } catch (error) {
        throw new Error("Failed to save refresh token: " + error.message);
    }
};
export default saveRefreshToken;