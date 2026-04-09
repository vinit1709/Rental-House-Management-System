import mongoose from "mongoose";

const leaseSchema = new mongoose.Schema(
    {
        landlordId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Landlord ID is required"],
            index: true,
        },
        tenantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Tenant ID is required"],
            index: true,
        },
        propertyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Property",
            required: [true, "Property ID is required"],
            index: true,
        },
        applicationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Application",
            required: [true, "Original Application ID is required"],
        },

        // --- FINANCIAL TERMS ---
        monthlyRent: {
            type: Number,
            required: true,
        },
        securityDeposit: {
            type: Number,
            required: true,
        },
        rentDueDay: {
            type: Number, // e.g., 5 means rent is due on the 5th of every month
            default: 1,
            min: 1,
            max: 31
        },

        // --- TIMELINE ---
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },

        // --- DIGITAL SIGNATURES ---
        landlordSignature: {
            isSigned: { type: Boolean, default: false },
            signedAt: { type: Date, default: null }
        },
        tenantSignature: {
            isSigned: { type: Boolean, default: false },
            signedAt: { type: Date, default: null }
        },

        // --- STATUS ---
        status: {
            type: String,
            enum: ['draft', 'pending_tenant_signature', 'active', 'expired', 'terminated'],
            default: 'draft',
        },

        // Additional clauses (e.g., "No pets allowed", "Notice period is 2 months")
        specialClauses: {
            type: [String],
            default: []
        },

        // FUTURE: If you generate a PDF of the lease, you store the Cloudinary URL here
        documentUrl: {
            type: String,
            default: null
        },
        // NEW: Array to hold extra uploaded docs (ID proof, photos)
        documents: [
            {
                name: String, // e.g., "Tenant Aadhar Card", "Move-in Condition Photo"
                url: String,  // Cloudinary URL
                uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
                uploadedAt: { type: Date, default: Date.now }
            }
        ]
    },
    { timestamps: true }
);

const Lease = mongoose.model("Lease", leaseSchema);
export default Lease;