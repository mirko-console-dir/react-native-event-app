import jwt from 'jsonwebtoken';
import { AuthenticationError } from 'apollo-server-express';
/* Use checkNewToken middleware to protect routes or endpoints outside of GraphQL, ensuring that all incoming requests with tokens are valid and meet any additional conditions. */
const checkNewToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split('Bearer ')[1];
        
        if (token) {
            try {
                const decodedToken = jwt.verify(token, "UNSAFE_STRING");
        
                if (decodedToken.isNewToken) {
                    // Apply specific rules or actions for new tokens here
                    console.log(decodedToken.isNewToken);
                }
                
                req.user = decodedToken;
            } catch (err) {
                throw new AuthenticationError('Invalid/expired token');
            }
        }
    }
    next();
};

export default checkNewToken;
