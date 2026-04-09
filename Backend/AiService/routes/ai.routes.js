import { Router } from 'express';
import * as aiControllers from '../controllers/ai.controller.js';
import * as authMiddleware from '../middlewares/auth.middleware.js';
import * as authorizeMiddleware from '../middlewares/authorize.middleware.js';
import { body } from 'express-validator';
import multer from 'multer';

const router = Router();

// --- Setup Multer to store the uploaded image in memory ---
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/ai/rent-price
router.post('/rent-price',
    authMiddleware.authUser,
    authorizeMiddleware.authorizeRoles('landlord'),
    body("propertyType").isString().notEmpty().withMessage('Property type is required'),
    body('location').isString().notEmpty().withMessage('Location is required'),
    body('bhk').optional().isString().withMessage('BHK must be text'),
    body('furnishing').optional().isString().withMessage('Furnishing status must be text'),
    body('size').optional().isString().withMessage('Size must be text'),
    aiControllers.suggestRentPrice);

// --- NEW: POST /document-scan ---
// Notice we use upload.single('documentImage') to catch the file!
router.post('/document-scan',
    authMiddleware.authUser,
    upload.single('documentImage'), // This looks for a file attached to the key 'documentImage'
    aiControllers.scanDocument
);



export default router;