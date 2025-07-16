import User from '../models/user.model.js';
import * as authService from '../services/auth.service.js';
import { validationResult } from 'express-validator';
import redisClient from '../services/redis.service.js';


export const register = async (req, res) => {

    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    try {
        const { name, email, phone, password, role } = req.body;

        // Create new user
        const user = await authService.createUser({ name, email, phone, password, role });

        // Generate JWT token
        const token = await user.generateAuthToken();

        delete user._doc.password;

        res.status(201).json({
            message: "User registered successfully...",
            user, token
        });
    } catch (error) {
        console.error("Error during registration:", error.message);
        res.status(500).json({ message: error.message });
    }
}

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
            return res.status(401).json({ errors: 'Invalid credentials!!' });
        }

        // Validate user password
        const isValidPassword = await user.comparePassword(password);
        if (!isValidPassword) {
            return res.status(401).json({ errors: 'Invalid credentials!!' });
        }

        // Generate token
        const token = await user.generateAuthToken();

        delete user._doc.password;

        return res.status(200).json({
            message: "Login successfully...",
            user, token
        })
    } catch (error) {
        console.error("Error during login:", error.message);
        res.status(500).json({ message: error.message });
    }
}

export const profile = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.user.email });
        if(!user) {
            res.status(401).json({ errors: "Unauthorize User!!"})
        }

        return res.status(200).json({ user });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: error.message });
    }
}

export const logout = async (req, res) => {
    try {
        const token = req.cookies.token || req.header('Authorization').replace('bearer ', '');

        redisClient.set(token, 'logout', 'EX', 60 * 60 * 24);

        return res.status(200).json({ message: "Logout successfully..."});
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: error.message });
    }
}