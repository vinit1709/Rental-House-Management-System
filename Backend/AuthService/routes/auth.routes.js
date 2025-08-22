import { Router } from 'express'
import { body } from 'express-validator'
import * as authController from '../controllers/auth.controller.js';
import * as authMiddleware from '../middlewares/auth.middleware.js';
import * as isActiveMiddleware from '../middlewares/isActive.middleware.js';

const router = Router();

router.post('/register',
    body("name").isLength({ min: 3 }).withMessage('Name must be at least 3 characters long'),
    body("email").isEmail().withMessage("Please fill a valid email address"),
    body("phone").isMobilePhone().withMessage("Please fill a valid phone number"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
    body("role").isLength({ min: 5 }).withMessage("Please select role"),
    authController.register);

router.post('/login',
    body("email").isEmail().withMessage("Please fill a valid email address"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
    isActiveMiddleware.isActiveUser, authController.login);

router.post('/google', authController.googleAuth);

// Secure routes
router.get('/profile', authMiddleware.authUser, isActiveMiddleware.isActiveUser, authController.profile);
router.get('/logout', authMiddleware.authUser, isActiveMiddleware.isActiveUser, authController.logout);

router.put('/reset-password',
    body("oldPassword").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
    body("newPassword").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
    authMiddleware.authUser, isActiveMiddleware.isActiveUser, authController.resetPassword);

router.put('/update-profile', authMiddleware.authUser, isActiveMiddleware.isActiveUser, authController.updateProfile);
router.put('/deactivate-account', authMiddleware.authUser, isActiveMiddleware.isActiveUser, authController.deactivateAccount);


router.post('/refresh-token', authController.refreshAccessToken);

export default router;