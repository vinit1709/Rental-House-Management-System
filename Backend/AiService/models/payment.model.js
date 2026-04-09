import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
    {
        // --- 1. References ---
        tenantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        landlordId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        propertyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Property',
            required: true
        },
        leaseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Lease',
            required: true
        },

        // --- 2. Financial Details ---
        amount: {
            type: Number,
            required: true // Razorpay format (in paise, e.g., ₹500 = 50000)
        },
        amountINR: {
            type: Number,
            required: true // Display format (e.g., 500)
        },
        type: {
            type: String,
            enum: ['rent', 'deposit', 'maintenance', 'refund'],
            required: true
        },
        paymentMonth: {
            type: String, // e.g., 'December 2025'
            required: true
        },
        dueDate: {
            type: Date,
            required: true
        },
        notes: {
            type: String,
            default: null // Optional payment notes
        },

        // --- 3. Razorpay Tracking & Status ---
        razorpayOrderId: {
            type: String,
            default: null // Order ID from create-order API
        },
        razorpayPaymentId: {
            type: String,
            default: null // Payment ID after successful payment
        },
        razorpaySignature: {
            type: String,
            default: null // Signature for verification
        },
        status: {
            type: String,
            enum: ['pending', 'success', 'failed', 'refunded'],
            default: 'pending'
        },
        receiptUrl: {
            type: String,
            default: null // Generated PDF receipt URL after success
        }
    },
    { timestamps: true } // Automatically adds createdAt and updatedAt
);

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;