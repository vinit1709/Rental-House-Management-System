import jwt from 'jsonwebtoken';
import redisClient from '../services/redis.service.js';

export const authUser = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.header('Authorization').replace('bearer ', '');

        // Check token present or not?
        if(!token) {
            return res.status(401).json({ error: 'Unauthorize User!!' });
        }

        // Check token is black listed
        const isBlackListed = await redisClient.get(token)
        if (isBlackListed) {
            res.cookies('token', '');
            return res.status(401).json({ error: 'Unauthorize User!!' });
        }

        // Decode token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Unauthorize User!!' });
    }
}