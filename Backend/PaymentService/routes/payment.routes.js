import express from 'express';
import * as paymentController from '../controllers/payment.controller.js';

// Import your shared auth middlewares! (Adjust path if needed)
import * as authMiddleware from '../middlewares/auth.middleware.js';
import * as authorizeMiddleware from '../middlewares/authorize.middleware.js'

const router = express.Router();

// ==========================================
// 1. PUBLIC WEBHOOK (Razorpay Server-to-Server)
// ==========================================
// Razorpay hits this URL in the background to confirm payments. No auth needed!
router.post('/razorpay/webhook', paymentController.razorpayWebhook);


// ==========================================
// 2. TENANT PAYMENT ROUTES
// ==========================================
router.post('/create-order',
    authMiddleware.authUser,
    authorizeMiddleware.authorizeRoles('tenant'),
    paymentController.createPaymentOrder);

router.post('/verify',
    authMiddleware.authUser,
    authorizeMiddleware.authorizeRoles('tenant'),
    paymentController.verifyPayment);

router.post('/generate-invoice',
    authMiddleware.authUser,
    authorizeMiddleware.authorizeRoles('landlord'),
    paymentController.generateManualInvoice
)

router.get('/pending/rents',
    authMiddleware.authUser,
    authorizeMiddleware.authorizeRoles('tenant'),
    paymentController.getPendingRents);


// ==========================================
// 3. LANDLORD INCOME & EXPENSE ROUTES
// ==========================================
router.get('/landlord/received',
    authMiddleware.authUser,
    authorizeMiddleware.authorizeRoles('landlord'),
    paymentController.getLandlordReceived);

router.post('/expenses',
    authMiddleware.authUser,
    authorizeMiddleware.authorizeRoles('landlord'),
    paymentController.createExpense);

router.get('/expenses/my',
    authMiddleware.authUser,
    authorizeMiddleware.authorizeRoles('landlord'),
    paymentController.getMyExpenses);

router.put('/expenses/:id',
    authMiddleware.authUser,
    authorizeMiddleware.authorizeRoles('landlord'),
    paymentController.updateExpense);

router.delete('/expenses/:id',
    authMiddleware.authUser,
    authorizeMiddleware.authorizeRoles('landlord'),
    paymentController.deleteExpense);


// ==========================================
// 4. SHARED / PROTECTED ROUTES (Tenant & Landlord)
// ==========================================
router.get('/my/history',
    authMiddleware.authUser,
    paymentController.getMyHistory);

// Put /:id at the bottom of this section so it doesn't hijack other GET routes!
router.get('/:id',
    authMiddleware.authUser,
    paymentController.getPaymentById);


// ==========================================
// 5. ADMIN ROUTES
// ==========================================
router.get('/admin/all',
    authMiddleware.authUser,
    authorizeMiddleware.authorizeRoles('admin'),
    paymentController.getAdminAllPayments);

// Add this in your Admin Routes section
router.get('/admin/expenses',
    authMiddleware.authUser,
    authorizeMiddleware.authorizeRoles('admin'),
    paymentController.getAdminAllExpenses);

router.get('/admin/stats',
    authMiddleware.authUser,
    authorizeMiddleware.authorizeRoles('admin'),
    paymentController.getAdminStats);

router.post('/refund/:paymentId',
    authMiddleware.authUser,
    authorizeMiddleware.authorizeRoles('admin'),
    paymentController.initiateRefund);

export default router;