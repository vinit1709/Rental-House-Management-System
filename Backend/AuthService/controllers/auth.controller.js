import User from '../models/user.model.js';
import * as authService from '../services/auth.service.js';
import { validationResult } from 'express-validator';
import redisClient from '../services/redis.service.js';
import jwt from 'jsonwebtoken';
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
        res.status(500).json({ message: error.message });
    }
}

// Register a new user
// POST http://localhost:3001/auth/register
// Take name, email, phone, password, role from request body
// Check if user already exists or not
// Return user details and access token
export const register = async (req, res) => {

    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    try {
        // const { name, email, phone, password, role } = req.body;
        const { name, email, password, role } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "Email already exists!!" });
        }

        // Create new user
        // const user = await authService.createUser({ name, email, phone, password, role });
        const user = await authService.createUser({ name, email, password, role });

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
            templateName: "registrationSuccess",
            data:{
                name: user.name,
                email: user.email,
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
            user: user, accessToken
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

        // Find user by email
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials!!' });
        }

        // Validate user password
        const isValidPassword = await user.comparePassword(password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid credentials!!' });
        }

        // Generate Access token & Refresh token
        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

        const options = {
            httpOnly: true,
            secure: false, // Set to true in production
            // secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
        };

        delete user._doc.password;

        try {
            await axios.post(`${process.env.BACK_GATE_URL}/notification/send-email`, {
            to: user.email,
            subject: "Login Successful!!",
            templateName: "loginSuccess",
            data:{
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
            user: user, accessToken
        })
    } catch (error) {
        console.error("Error during login:", error.message);
        res.status(500).json({ message: error.message });
    }
}

// Google Login
// POST http://localhost:3001/auth/google
export const googleAuth = async (req, res) => {
    try {
        const { code } = req.query;
        const googleResponse = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(googleResponse.tokens);

        const userResponse = await axios.get(`https://www.googleapis.com/oauth2/v2/userinfo?alt=json&access_token=${googleResponse.tokens.access_token}`);
        const { email, name } = userResponse.data;

        let user = await User.findOne({ email });
        if (!user) {
            // If user does not exist, create a new user with a random password
            const randomPassword = Math.random().toString(36).slice(-8);
            user = await authService.createUser({ name, email, password: randomPassword, role: 'tenant', phone: '0000000000' });
        }
        // Generate Access token & Refresh token
        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: 'strict',
        };

        try {
            await axios.post(`${process.env.BACK_GATE_URL}/notification/send-email`, {
            to: user.email,
            subject: "Google authentication successfully!!",
            templateName: "googleSuccess",
            data:{
                name: user.name,
                email: user.email,
                date: new Date().toLocaleString(),
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
            message: "Google authentication successfully...",
            user: user, accessToken
        });
    } catch (error) {
        console.error("Error during google login:", error.message);
        res.status(500).json({ message: error.message });
    }
}

// Get user profile
// GET http://localhost:3001/auth/profile
// Requires authentication
// Return user details without password
export const profile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if(!user) {
            res.status(401).json({ errors: "Unauthorize User!!"})
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
        const token = req.cookies?.accessToken || req.header('Authorization').replace('bearer ', '');

        redisClient.set(token, 'logout', 'EX', 60 * 60 * 24); // 24 hours expiration

        return res
        .status(200)
        .clearCookie("accessToken")
        .clearCookie("refreshToken")
        .json({ message: "Logout successfully..."});
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

        const user = await User.findById(decodedToken._id);
        if (!user) {
            return res.status(401).json({ errors: "User not found!!" });
        }

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: 'strict',
        };

        // Generate new access token and refresh token
        const { accessToken } = await generateAccessAndRefreshTokens(user._id);

        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
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
        const { name, phone, role } = req.body;

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(401).json({ errors: "Unauthorize User!!" });
        }

        // Update user details
        user.name = name || user.name;
        user.phone = phone || user.phone;
        user.role = role || user.role;

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