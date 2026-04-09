import User from '../models/user.model.js';
import * as authService from '../services/auth.service.js';
import { validationResult } from 'express-validator';
import redisClient from '../services/redis.service.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import axios from 'axios'
import os from 'os';
import useragent from 'useragent';
import { oauth2Client } from '../utils/googleConfig.js';


// Get local IP address
function getLocalIpAddress() {
    const networkInterfaces = os.networkInterfaces();
    let localIpAddress = 'N/A';

    for (const interfaceName in networkInterfaces) {
        const networkInterface = networkInterfaces[interfaceName];
        for (const addressInfo of networkInterface) {
            // Filter for IPv4 addresses that are not internal (loopback)
            if (addressInfo.family === 'IPv4' && !addressInfo.internal) {
                localIpAddress = addressInfo.address;
                // Assuming the first non-internal IPv4 address is the desired one
                return localIpAddress;
            }
        }
    }
    return localIpAddress;
}


// Generate access token and refresh token for a user
// This function is used to generate access token and refresh token for a user
// It takes userId as parameter and returns access token and refresh token
// It also saves the refresh token in the user document
const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };

    } catch (error) {
        console.error("Error generating tokens:", error.message);
        // Throw the error so callers can handle it appropriately
        throw new Error(error.message);
    }
}

/* =========================================================
   Public Recovery & Verification (Email & Forgot Password)
========================================================= */

// Register a new user
// POST http://localhost:3001/auth/register
// Take name, email, password, role from request body
// Check if user already exists or not
// Return user details and access token
export const register = async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    try {
        const { name, email, password, role } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "Email already exists!!" });
        }

        const user = await authService.createUser({ name, email, password, role });

        // Generate 6-digit OTP for Email Verification
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Store OTP in Redis (valid for 15 minutes)
        await redisClient.set(`verifyOTP:${user.email}`, otp, 'EX', 15 * 60);

        // Generate Access token & Refresh token
        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: 'strict',
        };

        delete user._doc.password;

        try {
            await axios.post(`${process.env.BACK_GATE_URL}/notification/send-email`, {
                to: user.email,
                subject: "Welcome to Rental House Management System",
                templateName: "emailVerificationOTP",
                data: {
                    name: user.name,
                    otp: otp, // Pass the OTP to the email template
                    date: new Date().toLocaleString(),
                }
            });
        } catch (emailError) {
            console.warn("Email notification failed:", emailError.message);
        }

        return res.
            status(201)
            .cookie("refreshToken", refreshToken, options)
            .cookie("accessToken", accessToken, options)
            .json({
                message: "Registration successfully...",
                user: user, accessToken, refreshToken
            });
    } catch (error) {
        console.error("Error during registration:", error.message);
        res.status(500).json({ message: error.message });
    }
}

// Login a user
// POST http://localhost:3001/auth/login
// Take email and password from request body
// Check email and password are valid or not
// If valid, return user details and access token
export const login = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    try {
        const { email, password } = req.body;
        // console.log(email, password);

        // Find user by email
        const user = await User.findOne({ email }).select('+password');
        if (!user || user.authProvider !== 'local') {
            return res.status(401).json({ message: 'Invalid credentials!!' });
        }

        // Validate user password
        const isValidPassword = await user.comparePassword(password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid credentials!!' });
        }

        // Update last login timestamp
        user.lastLogin = Date.now();
        await user.save({ validateBeforeSave: false });

        // Generate Access token & Refresh token
        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
        };

        delete user._doc.password;

        try {
            await axios.post(`${process.env.BACK_GATE_URL}/notification/send-email`, {
                to: user.email,
                subject: "Login Successful!!",
                templateName: "loginSuccess",
                data: {
                    name: user.name,
                    date: new Date().toLocaleString(),
                    ip: getLocalIpAddress(),
                    device: useragent.parse(req.headers['user-agent']).device.family,
                    os: useragent.parse(req.headers['user-agent']).os.toString(),
                    browser: useragent.parse(req.headers['user-agent']).toAgent(),
                }
            });
        } catch (emailError) {
            console.warn("Email notification failed:", emailError.message);
        }

        return res
            .status(200)
            .cookie("refreshToken", refreshToken, options)
            .cookie("accessToken", accessToken, options)
            .json({
                message: "Login successfully...",
                user: user, accessToken, refreshToken
            })
    } catch (error) {
        console.error("Error during login:", error.message);
        res.status(500).json({ message: error.message });
    }
}

