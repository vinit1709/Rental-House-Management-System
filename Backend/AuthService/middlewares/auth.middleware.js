import jwt from 'jsonwebtoken';
import redisClient from '../services/redis.service.js';
import User from '../models/user.model.js';


// Middleware to authenticate user using access token
// This middleware checks if the user is authenticated by verifying the access token
// If the token is valid, it adds the user information to the request object
// If the token is invalid or expired, it returns an error response
export const authUser = async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken;

        // Check token present or not?
        if(!token) {
            return res.status(401).json({ error: 'Unauthorize User!!' });
        }

        // Check token is black listed
        const isBlackListed = await redisClient.get(token)
        if (isBlackListed) {
            res.cookie('accessToken', '', { maxAge: 0 });
            return res.status(401).json({ error: 'Unauthorize User!!' });
        }

        // Decode token
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decodedToken;
        next();
    } catch (error) {
        console.error("Authentication error:","accessToken " + error.message);
        res.clearCookie('accessToken');
        return res.status(401).json({ error: 'Unauthorize User!!' });
    }
}