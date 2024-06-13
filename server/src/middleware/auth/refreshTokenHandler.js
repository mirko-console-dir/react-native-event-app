import jwt from 'jsonwebtoken';
import { User } from '../../models/User.js';
import { RefreshToken } from '../../models/RefreshToken.js'; // Ensure you import the RefreshToken model
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from '../../config/index.js';
import { checkUserExist } from '../../redis/user/redisUser.js';
import redisClient from '../../redis/redisClient.js';

export const refreshTokenHandler = async (req, res) => {
    const authHeader = req.headers.authorization;
    console.log('=======refreshTokenHandler============');
    console.log(req);
    console.log(authHeader);
    console.log('====================================');
    if (!authHeader) {
      //console.error('No Authorization header present.');
      return res.status(401).send({ accessToken: '' });
    }
  
    const token = authHeader.split('Bearer ')[1];
 /*    console.log('========refreshTokenHandler TOKEN=============');
    console.log(token);
    console.log('===================================='); */
    if (!token) {
      //console.error('No token present after Bearer in the Authorization header.');
      return res.status(401).send({ accessToken: '' });
    }
  
    let payload = null;
    try {
      payload = jwt.verify(token, REFRESH_TOKEN_SECRET);
/*    console.log('========PAYLOAD===============');
      console.log(payload);
      console.log(token);
      console.log('===================================='); */
      //console.log('payload', payload);
    } catch (err) {
      //console.error('JWT verification error:', err.message);
      return res.status(401).send({ accessToken: '' });
    }
  
    // Check the user's existence and token in the database
    const storedRefreshToken = await RefreshToken.findOne({ user: payload._id });
/*     console.log('========storedRefreshToken============');
    console.log(storedRefreshToken);
    console.log('===================================='); */
    if (!storedRefreshToken || storedRefreshToken.token !== token) {
      console.error('Refresh token not matching or not found in the database.');
      return res.status(401).send({ accessToken: '' });
    }
  
    const user = await User.findOne({ _id: payload._id });

    if (!user) return res.status(401).send({ accessToken: '' });
    
    // redis cache
    // Check if the user key already exists
    const userKey = `user:${user._id}`
    const exists = await redisClient.exists(userKey);
    if (!exists) {
      await checkUserExist(user)
    }  
    // END redis cache

    const accessToken = jwt.sign(
      { _id: user._id, fullname: user.fullname, email: user.email },
      ACCESS_TOKEN_SECRET,
      { expiresIn: '15m' } // Adjust the expiresIn value as needed
    );
  
    res.send({ accessToken });
  };