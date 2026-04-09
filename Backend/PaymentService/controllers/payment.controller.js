import Razorpay from 'razorpay';
import crypto from 'crypto';
import User from '../models/user.model.js';
import Property from '../models/property.model.js';
import Lease from '../models/lease.model.js'
import Payment from '../models/payment.model.js';
import Expense from '../models/expense.model.js'; // We will create this small model next!
import dotenv from 'dotenv';

dotenv.config();

// Initialize Razorpay SDK
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/* =========================================
   1. CORE RAZORPAY CHECKOUT (TENANT)
========================================= */

// 1. Create a Razorpay Order
export const createPaymentOrder = async (req, res) => {
    try {
        const { paymentId } = req.body;

        // Find the exact pending invoice in the database
        const payment = await Payment.findById(paymentId);
        if (!payment) return res.status(404).json({ message: "Invoice not found" });

        // Razorpay expects amounts in smaller units (paise). ₹1 = 100 paise.
        const amountInPaise = payment.amountINR * 100;

        const options = {
            amount: amountInPaise,
            currency: "INR",
            receipt: `rcpt_${Date.now()}`
        };

        // Ask Razorpay to generate a secure Order ID
        const order = await razorpay.orders.create(options);

        if (!order) return res.status(500).json({ message: "Failed to create Razorpay order" });

        // Save the pending invoice in your database
        // const newPayment = await Payment.create({
        //     tenantId: req.user._id,
        //     landlordId,
        //     propertyId,
        //     leaseId,
        //     amount: amountInPaise,
        //     amountINR,
        //     type,
        //     paymentMonth,
        //     notes,
        //     razorpayOrderId: order.id, // Save the generated order ID
        //     status: 'pending'
        // });

        payment.tenantId = req.user._id;
        payment.amount = amountInPaise;
        payment.razorpayOrderId = order.id;
        await payment.save();

        return res.status(201).json({ message: "Order created successfully", order, payment });
    } catch (error) {
        console.error("Error creating payment order:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// 2. Verify Razorpay Payment Signature
export const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        // Find the pending payment in our DB
        const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
        if (!payment) return res.status(404).json({ message: "Payment record not found." });

        // Mathematical verification to ensure the payment isn't spoofed
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            // Payment is legit! Update the database.
            payment.razorpayPaymentId = razorpay_payment_id;
            payment.razorpaySignature = razorpay_signature;
            payment.status = 'success';

            // Note: In a real app, we could trigger a PDF receipt generation here and save the URL
            payment.receiptUrl = `/receipts/${payment._id}`;

            await payment.save();

            return res.status(200).json({ message: "Payment verified successfully", payment });
        } else {
            payment.status = 'failed';
            await payment.save();
            return res.status(400).json({ message: "Invalid payment signature. Payment failed." });
        }
    } catch (error) {
        console.error("Error verifying payment:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// 2.5 Generate Manual Invoice (LANDLORD ONLY)
export const generateManualInvoice = async (req, res) => {
    try {
        const { tenantId, propertyId, leaseId, amountINR, paymentMonth, dueDate, type } = req.body;
        // console.log(req.body);

        // Ensure the landlord doesn't accidentally bill the same month twice
        const existingInvoice = await Payment.findOne({
            leaseId,
            paymentMonth,
            type: type || 'rent'
        });

        // console.log(existingInvoice);

        if (existingInvoice) {
            return res.status(400).json({ message: `An invoice for ${paymentMonth} has already been generated.` });
        }

        const newInvoice = await Payment.create({
            tenantId,
            landlordId: req.user._id, // The logged-in landlord
            propertyId,
            leaseId,
            amount: amountINR * 100, // Convert to paise for Razorpay later
            amountINR,
            type: type || 'rent',
            paymentMonth,
            dueDate,
            status: 'pending'
        });

        // console.log(newInvoice);


        return res.status(201).json({ message: "Invoice generated successfully and sent to tenant!", invoice: newInvoice });
    } catch (error) {
        console.error("Error generating invoice:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

/* =========================================
   2. DASHBOARD READ ROUTES
========================================= */

// 3. Get all payment history for current user (Tenant or Landlord)
export const getMyHistory = async (req, res) => {
    try {
        const filter = req.user.role === 'landlord'
            ? { landlordId: req.user._id }
            : { tenantId: req.user._id };

        const payments = await Payment.find(filter)
            .populate('propertyId', 'title')
            .populate('tenantId', 'name email')
            .sort({ createdAt: -1 });

        return res.status(200).json({ count: payments.length, payments });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

// 4. Get single payment receipt details
export const getPaymentById = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id)
            .populate('propertyId', 'title address')
            .populate('tenantId', 'name email')
            .populate('landlordId', 'name email');

        if (!payment) return res.status(404).json({ message: "Payment not found" });

        // Security check
        if (payment.tenantId._id.toString() !== req.user._id.toString() && payment.landlordId._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Unauthorized access" });
        }

        return res.status(200).json({ payment });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

// 5. Get all upcoming/pending rent dues (Tenant)
export const getPendingRents = async (req, res) => {
    try {
        const pending = await Payment.find({ tenantId: req.user._id, status: 'pending' })
            .populate('propertyId', 'title')
            .sort({ createdAt: -1 });

        // console.log(pending);


        return res.status(200).json({ count: pending.length, payments: pending });
    } catch (error) {
        console.error("Error featching pending rents:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

// 6. Get all rent payments received by landlord
export const getLandlordReceived = async (req, res) => {
    try {
        const received = await Payment.find({ landlordId: req.user._id, status: 'success' })
            .populate('propertyId', 'title')
            .populate('tenantId', 'name')
            .sort({ createdAt: -1 });

        return res.status(200).json({ count: received.length, payments: received });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

/* =========================================
   3. PUBLIC WEBHOOK (For Razorpay background updates)
========================================= */

// 7. Razorpay Webhook Handler
export const razorpayWebhook = async (req, res) => {
    try {
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
        const signature = req.headers['x-razorpay-signature'];

        const expectedSignature = crypto.createHmac('sha256', secret)
            .update(JSON.stringify(req.body))
            .digest('hex');

        if (expectedSignature === signature) {
            // Event matches, handle the specific event (e.g., payment.captured, payment.failed)
            const event = req.body.event;
            const paymentId = req.body.payload.payment.entity.id;
            const orderId = req.body.payload.payment.entity.order_id;

            if (event === 'payment.captured') {
                await Payment.findOneAndUpdate({ razorpayOrderId: orderId }, { status: 'success', razorpayPaymentId: paymentId });
            } else if (event === 'payment.failed') {
                await Payment.findOneAndUpdate({ razorpayOrderId: orderId }, { status: 'failed' });
            }
            res.status(200).json({ status: 'ok' });
        } else {
            res.status(400).json({ status: 'invalid signature' });
        }
    } catch (error) {
        res.status(500).json({ message: "Webhook error" });
    }
};

/* =========================================
   4. EXPENSE MANAGEMENT (LANDLORD ONLY)
========================================= */

// 8. Log a property expense
export const createExpense = async (req, res) => {
    try {
        const { propertyId, title, amount, category, date, description } = req.body;
        const newExpense = await Expense.create({
            landlordId: req.user._id,
            propertyId, title, amount, category, date, description
        });
        res.status(201).json({ message: "Expense logged", expense: newExpense });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

// 9. Get all logged expenses for landlord
export const getMyExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find({ landlordId: req.user._id }).populate('propertyId', 'title').sort({ date: -1 });
        res.status(200).json({ count: expenses.length, expenses });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

// 10. Update an expense entry
export const updateExpense = async (req, res) => {
    try {
        const expense = await Expense.findOneAndUpdate(
            { _id: req.params.id, landlordId: req.user._id },
            req.body,
            { new: true }
        );
        if (!expense) return res.status(404).json({ message: "Expense not found" });
        res.status(200).json({ message: "Expense updated", expense });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

// 11. Delete an expense entry
export const deleteExpense = async (req, res) => {
    try {
        const expense = await Expense.findOneAndDelete({ _id: req.params.id, landlordId: req.user._id });
        if (!expense) return res.status(404).json({ message: "Expense not found" });
        res.status(200).json({ message: "Expense deleted" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

/* =========================================
   5. ADMIN ROUTES
========================================= */

// 12. Get all transactions platform-wide
export const getAdminAllPayments = async (req, res) => {
    try {
        const payments = await Payment.find().populate('propertyId', 'title').populate('tenantId', 'name').sort({ createdAt: -1 });
        res.status(200).json({ count: payments.length, payments });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

// 12.5 Get all expenses platform-wide (ADMIN)
export const getAdminAllExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find()
            .populate('propertyId', 'title')
            .populate('landlordId', 'name email')
            .sort({ date: -1 });

        res.status(200).json({ count: expenses.length, expenses });
    } catch (error) {
        console.error("Error fetching admin expenses:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// 13. Get payment statistics and analytics
export const getAdminStats = async (req, res) => {
    try {
        const totalVolume = await Payment.aggregate([
            { $match: { status: 'success' } },
            { $group: { _id: null, total: { $sum: '$amountINR' } } }
        ]);
        const count = await Payment.countDocuments({ status: 'success' });

        res.status(200).json({
            totalSuccessfulPayments: count,
            totalVolumeINR: totalVolume[0]?.total || 0
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

// 14. Initiate refund for a payment
export const initiateRefund = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.paymentId);
        if (!payment || payment.status !== 'success') {
            return res.status(400).json({ message: "Valid successful payment required for refund" });
        }

        // Hit Razorpay refund API
        const refund = await razorpay.payments.refund(payment.razorpayPaymentId, {
            amount: payment.amount // Full amount in paise
        });

        payment.status = 'refunded';
        await payment.save();

        res.status(200).json({ message: "Refund initiated successfully", refund });
    } catch (error) {
        console.error("Refund error:", error);
        res.status(500).json({ message: "Internal server error during refund" });
    }
};