// 1. User Uploads Identity Document
// POST http://localhost:3001/auth/verify-identity
export const verifyIdentity = async (req, res) => {
    try {
        const userId = req.user._id;
        const { idType } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: "Please upload an identity document." });
        }
        if (!idType) {
            return res.status(400).json({ message: "Please specify the ID Type (e.g., Aadhar, PAN)." });
        }

        const documentUrl = req.file.path; // Secured Cloudinary URL from multer

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                identityDocument: documentUrl,
                idType: idType,
                verificationStatus: 'pending',
                verificationMessage: null // Clear previous rejection notes
            },
            { new: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found." });
        }

        return res.status(200).json({
            message: "Document uploaded successfully. Verification is pending.",
            user: updatedUser
        });

    } catch (error) {
        console.error("Error uploading identity document:", error.message);
        res.status(500).json({ message: error.message });
    }
};

// Verify Email with OTP
// POST http://localhost:3001/auth/verify-email
export const verifyEmail = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const { email, otp } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });
        if (user.isEmailVerified) return res.status(400).json({ message: "Email is already verified" });

        // Retrieve the OTP stored in Redis
        const storedOTP = await redisClient.get(`verifyOTP:${email}`);

        if (!storedOTP) {
            return res.status(400).json({ message: "OTP is invalid or has expired. Please request a new one." });
        }

        // Compare the submitted OTP with the one in Redis
        if (storedOTP !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        // Mark user as verified
        user.isEmailVerified = true;
        await user.save();

        // Clean up the used OTP from Redis
        await redisClient.del(`verifyOTP:${email}`);

        return res.status(200).json({ message: "Email verified successfully!" });
    } catch (error) {
        console.error("Error verifying email:", error.message);
        res.status(500).json({ message: error.message });
    }
};

// Request Password Reset OTP
// POST http://localhost:3001/auth/forgot-password
export const forgotPassword = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user || user.authProvider !== 'local') {
            return res.status(404).json({ message: "Local user with this email not found" });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedOTP = await bcrypt.hash(otp, 10); // Hashing as per your DB schema doc

        user.resetOTP = hashedOTP;
        user.resetOTPExpiry = Date.now() + 15 * 60 * 1000; // 15 mins expiry
        await user.save();

        // Send OTP via Notification Service
        try {
            await axios.post(`${process.env.BACK_GATE_URL}/notification/send-email`, {
                to: user.email,
                subject: "Password Reset OTP",
                templateName: "forgotPasswordOTP",
                data: { name: user.name, otp: otp }
            });
        } catch (emailError) {
            console.warn("OTP Email notification failed:", emailError.message);
        }

        return res.status(200).json({ message: "Password reset OTP sent to your email" });
    } catch (error) {
        console.error("Error sending forgot password OTP:", error.message);
        res.status(500).json({ message: error.message });
    }
};

// Reset Password using OTP
// POST http://localhost:3001/auth/reset-password
export const resetPasswordWithOTP = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const { email, otp, newPassword } = req.body;

        const user = await User.findOne({ email }).select('+resetOTP +resetOTPExpiry +password');
        if (!user) return res.status(404).json({ message: "User not found" });

        // Check expiry
        if (!user.resetOTPExpiry || user.resetOTPExpiry < Date.now()) {
            return res.status(400).json({ message: "OTP has expired. Please request a new one." });
        }

        // Validate OTP
        const isValidOTP = await bcrypt.compare(otp, user.resetOTP);
        if (!isValidOTP) return res.status(400).json({ message: "Invalid OTP" });

        // Update password
        user.password = await User.hashPassword(newPassword); // Assuming hashPassword is a static method in your model
        user.resetOTP = undefined;
        user.resetOTPExpiry = undefined;
        await user.save();

        return res.status(200).json({ message: "Password reset successfully! You can now log in." });
    } catch (error) {
        console.error("Error resetting password via OTP:", error.message);
        res.status(500).json({ message: error.message });
    }
};

