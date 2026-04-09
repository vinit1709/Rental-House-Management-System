import Application from '../models/application.model.js';
import User from '../models/user.model.js';
import Property from '../models/property.model.js';
import axios from 'axios';


// ==========================================
// 1. APPLICATION LOGIC
// ==========================================

export const applyForProperty = async (req, res) => {
    try {
        const { propertyId } = req.params;
        const { message, landlordId } = req.body; // In a real flow, frontend passes landlordId or we fetch it from Property Service

        // Check if already applied
        const existingApp = await Application.findOne({ tenantId: req.user._id, propertyId });
        if (existingApp) {
            return res.status(400).json({ message: "You have already applied for this property." });
        }

        const application = await Application.create({
            tenantId: req.user._id,
            landlordId, // ID of the landlord who owns the property
            propertyId,
            message
        });

        // FUTURE: Trigger Notification Service here (Email landlord)

        res.status(201).json({ message: "Application submitted successfully!", application });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getMyApplications = async (req, res) => {
    try {
        const applications = await Application.find({ tenantId: req.user._id })
            .populate("propertyId")
            .sort({ createdAt: -1 });
        res.status(200).json({ applications });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- SINGLE APPLICATION ---
export const getSingleApplication = async (req, res) => {
    try {
        const { id } = req.params;
        const application = await Application.findById(id);

        if (!application) return res.status(404).json({ message: "Application not found" });

        // Security: Only the tenant who applied, or the landlord who owns it, can view this
        if (application.tenantId !== req.user._id && application.landlordId !== req.user._id) {
            return res.status(403).json({ message: "Unauthorized access to this application." });
        }

        res.status(200).json({ application });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get ALL applications for the logged-in landlord across ALL their properties
export const getAllLandlordApplications = async (req, res) => {
    try {
        const applications = await Application.find({ landlordId: req.user._id })
            .populate("propertyId")
            .populate("tenantId")
            .sort({ createdAt: -1 });
        res.status(200).json({ applications });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getPropertyApplications = async (req, res) => {
    try {
        const { propertyId } = req.params;
        // Verify the landlord requesting this is actually the landlord of the property
        const applications = await Application.find({ propertyId, landlordId: req.user._id })
            .populate("propertyId")
            .sort({ createdAt: -1 });
        res.status(200).json({ applications });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateApplicationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, rejectionReason } = req.body; // status: 'approved' or 'rejected'

        const application = await Application.findById(id);
        if (!application) return res.status(404).json({ message: "Application not found." });

        if (application.landlordId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Unauthorized to update this application." });
        }

        application.status = status;
        if (status === 'rejected') application.rejectionReason = rejectionReason;

        await application.save();

        // FUTURE: If status === 'approved', trigger Lease Service to draft a lease!
        // FUTURE: Trigger Notification Service here (Email tenant)

        res.status(200).json({ message: `Application ${status} successfully.`, application });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE /tenants/applications/:id
export const withdrawApplication = async (req, res) => {
    try {
        const { id } = req.params;

        const application = await Application.findOne({ _id: id, tenantId: req.user._id });
        if (!application) {
            return res.status(404).json({ message: "Application not found or you don't have permission." });
        }

        if (application.status !== 'pending') {
            return res.status(400).json({ message: "You can only withdraw pending applications." });
        }

        // We delete it entirely from the database to keep things clean
        await application.deleteOne();

        res.status(200).json({ message: "Application withdrawn successfully." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};