import { Router } from 'express';
import { body } from 'express-validator';
import * as emailController from '../controllers/email.controller.js';

const router = Router();

router.post('/send-email',
    body("to").isEmail().withMessage("Please provide a valid email address"),
    body("subject").notEmpty().withMessage("Subject cannot be empty"),
    body("templateName").notEmpty().withMessage("Template name cannot be empty"),
    body("data").isObject().withMessage("Data must be an object"),
    emailController.sendEmailController);

export default router;