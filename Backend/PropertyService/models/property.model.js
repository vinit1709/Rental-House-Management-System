import mongoose from "mongoose";

// The document schema requested for Admin verification (Tax receipts, Lightbills, etc.)
const documentSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: ["lightbill", "propertyTax", "ownershipProof", "noc", "other"],
            required: [true, "Document type is required"],
        },
        url: {
            type: String,
            required: [true, "Document URL is required"],
        }
    },
    { _id: true, timestamps: true }
);

const propertySchema = new mongoose.Schema(
    {
        landlordId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, "Landlord ID is required"],
            index: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        type: {
            type: String,
            enum: ['apartment', 'house', 'villa', 'pg', 'studio'],
            required: true,
        },
        bhk: {
            type: Number,
            required: true,
        },
        // NEW: Square Footage added here
        sqft: {
            type: Number,
            required: [true, "Property size in sqft is required"],
            min: [0, "Square footage cannot be negative"],
        },
        address: {
            street: { type: String, required: true },
            city: { type: String, required: true },
            state: { type: String, required: true },
            country: { type: String, required: true, default: 'India' }, // NEW: Country added for cascading dropdowns
            pincode: { type: String, required: true },
            coordinates: {
                type: { type: String, enum: ['Point'], default: 'Point' },
                coordinates: { type: [Number], default: [0, 0] } // [longitude, latitude]
            }
        },
        rent: {
            type: Number,
            required: true,
            min: [0, "Rent amount cannot be negative"],
        },
        deposit: {
            type: Number,
            required: true,
            min: [0, "Security deposit cannot be negative"],
        },
        photos: {
            type: [String], // Array of Cloudinary URLs
            validate: [(val) => val.length <= 10, 'Cannot exceed 10 photos'],
            default: []
        },
        amenities: {
            type: [String],
            default: []
        },
        furnishing: {
            type: String,
            enum: ['unfurnished', 'semi', 'fully'],
            required: true,
        },
        availableFrom: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: ['draft', 'pending', 'available', 'rented', 'inactive', 'rejected'],
            default: 'draft',
            index: true,
        },
        isApproved: {
            type: Boolean,
            default: false,
        },
        aiSuggestedRent: {
            type: Number,
            default: null,
        },
        viewCount: {
            type: Number,
            default: 0,
        },
        verificationDocuments: {
            type: [documentSchema],
            default: []
        },
        rejectionReason: {
            type: String,
            default: null,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

// GeoJSON Index for map-based radius search later
propertySchema.index({ "address.coordinates": "2dsphere" });

const Property = mongoose.model("Property", propertySchema);
export default Property;