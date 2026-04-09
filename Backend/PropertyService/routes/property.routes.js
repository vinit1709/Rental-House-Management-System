import { Router } from "express";
import { body } from "express-validator";
import * as authMiddleware from "../middlewares/auth.middleware.js";
import * as authorizeMiddleware from "../middlewares/authorize.middleware.js";
import * as propertyController from "../controllers/property.controller.js";
// Assuming you have a multer middleware setup for file uploads
import * as uploadMiddleware from "../middlewares/upload.middleware.js";

const router = Router();

/* =========================
   Public Routes (Searching & Viewing)
========================= */
// Get all available properties with filters
router.get('/', propertyController.getAllProperties);

// Get single property details
router.get('/:id', propertyController.getPropertyById);


/* =========================
   Landlord Routes (Property Management)
========================= */
// Create new property listing
router.post('/',
    authMiddleware.authUser,
    authorizeMiddleware.authorizeRoles('landlord'),
    body("title").notEmpty(),
    body("type").isIn(['apartment', 'house', 'villa', 'pg', 'studio']),
    body("bhk").isNumeric(),
    body("rent").isFloat({ gt: 0 }),
    body("deposit").isFloat({ min: 0 }),
    body("furnishing").isIn(['unfurnished', 'semi', 'fully']),
    body('sqft').isNumeric().withMessage('Square footage must be a valid number'),
    body('address.country').notEmpty().withMessage('Country is required'),
    body('address.lat').optional().isNumeric(),
    body('address.lng').optional().isNumeric(),
    propertyController.createProperty
);

// Get all properties listed by logged-in landlord
router.get('/my/listings',
    authMiddleware.authUser,
    authorizeMiddleware.authorizeRoles('landlord'),
    propertyController.getMyListings
);

// Update existing property details
router.put('/:id',
    authMiddleware.authUser,
    authorizeMiddleware.authorizeRoles('landlord'),
    propertyController.updateProperty
);

// Delete a property listing
router.delete('/:id',
    authMiddleware.authUser,
    authorizeMiddleware.authorizeRoles('landlord'),
    propertyController.deleteProperty
);

// Upload property photos (max 10)
router.post('/:id/photos',
    authMiddleware.authUser,
    authorizeMiddleware.authorizeRoles('landlord'),
    uploadMiddleware.uploadPropertyImages.array('photos', 10),
    propertyController.uploadPropertyPhotos
);

// Delete a specific property photo
router.delete('/:id/photos/:photoId',
    authMiddleware.authUser,
    authorizeMiddleware.authorizeRoles('landlord'),
    propertyController.deletePropertyPhoto
);

// Toggle property availability (available/rented/inactive)
router.put('/:id/availability',
    authMiddleware.authUser,
    authorizeMiddleware.authorizeRoles('landlord'),
    body("status").isIn(['available', 'rented', 'inactive']),
    propertyController.updateAvailability
);

/* --- Custom Workflow: Verification Documents --- */
// Landlord uploads legal documents (lightbill, tax receipt)
router.post('/:id/documents',
    authMiddleware.authUser,
    authorizeMiddleware.authorizeRoles('landlord'),
    uploadMiddleware.uploadVerificationDocs.single('document'),
    propertyController.uploadVerificationDocument
);

// Landlord submits property (Moves status from 'draft' to 'pending' for admin review)
router.post('/:id/submit',
    authMiddleware.authUser,
    authorizeMiddleware.authorizeRoles('landlord'),
    propertyController.submitForVerification
);


/* =========================
   Visit Request Routes (Tenant & Landlord)
========================= */
// Tenant: Schedule a visit request
router.post('/:id/visit-request',
    authMiddleware.authUser,
    authorizeMiddleware.authorizeRoles('tenant'),
    body("visitDate").isISO8601(),
    propertyController.requestVisit
);

// Tenant: Get all my scheduled property visits
router.get('/my/visits',
    authMiddleware.authUser,
    authorizeMiddleware.authorizeRoles('tenant'),
    propertyController.getMyVisits
);

// Landlord: Get all visit requests for a specific property
router.get('/:id/visit-requests',
    authMiddleware.authUser,
    authorizeMiddleware.authorizeRoles('landlord'),
    propertyController.getPropertyVisits
);

// Landlord: Approve, reschedule, or reject a visit request
router.put('/visits/:visitId',
    authMiddleware.authUser,
    authorizeMiddleware.authorizeRoles('landlord'),
    body("status").isIn(['approved', 'rejected', 'rescheduled']),
    propertyController.updateVisitStatus
);


/* =========================
   Admin Only Routes
========================= */
// Add this with your other Admin routes!
router.get('/admin/stats',
    authMiddleware.authUser,
    authorizeMiddleware.authorizeRoles('admin'),
    propertyController.getAdminPropertyStats);

// Get all properties (including inactive/rejected/pending)
router.get('/admin/all',
    authMiddleware.authUser,
    authorizeMiddleware.authorizeRoles('admin'),
    propertyController.getAdminAllProperties
);

// Approve or reject a property listing (Checks uploaded documents)
router.put('/admin/:id/approve',
    authMiddleware.authUser,
    authorizeMiddleware.authorizeRoles('admin'),
    body("isApproved").isBoolean(),
    body("rejectionReason").optional().isString(),
    propertyController.adminApproveProperty
);

export default router;