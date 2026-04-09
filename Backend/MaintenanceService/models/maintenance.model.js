import mongoose from 'mongoose';

// Sub-schema for comments so we can track who said what and when
const commentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const maintenanceSchema = new mongoose.Schema({
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    landlordId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },

    title: { type: String, required: true },
    description: { type: String, required: true },

    category: {
        type: String,
        enum: ['plumbing', 'electrical', 'appliance', 'hvac', 'general', 'exterior'],
        default: 'general'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'resolved', 'cancelled'],
        default: 'pending'
    },

    // UPDATED: Now stores both name and contact info!
    assignedVendor: {
        name: { type: String },
        contact: { type: String }
    },
    scheduledDate: { type: Date }, // NEW: When is the repair happening?

    // NEW: Array to hold conversation history
    comments: [commentSchema],

    images: [{ type: String }], // Array of Cloudinary/S3 image URLs
    resolvedAt: { type: Date }
}, { timestamps: true });

const Maintenance = mongoose.models.Maintenance || mongoose.model('Maintenance', maintenanceSchema);

export default Maintenance;