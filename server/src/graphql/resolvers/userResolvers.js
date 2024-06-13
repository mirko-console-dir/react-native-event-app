import { User } from "../../models/User.js";
import { ApolloError } from 'apollo-server-express';
import { RefreshToken } from '../../models/RefreshToken.js';
import saveRefreshToken from "../../utils/saveNewRefreshToken.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET, MODE } from '../../config/index.js'
import sharp from 'sharp'
import { checkUserExist } from "../../redis/user/redisUser.js";
import redisClient from "../../redis/redisClient.js";

export default {
  Query: {
    getUsers: async () => await User.find(),
    getUser: async (_, ID) => await User.findById(ID),
  },
  Mutation: {
    createUser: async (_, { input }) => {
      try {
        const { fullname, email, password, avatar } = input;

        // Check if the email is already in use
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            throw new ApolloError(`Email is already in use ${email}`, "USER_ALREADY_EXIST");
        }
      
        // Encrypt password
        let encryptedPassword = await bcrypt.hash(password, 10);

        // Image upload
        let buffer = null
        if(avatar){
          const bufferClient = Buffer.from(avatar.data, 'base64');
   
          buffer = await sharp(bufferClient)
            .resize({ height: 50, width: 50, fit: 'cover' })
            .toFormat('png') // Convert to png format
            .png({ quality: 80 })
            .toBuffer()
          }
          // End Image upload

        // Build mongoose model
        const newUser = new User({
            fullname: fullname,
            email: email.toLowerCase(),
            password: encryptedPassword,
        });

        if(buffer != null){
          newUser.avatar = buffer
        }
   console.log('=========newUser================');
   console.log(newUser);
   console.log('====================================');
        // Create a JWT (access token), attach to the user model
        const accessToken = jwt.sign(
            {
                _id: newUser._id,
                fullname: newUser.fullname,
                email
            },
            ACCESS_TOKEN_SECRET,
            { expiresIn: "15min" }
        );

        // Create a refresh token
        const refreshToken = jwt.sign(
            { _id: newUser._id },
            REFRESH_TOKEN_SECRET,
            { expiresIn: '7d' }
        );

        // Save the refresh token in the database
        const newRefreshToken = new RefreshToken({
            user: newUser._id,
            token: refreshToken,
            expiresIn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),  // 7 days into the future
        });

        await newRefreshToken.save();

        // save user
        await newUser.save();

        // redis cache
        // Check if the user key already exists
        const userKey = `user:${user._id}`
        const exists = await redisClient.exists(userKey);
        if (!exists) {
          await checkUserExist(user)
        }  
        // END redis cache

        return {
          accessToken,
          refreshToken,
          user: newUser
        };

      } catch (error) {
          throw new Error("Failed to create user: " + error.message);
      }
    },
    loginUser: async (_, { input }) => {
      try {
        const { email, password } = input;

        // Check if the email exists, and verify the password
        const user = await User.findOne({ email });
        //console.log('user logged in ',user)
        if (user && (await bcrypt.compare(password, user.password))) {

            // Create an access token
            const accessToken = jwt.sign(
                {
                    _id: user._id,
                    fullname: user.fullname,
                    email
                },
                ACCESS_TOKEN_SECRET,
                {
                  expiresIn: "15m"
                }
            );

            // Create a refresh token
            const refreshToken = jwt.sign(
                { _id: user._id },
                REFRESH_TOKEN_SECRET,
                { expiresIn: '7d' }
            );
           
            // redis cache
            // Check if the user key already exists
            const userKey = `user:${user._id}`
            const exists = await redisClient.exists(userKey);
            if (!exists) {
              await checkUserExist(user)
            }  
            // END redis cache
          

            // Save the refresh token in the database
            // overwrite the oldone in refreshtokens collection
            await saveRefreshToken(user._id, refreshToken);
            await user.populateCollaborators()

            return {
              accessToken,
              refreshToken,
              user
            };
        } else {
            throw new Error('Authentication failed.');
        }
      } catch (error) {
          throw new Error("Failed to login user: " + error.message);
      }
     
    },
    addCollaboratorToUser: async (_, { collaboratorEmail }, contextValue) => {
      // Check if the user is authenticated
      if (!contextValue.user) {
        throw new Error("Not authenticated");
      }

      try {
          const user = await User.findById(contextValue.user._id);
  
          if (!user) {
            throw new Error("User not found");
          }
          if(user.email == collaboratorEmail) {
            return new ApolloError(`Your email can't match with collaborator ${collaboratorEmail}`, "COLLABORATOR_EMAIL_SAME_AS_USER_EMAIL");
          }
  
          // Find the user by email
          const collaborator = await User.findOne({ email: collaboratorEmail });

          // Check if the collaborator exists
          if (!collaborator) {
            return new ApolloError(`User email not found ${collaboratorEmail}`, "COLLABORATOR_EMAIL_NOT_EXIST");
          }
  
          // Check if the collaborator is already added
          if (user.collaborators.some((c) => c.equals(collaborator._id))) {
            return new ApolloError(`Collaborator already in use ${collaboratorEmail}`, "USER_ALREADY_LISTED");
          }

          await User.findByIdAndUpdate(
            user.id,
            {
                $push: { collaborators: collaborator.id },
            },
            { new: true }
          );

          return collaborator;
      } catch (error) {
          console.error(error);
          throw new Error("Failed to add collaborator to the project");
      }
    },
    deleteCollaboratorUser: async (_, { collaboratorId }, contextValue) => {
      try{
        await User.findByIdAndUpdate(
          contextValue.user._id,
          {
            $pull: { collaborators: collaboratorId },
          },
          { new: true }
        );
        return true
      }catch(error) {
        console.error(error);
        throw new Error('Failed to remove collaborator');
      }
    },
    editUser: async (_, { input }, contextValue) => {
      try {
        const { fullname, email, password, avatar } = input;

        const user = await User.findById(contextValue.user._id);
        // Check if the email is already in use
        const existingUser = await User.findOne({ email });

        if (existingUser && user.email != email) {
            throw new ApolloError(`Email is already in use ${email}`, "USER_ALREADY_EXIST");
        }
      
        // Image upload
        let buffer = null
        if(avatar){
          const bufferClient = Buffer.from(avatar.data);
   
          buffer = await sharp(bufferClient)
            .resize({ height: 50, width: 50, fit: 'cover' })
            .toFormat('png') // Convert to png format
            .png({ quality: 80 })
            .toBuffer()
        }
          // End Image upload

        // Build update object
        let updateObj = {};
        if (fullname) updateObj.fullname = fullname;
        if (email) updateObj.email = email;
        if (password) updateObj.password = await bcrypt.hash(password, 10);;
        if (avatar) updateObj.avatar = buffer;

        // Update user
        const userUpdated = await User.findByIdAndUpdate(
          contextValue.user._id,
          { $set: updateObj },
          { new: true }
        );
        await userUpdated.populateCollaborators()

        return userUpdated

      } catch (error) {
          throw new Error("Failed to update user: " + error.message);
      }
    },
  },
};
