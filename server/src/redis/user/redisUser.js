import redisClient from "../redisClient.js";
import { User } from "../../models/User.js";

const DEFAULT_EXPIRATION = 3600  // 1 HOURS

export const checkUserExist = async (userId) => {
    const userKey = `user:${userId}`
    const exists = await redisClient.exists(userKey);
    if (!exists) {
      const user = await User.findById(typeof userId != 'object' ? new mongoose.Types.ObjectId(userId) : userId)
      await storeUser(user)
    } 
}

export const storeUser = async (user) => {
    try {
        const key = `user:${user._id}`;
        //await redisClient.hSet(key, 'id', user._id.toString());
        await redisClient.hSet(key, 'id', user.id);
        await redisClient.hSet(key, 'fullname', user.fullname);
        await redisClient.hSet(key, 'email', user.email);
        if (user.avatar) {
            console.log(user.avatar)
            const avatarBase64 = user.avatar.toString('base64');
            await redisClient.hSet(key, 'avatar', avatarBase64);
        }
        await redisClient.expire(key, DEFAULT_EXPIRATION);
    } catch (redisErr) {
        console.error("Redis Error storeUser:", redisErr);
    }
};
  