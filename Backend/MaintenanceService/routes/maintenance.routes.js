import { Router } from 'express';
import * as maintenanceController from '../controllers/maintenance.controller.js';
import * as authMiddleware from '../middlewares/auth.middleware.js';
import * as authorizeMiddleware from '../middlewares/authorize.middleware.js';
import * as uploadMiddleware from '../middlewares/upload.middleware.js';

const router = Router();

// ==========================================
// TENANT ROUTES
// ==========================================
// Create new maintenance request with description and photos
router.post('/',
    authMiddleware.authUser,
    authorizeMiddleware.authorizeRoles('tenant'),
    uploadMiddleware.upload.array('images', 3),
    maintenanceController.createRequest);

// Get all maintenance requests raised by tenant
router.get('/my/requests',
    authMiddleware.authUser,
    authorizeMiddleware.authorizeRoles('tenant'),
    maintenanceController.getMyRequests);

// Update maintenance request (before it is accepted)
router.put('/:id',
    authMiddleware.authUser,
    authorizeMiddleware.authorizeRoles('tenant'),
    maintenanceController.updateRequest);

// Cancel a pending maintenance request
router.delete('/:id',
    authMiddleware.authUser,
    authorizeMiddleware.authorizeRoles('tenant'),
    maintenanceController.deleteRequest);


// ==========================================
// LANDLORD ROUTES
// ==========================================
// Get all maintenance requests for landlord's properties
router.get('/landlord/requests',
    authMiddleware.authUser,
    authorizeMiddleware.authorizeRoles('landlord'),
    maintenanceController.getLandlordRequests);

// Update status: acknowledged, in-progress, resolved
router.put('/:id/status',
    authMiddleware.authUser,
    authorizeMiddleware.authorizeRoles('landlord'),
    maintenanceController.updateRequestStatus);

// Assign maintenance task to a worker/vendor
router.put('/:id/assign',
    authMiddleware.authUser,
    authorizeMiddleware.authorizeRoles('landlord'),
    maintenanceController.assignWorker);


// ==========================================
// SHARED / PROTECTED ROUTES (Both Tenant & Landlord)
// ==========================================
// Get single maintenance request details
router.get('/:id',
    authMiddleware.authUser,
    authorizeMiddleware.authorizeRoles('tenant'),
    maintenanceController.getRequestById);

// Add a comment/update to a maintenance request
router.post('/:id/comments',
    authMiddleware.authUser,
    authorizeMiddleware.authorizeRoles('tenant'),
    maintenanceController.addComment);

// Upload photos for a maintenance request
router.post('/:id/photos',
    authMiddleware.authUser,
    authorizeMiddleware.authorizeRoles('tenant'),
    maintenanceController.uploadPhotos);

// ==========================================
// ADMIN ROUTES
// ==========================================
// Get all maintenance requests platform-wide
router.get('/admin/all',
    authMiddleware.authUser,
    authorizeMiddleware.authorizeRoles('admin'),
    maintenanceController.getAdminAllRequests);

// Get maintenance statistics by status and priority
router.get('/admin/stats',
    authMiddleware.authUser,
    authorizeMiddleware.authorizeRoles('admin'),
    maintenanceController.getAdminStats);

export default router;