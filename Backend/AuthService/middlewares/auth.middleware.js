import jwt from 'jsonwebtoken';
import redisClient from '../services/redis.service.js';
import User from '../models/user.model.js';


// Middleware to authenticate user using access token
// This middleware checks if the user is authenticated by verifying the access token
// If the token is valid, it adds the user information to the request object
// If the token is invalid or expired, it returns an error response
export const authUser = async (req, res, next) => {
    try {
        // console.log("cookies:", req.cookies);

        // const refreshToken = req.cookies.refreshToken;
        const accessToken = req.cookies.accessToken;

        // console.log("refreshToken:", refreshToken);
        // console.log("accessToken:", accessToken);

        // Check token present or not?
        if(!accessToken) {
            return res.status(401).json({ message: "Unauthorized!!" });
        }

        // Check blacklist (logout / revoked token)
        const isBlackListed = await redisClient.get(accessToken)
        if (isBlackListed) {
            res.clearCookie("accessToken");
            res.clearCookie("refreshToken");
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Verify JWT token
        const decodedToken = jwt.verify(accessToken, process.env.JWT_SECRET);

        // Fetch fresh user from DB (IMPORTANT)
        const user = await User.findById(decodedToken._id).select(
            "_id name email role isActive"
        );

        if (!user || user.isActive === false) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        req.user = user;

        next();
    } catch (error) {
        console.error("Auth error:", error.message);
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        return res.status(401).json({ message: "Unauthorized" });
    }
}