import User from "../models/user.model.js";

// Middleware to check if user account is active
// This middleware checks if the user account is active before allowing access to protected routes
// If the user account is inactive, it returns a 403 Forbidden response
export const isActiveUser = async (req, res, next) => {
    try {
        const user = await User.findOne({
            $or: [
                { _id: req.user?._id },
                { email: req.body?.email }
            ]
        });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if (!user.isActive) {
            return res.status(403).json({ error: "User account is deactivated!!" });
        }

        next();
    } catch (error) {
        console.error("Error in isActiveUser middleware:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}