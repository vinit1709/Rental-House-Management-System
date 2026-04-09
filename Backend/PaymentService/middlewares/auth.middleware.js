import jwt from 'jsonwebtoken';

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

        // Verify JWT token
        const decodedToken = jwt.verify(accessToken, process.env.JWT_SECRET);

        req.user = decodedToken;

        next();
    } catch (error) {
        console.error("Auth error:", error.message);
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        return res.status(401).json({ message: "Unauthorized" });
    }
}