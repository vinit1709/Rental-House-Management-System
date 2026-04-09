import { Router } from 'express';
import { body } from 'express-validator';
import * as leaseController from '../controllers/lease.controller.js';

// Import your shared middlewares (Adjust paths if yours are different)
import * as authMiddleware from '../middlewares/auth.middleware.js';
import * as authorizeMiddleware from '../middlewares/authorize.middleware.js';
import * as uploadMiddleware from '../middlewares/upload.middleware.js';

const router = Router();

// ==========================================
// 1. Create a Lease Draft (Landlord Only)
// ==========================================
router.post(
    '/',
    authMiddleware.authUser,
    authorizeMiddleware.authorizeRoles('landlord'), // Only landlords can draft a lease
    body('applicationId').notEmpty().withMessage('Application ID is required'),
    body('startDate').isISO8601().withMessage('Valid start date is required'),
    body('endDate').isISO8601().withMessage('Valid end date is required'),
    body('monthlyRent').isNumeric().withMessage('Monthly rent must be a number'),
    body('securityDeposit').isNumeric().withMessage('Security deposit must be a number'),
    body('rentDueDay').isInt({ min: 1, max: 31 }).withMessage('Rent due day must be between 1 and 31'),
    leaseController.createLease
);

// ==========================================
// 2. Get All Leases for Logged-in User
// ==========================================
// This route works for BOTH Landlords and Tenants!
router.get(
    '/',
    authMiddleware.authUser,
    authorizeMiddleware.authorizeRoles('landlord', 'tenant'),
    leaseController.getMyLeases
);

// ==========================================
// 3. Digitally Sign a Lease
// ==========================================
// Both Landlords and Tenants use this endpoint to apply their signature
router.put(
    '/:id/sign',
    authMiddleware.authUser,
    authorizeMiddleware.authorizeRoles('landlord', 'tenant'),
    leaseController.signLease
);

// ==========================================
// 4. Get a Single Lease by ID
// ==========================================
router.get(
    '/:id',
    authMiddleware.authUser,
    authorizeMiddleware.authorizeRoles('landlord', 'tenant'),
    leaseController.getLeaseById
);

// ==========================================
// 5. Terminate an Active Lease
// ==========================================
router.put(
    '/:id/terminate',
    authMiddleware.authUser,
    authorizeMiddleware.authorizeRoles('landlord'),
    leaseController.terminateLease
);

// ==========================================
// 6. Renew a Lease (Creates a new draft based on the old one)
// ==========================================
router.put(
    '/:id/renew',
    authMiddleware.authUser,
    authorizeMiddleware.authorizeRoles('landlord'),
    body('newStartDate').isISO8601().withMessage('Valid start date is required'),
    body('newEndDate').isISO8601().withMessage('Valid end date is required'),
    body('newMonthlyRent').isNumeric().withMessage('Monthly rent must be a number'),
    body('newSecurityDeposit').isNumeric().withMessage('Security deposit must be a number'),
    leaseController.renewLease
);

// ==========================================
// 7. Upload documents to a lease
// ==========================================
router.post(
    '/:id/document',
    authMiddleware.authUser,
    authorizeMiddleware.authorizeRoles('landlord', 'tenant'),
    uploadMiddleware.uploadLeaseDoc.single('document'),
    leaseController.uploadLeaseDocument
);

// ==========================================
// 8. Get all documents attached to a lease
// ==========================================
router.get(
    '/:id/documents',
    authMiddleware.authUser,
    authorizeMiddleware.authorizeRoles('landlord', 'tenant'),
    leaseController.getLeaseDocuments
);

// ==========================================
// 9. Download lease agreement as PDF
// ==========================================
router.get(
    '/:id/download-pdf',
    authMiddleware.authUser,
    authorizeMiddleware.authorizeRoles('landlord', 'tenant'),
    leaseController.downloadLeasePDF
);

// ==========================================
// 10. Delete an uploaded document
// ==========================================
router.delete(
    '/document/:docId',
    authMiddleware.authUser,
    authorizeMiddleware.authorizeRoles('landlord', 'tenant'),
    leaseController.deleteLeaseDocument
);

// ==========================================
// 11.1 Add this with your other Admin routes!
// ==========================================
router.get('/admin/stats',
    authMiddleware.authUser,
    authorizeMiddleware.authorizeRoles('admin'),
    leaseController.getAdminLeaseStats);

// ==========================================
// 11. Admin Only: Get all leases across the platform
// ==========================================
router.get(
    '/admin/all',
    authMiddleware.authUser,
    authorizeMiddleware.authorizeRoles('admin'),
    leaseController.getAdminAllLeases
);

// ==========================================
// 12. Admin Only: Get leases expiring in next 30 days
// ==========================================
router.get(
    '/admin/expiring/soon',
    authMiddleware.authUser,
    authorizeMiddleware.authorizeRoles('admin'),
    leaseController.getExpiringLeases
);



export default router;