// Google
// POST http://localhost:3001/auth/google
export const startGoogleAuth = (req, res) => {
    const url = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: [
            "https://www.googleapis.com/auth/userinfo.profile",
            "https://www.googleapis.com/auth/userinfo.email"
        ],
        prompt: "consent"
    });

    res.redirect(url);
};

// Google Login
// POST http://localhost:3001/auth/google/callback
export const googleAuthCallback = async (req, res) => {
    try {
        const { code } = req.query;
        if (!code) {
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=google_failed`);
        }

        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        const { data } = await axios.get(
            `https://www.googleapis.com/oauth2/v2/userinfo`,
            { headers: { Authorization: `Bearer ${tokens.access_token}` } }
        );

        const { email, name, id: googleId } = data;

        let user = await User.findOne({ $or: [{ googleId }, { email }] });
        // console.log("Found user:", user);

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: 'strict',
        };

        if (!user) {
            // New Google user → role selection required
            return res.redirect(
                `${process.env.FRONTEND_URL}/select-role?googleId=${googleId}&email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}`
            );
        }

        // Update last login timestamp
        user.isEmailVerified = true;
        user.authProvider = "google";
        user.lastLogin = Date.now();
        await user.save({ validateBeforeSave: false });

        // Existing user → login
        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

        try {
            await axios.post(`${process.env.BACK_GATE_URL}/notification/send-email`, {
                to: user.email,
                subject: "Login Successful!!",
                templateName: "loginSuccess",
                data: {
                    name: user.name,
                    date: new Date().toLocaleString(),
                    ip: getLocalIpAddress(),
                    device: useragent.parse(req.headers['user-agent']).device.family,
                    os: useragent.parse(req.headers['user-agent']).os.toString(),
                    browser: useragent.parse(req.headers['user-agent']).toAgent(),
                }
            });
        } catch (emailError) {
            console.warn("Email notification failed:", emailError.message);
        }

        return res
            .cookie("refreshToken", refreshToken, options)
            .cookie("accessToken", accessToken, options)
            .redirect(`${process.env.FRONTEND_URL}/`);

    } catch (error) {
        console.error("Google auth error:", error.message);
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=google_failed`);
    }
}

// Google New Registration
// POST http://localhost:3001/auth/google/complete-profile
export const completeGoogleProfile = async (req, res) => {
    try {
        const { googleId, email, name, role } = req.body;

        // console.log("completeGoogleProfile body:", googleId, email, name, role);

        if (!googleId || !email || !name || !role) {
            return res.status(400).json({ message: "All fields are required!!" });
        }

        if (!["tenant", "landlord"].includes(role)) {
            return res.status(400).json({ message: "Invalid role" });
        }

        const user = await User.create({
            googleId,
            email,
            name,
            role,
            authProvider: "google",
            isEmailVerified: true,
            password: null
        });

        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

        try {
            await axios.post(`${process.env.BACK_GATE_URL}/notification/send-email`, {
                to: user.email,
                subject: "Welcome to Rental House Management System",
                templateName: "registrationSuccess",
                data: {
                    name: user.name,
                    email: user.email,
                    date: new Date().toLocaleString(),
                }
            });
        } catch (emailError) {
            console.warn("Email notification failed:", emailError.message);
        }

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: 'strict',
        };

        return res
            .status(201)
            .cookie("refreshToken", refreshToken, options)
            .cookie("accessToken", accessToken, options)
            .json({
                message: "Account created successfully..",
                user: user, accessToken, refreshToken
            });

    } catch (error) {
        console.error("Google profile completion error:", error.message);
        res.status(500).json({ message: "Profile completion failed" });
    }
}

// Get user profile
// GET http://localhost:3001/auth/profile
// Requires authentication
// Return user details without password
export const profile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(401).json({ errors: "Unauthorize User!!" });
        }

        return res.status(200).json({ user });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: error.message });
    }
}

// Logout user
// POST http://localhost:3001/auth/logout
// Requires authentication
// Check token and blacklist it in Redis
// Clear cookies and return success message
export const logout = async (req, res) => {
    try {
        const authHeader = req.header('Authorization') || '';
        const tokenFromHeader = authHeader.replace(/bearer\s+/i, '');
        const token = req.cookies?.accessToken || tokenFromHeader;

        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const decoded = jwt.decode(token);
        if (decoded?.exp) {
            const ttl = decoded.exp - Math.floor(Date.now() / 1000);

            if (ttl > 0) {
                await redisClient.set(token, "logout", "EX", ttl);
            }
        }

        // redisClient.set(token, 'logout', 'EX', 60 * 60 * 24); // 24 hours expiration

        return res
            .status(200)
            .clearCookie("accessToken")
            .clearCookie("refreshToken")
            .json({ message: "Logout successfully..." });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: error.message });
    }
}

// Refresh access token
// POST http://localhost:3001/auth/refresh-token
// Requires refresh token in cookies or request body
// Generate new access token if refresh token is valid
// Return new access token
export const refreshAccessToken = async (req, res) => {
    // console.log(req.cookies.refreshToken);
    // console.log(req.cookies.accessToken);

    const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken;
    // console.log("incomingRefreshToken:", incomingRefreshToken);

    if (!incomingRefreshToken) {
        return res.status(401).json({ errors: "Refresh token is required!!" });
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.JWT_SECRET);
        // console.log(decodedToken);

        const user = await User.findById(decodedToken._id);
        if (!user) {
            return res.status(401).json({ errors: "User not found!!" });
        }

        // Ensure the incoming refresh token matches stored refresh token (prevent reuse)
        if (!user.refreshToken || user.refreshToken !== incomingRefreshToken) {
            return res.status(401).json({ errors: "Invalid refresh token!!" });
        }

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: 'strict',
        };

        // Generate new access token and refresh token (rotates refresh token)
        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json({
                message: "Access token refreshed successfully...",
                accessToken
            });
    } catch (error) {
        console.error("Error refreshing access token:", error.message);
        res.status(500).json({ message: error.message });
    }
}

// Reset user password
// POST http://localhost:3001/auth/reset-password
// Requires authentication
// Take old password and new password from request body
// Validate old password and update to new password
// Return success message
export const resetPassword = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    try {
        const { oldPassword, newPassword } = req.body;

        const user = await User.findById(req.user._id).select('+password');
        if (!user) {
            return res.status(401).json({ errors: "Unauthorize User!!" });
        }

        if (user.authProvider !== 'local') {
            return res.status(400).json({
                message: "Password change not allowed for Google accounts"
            });
        }

        // Validate old password
        const isValidPassword = await user.comparePassword(oldPassword);
        if (!isValidPassword) {
            return res.status(401).json({ errors: "Invalid old password!!" });
        }

        // hash new password
        const hashedPassword = await User.hashPassword(newPassword);

        // Update password
        user.password = hashedPassword;
        await user.save();

        return res.status(200).json({ message: "Password reset successfully..." });
    } catch (error) {
        console.error("Error resetting password:", error.message);
        res.status(500).json({ message: error.message });
    }
}

// Update user profile
// PUT http://localhost:3001/auth/update-profile
// Requires authentication
// Take name, email, phone from request body
// Validate and update user details
export const updateProfile = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    try {
        const { name, phone } = req.body;

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(401).json({ errors: "Unauthorize User!!" });
        }

        // Update user details
        user.name = name || user.name;
        user.phone = phone || user.phone;
        // user.role = role || user.role;

        await user.save();

        return res.status(200).json({ message: "Profile updated successfully...", user });
    } catch (error) {
        console.error("Error updating profile:", error.message);
        res.status(500).json({ message: error.message });
    }
}


// Delete user account
// PUT http://localhost:3001/auth/deactivate-account
// Requires authentication
// Check if user exists and deactivate the account permanently
// Clear cookies and return success message
export const deactivateAccount = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(401).json({ errors: "Unauthorize User!!" });
        }

        // Delete user account
        await User.findByIdAndUpdate(req.user._id, { isActive: false });

        // Clear cookies
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');

        return res.status(200).json({ message: "Account deactivate successfully..." });
    } catch (error) {
        console.error("Error deleting account:", error.message);
        res.status(500).json({ message: error.message });
    }
}

/* =========================================================
   Admin Only Routes
========================================================= */

// Get User Statistics for Admin Dashboard
export const getAdminUserStats = async (req, res) => {
    try {
        const [totalUsers, totalLandlords, totalTenants, pendingVerifications] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ role: 'landlord' }),
            User.countDocuments({ role: 'tenant' }),
            User.countDocuments({ verificationStatus: 'pending' }) // Adjust this field name if your KYC status field is named differently
        ]);

        res.status(200).json({
            totalUsers,
            totalLandlords,
            totalTenants,
            pendingVerifications
        });
    } catch (error) {
        console.error("Error fetching user stats:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get all users with pagination and filters
// GET http://localhost:3001/auth/admin/users
export const getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Build filter object based on query params
        let filter = {};
        if (req.query.role) filter.role = req.query.role;
        if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';
        if (req.query.isSuspended !== undefined) filter.isSuspended = req.query.isSuspended === 'true';

        const users = await User.find(filter).select('-password').skip(skip).limit(limit);
        const total = await User.countDocuments(filter);

        return res.status(200).json({
            users,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalUsers: total
        });
    } catch (error) {
        console.error("Error fetching all users:", error.message);
        res.status(500).json({ message: error.message });
    }
};

// Get specific user by ID
// GET http://localhost:3001/auth/admin/users/:id
export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ message: "User not found" });

        return res.status(200).json({ user });
    } catch (error) {
        console.error("Error fetching user by ID:", error.message);
        res.status(500).json({ message: error.message });
    }
};

// GET pending verification document
// GET http://localhost:3001/auth/admin/verifications/pending
export const getPendingVerifications = async (req, res) => {
    try {
        // Find all users whose verification status is currently 'pending'
        const pendingUsers = await User.find({ verificationStatus: 'pending' })
            .select('name email role identityDocument idType verificationStatus updatedAt')
            .sort({ updatedAt: 1 }); // Oldest first (queue logic)

        return res.status(200).json({ users: pendingUsers });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch pending verifications", error: error.message });
    }
};

// Admin approves or rejects the uploaded ID
// PUT http://localhost:3001/auth/admin/verify-user/:id
export const reviewUserIdentity = async (req, res) => {
    try {
        const userId = req.params.id;
        const { status, message } = req.body; // status should be 'verified' or 'rejected'

        if (!['verified', 'rejected'].includes(status)) {
            return res.status(400).json({ message: "Invalid status. Must be 'verified' or 'rejected'." });
        }

        // Require a message if the admin rejects the document
        if (status === 'rejected' && !message) {
            return res.status(400).json({ message: "Please provide a reason for rejection." });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Update the user's verification state
        user.verificationStatus = status;
        user.isVerified = (status === 'verified'); // Only true if approved
        user.verificationMessage = status === 'rejected' ? message : null;

        await user.save();

        return res.status(200).json({
            message: `User identity has been ${status}.`,
            user: {
                _id: user._id,
                isVerified: user.isVerified,
                verificationStatus: user.verificationStatus,
                verificationMessage: user.verificationMessage
            }
        });

    } catch (error) {
        console.error("Error reviewing user identity:", error.message);
        res.status(500).json({ message: error.message });
    }
};

// Suspend, activate, or ban a user account
// PUT http://localhost:3001/auth/admin/users/:id/status
export const updateUserStatus = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const { status } = req.body; // Expects "active", "suspended", or "banned"
        const user = await User.findById(req.params.id);

        if (!user) return res.status(404).json({ message: "User not found" });

        if (status === 'active') {
            user.isActive = true;
            user.isSuspended = false;
        } else if (status === 'suspended') {
            user.isActive = true;
            user.isSuspended = true;
        } else if (status === 'banned') {
            user.isActive = false;
            user.isSuspended = true;
        }

        await user.save();
        return res.status(200).json({ message: `User status updated to ${status}`, user });
    } catch (error) {
        console.error("Error updating user status:", error.message);
        res.status(500).json({ message: error.message });
    }
};

// Permanently delete a user account
// DELETE http://localhost:3001/auth/admin/users/:id
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Optionally: You might want to trigger an event to delete associated properties/leases later
        return res.status(200).json({ message: "User permanently deleted" });
    } catch (error) {
        console.error("Error deleting user:", error.message);
        res.status(500).json({ message: error.message });
    }
};