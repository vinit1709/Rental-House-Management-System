import { Router } from 'express';
import * as tenantController from '../controllers/tenant.controller.js';
import * as authMiddleware from '../middlewares/auth.middleware.js';
import * as authorizeMiddleware from "../middlewares/authorize.middleware.js";

const router = Router();

// Add Single Application Route (Protected for both Landlord and Tenant)
router.get('/applications/:id',
    authMiddleware.authUser,
    authorizeMiddleware.authorizeRoles('tenant', 'landlord'),
    tenantController.getSingleApplication);

// --- Application Routes (Tenant) ---
router.post('/apply/:propertyId',
    authMiddleware.authUser,
    authorizeMiddleware.authorizeRoles('tenant'),
    tenantController.applyForProperty);

router.get('/my/applications',
    authMiddleware.authUser,
    authorizeMiddleware.authorizeRoles('tenant'),
    tenantController.getMyApplications);

router.delete('/applications/:id',
    authMiddleware.authUser,
    authorizeMiddleware.authorizeRoles('tenant'),
    tenantController.withdrawApplication);

// --- Application Routes (Landlord) ---
// Add this line:
router.get('/landlord/applications',
    authMiddleware.authUser,
    authorizeMiddleware.authorizeRoles('landlord'),
    tenantController.getAllLandlordApplications);

router.get('/property/:propertyId/applications',
    authMiddleware.authUser,
    authorizeMiddleware.authorizeRoles('landlord'),
    tenantController.getPropertyApplications);

router.put('/applications/:id/status',
    authMiddleware.authUser,
    authorizeMiddleware.authorizeRoles('landlord'),
    tenantController.updateApplicationStatus);

export default router;