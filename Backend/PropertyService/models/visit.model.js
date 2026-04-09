import mongoose from "mongoose";

const visitSchema = new mongoose.Schema(
    {
        propertyId: {
            type: mongoose.Schema.Types.ObjectId, // Changed to ObjectId
            ref: 'Property',                      // Links to your Property model
            required: [true, "Property ID is required"],
            index: true,
        },
        tenantId: {
            type: mongoose.Schema.Types.ObjectId, // Changed to ObjectId
            ref: 'User',                          // Links to your User model
            required: [true, "Tenant ID is required"],
            index: true,
        },
        landlordId: {
            type: mongoose.Schema.Types.ObjectId, // Changed to ObjectId
            ref: 'User',                          // Links to your User model
            required: [true, "Landlord ID is required"],
            index: true,
        },
        visitDate: {
            type: Date,
            required: [true, "Visit date and time are required"],
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected', 'rescheduled', 'completed', 'cancelled'],
            default: 'pending',
            index: true,
        },
        tenantMessage: {
            type: String,
            trim: true,
            maxlength: [500, "Message cannot exceed 500 characters"],
            default: null,
        },
        landlordNotes: {
            type: String,
            trim: true,
            maxlength: [500, "Notes cannot exceed 500 characters"],
            default: null,
        }
    },
    { timestamps: true }
);

const Visit = mongoose.model("Visit", visitSchema);
export default Visit;