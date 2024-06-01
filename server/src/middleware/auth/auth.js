import { ApolloError } from 'apollo-server-express';
import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET, MODE } from '../../config/index.js'

/* Use authenticateUser in the context to authenticate users within GraphQL resolvers. This allows you to protect specific resolvers or mutations that require user authentication. */
/* User logs in: When the user logs in, the server generates and sends both an access token and a refresh token to the client. The access token is short-lived, while the refresh token is long-lived.

Making authenticated requests: The client sends the access token in the Authorization header to make authenticated requests.

Access token expires: Access tokens are short-lived. When the access token expires, the client uses the refresh token to request a new access token.

Refreshing the token: If the refresh token is valid, the server issues a new access token (and possibly a new refresh token), and the client can continue to make authenticated requests with the new access token. */

// REMEMBER DON'T MAKE AS A PROMISE WITH ASYNC
const authenticateUser = (req) => {

    const authHeader = req.headers.authorization
    
    if (authHeader) {
        const token = authHeader.split('Bearer ')[1];
        //console.log('token', token);
        if (token) {
            try {
                const user = jwt.verify(token, ACCESS_TOKEN_SECRET);
                //console.log("User authenticated:", user); // log the authenticated user   
              
                return user;
            } catch (error) {
                //console.error("Token verification error:", error);
                // Custom error code specified as the third argument to ApolloError
                throw new ApolloError('Invalid or expired token', 'UNAUTHENTICATED'); 
            }
        } else {
            //console.error("Token format error: Authentication token must be 'Bearer [token]'"); // log format issue
            throw new ApolloError('Authentication token must be \'Bearer [token]\'');
        }
    } else {
       //console.error("Authorization header missing"); // log missing header
        throw new ApolloError('Authorization header must be provided');
    }
};

export default authenticateUser;
