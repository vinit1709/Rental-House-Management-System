import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
    tenantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    landlordId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    propertyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
        required: true,
        index: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'withdrawn'],
        default: 'pending'
    },
    message: {
        type: String,
        trim: true,
        default: null // Optional message from tenant when applying
    },
    rejectionReason: {
        type: String,
        default: null // If landlord rejects, they can explain why
    }
}, { timestamps: true });

const Application = mongoose.model('Application', applicationSchema);

export default Application;