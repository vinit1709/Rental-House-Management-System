import { Router } from 'express'
import { body } from 'express-validator'
import * as authController from '../controllers/auth.controller.js';
import * as authMiddleware from '../middlewares/auth.middleware.js';
import * as isActiveMiddleware from '../middlewares/isActive.middleware.js';
import * as authorizeMiddleware from '../middlewares/authorize.middleware.js';
import * as uploadMiddleware from '../middlewares/upload.middleware.js'

const router = Router();

/* =========================
   Local Authentication
========================= */
// Register new user
router.post('/register',
    body("name").isLength({ min: 3 }).withMessage('Name must be at least 3 characters long'),
    body("email").isEmail().withMessage("Please fill a valid email address"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
    body("role").isIn(["tenant", "landlord", "admin"]).withMessage("Please select role"),
    authController.register);

// Login user
router.post('/login',
    body("email").isEmail().withMessage("Please fill a valid email address"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
    isActiveMiddleware.isActiveUser, authController.login);

// POST /auth/verify-identity
// User uploads their Government ID for review
router.post(
    '/verify-identity',
    authMiddleware.authUser, // Or whatever your auth middleware is named
    uploadMiddleware.uploadIdentityDoc.single('document'),
    authController.verifyIdentity
);

/* =========================
   Public Recovery & Verification
========================= */
// Verify email using OTP
router.post('/verify-email',
    body("email").isEmail().withMessage("Please fill a valid email address"),
    body("otp").notEmpty().withMessage("OTP is required"),
    authController.verifyEmail);

// Forgot password - Request OTP
router.post('/forgot-password',
    body("email").isEmail().withMessage("Please fill a valid email address"),
    authController.forgotPassword);

// Reset password using OTP
router.post('/reset-password',
    body("email").isEmail().withMessage("Please fill a valid email address"),
    body("otp").notEmpty().withMessage("OTP is required"),
    body("newPassword").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
    authController.resetPasswordWithOTP);

/* =========================
   Google Authentication
========================= */
// Google login / detect new user
router.get('/google', authController.startGoogleAuth);
router.get('/google/callback', authController.googleAuthCallback);

// Complete registration for new Google user
router.post('/google/complete-profile', authController.completeGoogleProfile);

/* =========================
   Secure Routes (Logged In Users)
========================= */
// Get current logged-in user's profile
router.get('/me', authMiddleware.authUser, isActiveMiddleware.isActiveUser, authController.profile);

// Update current user's profile
router.put('/me',
    body("name").optional().isLength({ min: 3 }).withMessage('Name must be at least 3 characters long'),
    body("phone").optional().isMobilePhone().withMessage('Please fill a valid phone number'),
    authMiddleware.authUser,
    isActiveMiddleware.isActiveUser,
    authController.updateProfile);

// Logout
router.post('/logout', authMiddleware.authUser, isActiveMiddleware.isActiveUser, authController.logout);

// Change password (authenticated)
router.put('/change-password',
    body("oldPassword").isLength({ min: 6 }).withMessage("Old Password must be at least 6 characters long"),
    body("newPassword").isLength({ min: 6 }).withMessage("New Password must be at least 6 characters long"),
    authMiddleware.authUser, isActiveMiddleware.isActiveUser, authController.resetPassword);

// Deactivate account
router.put('/deactivate-account', authMiddleware.authUser, isActiveMiddleware.isActiveUser, authController.deactivateAccount);

// Refresh access token
router.post('/refresh-token', authController.refreshAccessToken);

/* =========================
   Admin Only Routes
========================= */
// Add this with your other Admin routes!
router.get('/admin/stats',
    authMiddleware.authUser,
    authorizeMiddleware.authorizeRoles('admin'),
    authController.getAdminUserStats);

// Get all registered users with pagination and filters
router.get('/admin/users',
    authMiddleware.authUser,
    isActiveMiddleware.isActiveUser,
    authorizeMiddleware.authorizeRoles('admin'),
    authController.getAllUsers);

// Get specific user details by ID
router.get('/admin/users/:id',
    authMiddleware.authUser,
    isActiveMiddleware.isActiveUser,
    authorizeMiddleware.authorizeRoles('admin'),
    authController.getUserById);

// GET pending verification
router.get(
    '/admin/verifications/pending',
    authMiddleware.authUser,
    authorizeMiddleware.authorizeRoles('admin'),
    authController.getPendingVerifications
);

// Admin approves or rejects the uploaded ID
router.put(
    '/admin/verify-user/:id',
    authMiddleware.authUser,
    isActiveMiddleware.isActiveUser,
    authorizeMiddleware.authorizeRoles('admin'), // Ensure only admins can hit this
    authController.reviewUserIdentity
);

// Suspend, activate, or ban a user account
router.put('/admin/users/:id/status',
    body("status").isIn(["active", "suspended", "banned"]).withMessage("Invalid status"),
    authMiddleware.authUser,
    isActiveMiddleware.isActiveUser,
    authorizeMiddleware.authorizeRoles('admin'),
    authController.updateUserStatus);

// Permanently delete a user account
router.delete('/admin/users/:id',
    authMiddleware.authUser,
    isActiveMiddleware.isActiveUser,
    authorizeMiddleware.authorizeRoles('admin'),
    authController.deleteUser);

export default router;