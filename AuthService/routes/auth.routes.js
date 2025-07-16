import { Router } from 'express'
import { body } from 'express-validator'
import * as authController from '../controllers/auth.controller.js';
import * as authMiddleware from '../middlewares/auth.middleware.js';

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
    authController.login);

router.get('/profile', authMiddleware.authUser, authController.profile);

router.get('/logout', authMiddleware.authUser, authController.logout);

export default router;