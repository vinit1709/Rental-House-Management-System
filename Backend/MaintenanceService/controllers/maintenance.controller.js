import Maintenance from '../models/maintenance.model.js';
import User from '../models/user.model.js';
import Property from '../models/property.model.js';

// ==========================================
// TENANT ROUTES
// ==========================================

// 1. Create new maintenance request
export const createRequest = async (req, res) => {
    try {
        const { landlordId, propertyId, title, description, category, priority } = req.body;

        // Extract Cloudinary URLs from the uploaded files
        let imageUrls = [];
        if (req.files && req.files.length > 0) {
            imageUrls = req.files.map(file => file.path);
        }

        const newRequest = await Maintenance.create({
            tenantId: req.user._id,
            landlordId,
            propertyId,
            title,
            description,
            category,
            priority,
            images: imageUrls
        });

        res.status(201).json({ message: "Maintenance request submitted successfully", request: newRequest });
    } catch (error) {
        console.error("Error creating maintenance request:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// 2. Get all requests raised by tenant
export const getMyRequests = async (req, res) => {
    try {
        const requests = await Maintenance.find({ tenantId: req.user._id })
            .populate('propertyId', 'title address')
            .sort({ createdAt: -1 });

        res.status(200).json({ count: requests.length, requests });
    } catch (error) {
        console.error("Error fetching tenant requests:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// 3. Update request (before it is accepted)
export const updateRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const request = await Maintenance.findOne({ _id: id, tenantId: req.user._id });

        if (!request) return res.status(404).json({ message: "Request not found" });
        if (request.status !== 'pending') return res.status(400).json({ message: "Cannot edit a request that is already acknowledged or in progress" });

        const updatedRequest = await Maintenance.findByIdAndUpdate(id, req.body, { new: true });
        res.status(200).json({ message: "Request updated", request: updatedRequest });
    } catch (error) {
        console.error("Error updating request:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// 4. Cancel a pending request
export const deleteRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const request = await Maintenance.findOne({ _id: id, tenantId: req.user._id });

        if (!request) return res.status(404).json({ message: "Request not found" });
        if (request.status !== 'pending') return res.status(400).json({ message: "Can only cancel pending requests" });

        request.status = 'cancelled';
        await request.save();

        res.status(200).json({ message: "Request cancelled successfully" });
    } catch (error) {
        console.error("Error cancelling request:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


// ==========================================
// LANDLORD ROUTES
// ==========================================

// 5. Get all requests for landlord's properties
export const getLandlordRequests = async (req, res) => {
    try {
        const requests = await Maintenance.find({ landlordId: req.user._id })
            .populate('propertyId', 'title address')
            .populate('tenantId', 'name email phone')
            .sort({ createdAt: -1 });

        res.status(200).json({ count: requests.length, requests });
    } catch (error) {
        console.error("Error fetching landlord requests:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// 6. Update status: acknowledged, in-progress, resolved
export const updateRequestStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const request = await Maintenance.findOne({ _id: id, landlordId: req.user._id });
        if (!request) return res.status(404).json({ message: "Request not found" });

        request.status = status;
        if (status === 'resolved') request.resolvedAt = new Date();

        await request.save();
        res.status(200).json({ message: `Request status updated to ${status}`, request });
    } catch (error) {
        console.error("Error updating status:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// 7. Assign task to worker/vendor
export const assignWorker = async (req, res) => {
    try {
        const { id } = req.params;
        const { vendorName, vendorContact, scheduledDate } = req.body;

        const request = await Maintenance.findOne({ _id: id, landlordId: req.user._id });
        if (!request) return res.status(404).json({ message: "Request not found" });

        request.assignedVendor = { name: vendorName, contact: vendorContact };
        request.scheduledDate = scheduledDate;
        request.status = 'in-progress'; // Auto-update status when assigning someone

        await request.save();
        res.status(200).json({ message: "Worker assigned successfully", request });
    } catch (error) {
        console.error("Error assigning worker:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


// ==========================================
// SHARED / PROTECTED ROUTES (Tenant & Landlord)
// ==========================================

// 8. Get single maintenance request details
export const getRequestById = async (req, res) => {
    try {
        const { id } = req.params;
        const request = await Maintenance.findById(id)
            .populate('propertyId', 'title address')
            .populate('tenantId', 'name email phone')
            .populate('landlordId', 'name email phone');

        if (!request) return res.status(404).json({ message: "Request not found" });

        // Ensure only the involved landlord or tenant can view it
        if (request.tenantId._id.toString() !== req.user._id.toString() &&
            request.landlordId._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Unauthorized to view this request" });
        }

        res.status(200).json({ request });
    } catch (error) {
        console.error("Error fetching single request:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// 9. Add comment/update to request
export const addComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { text } = req.body;

        const request = await Maintenance.findById(id);
        if (!request) return res.status(404).json({ message: "Request not found" });

        // Push new comment to the array
        request.comments.push({
            userId: req.user._id,
            name: req.user.name,
            text,
            createdAt: new Date()
        });

        await request.save();
        res.status(200).json({ message: "Comment added", request });
    } catch (error) {
        console.error("Error adding comment:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// 10. Upload photos for a maintenance request
export const uploadPhotos = async (req, res) => {
    try {
        const { id } = req.params;
        const { newImageUrls } = req.body; // Assuming frontend uploads to Cloudinary and sends URLs

        const request = await Maintenance.findById(id);
        if (!request) return res.status(404).json({ message: "Request not found" });

        request.images = [...request.images, ...newImageUrls];
        await request.save();

        res.status(200).json({ message: "Photos attached successfully", request });
    } catch (error) {
        console.error("Error uploading photos:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


// ==========================================
// ADMIN ROUTES
// ==========================================

// 11. Get all requests platform-wide
export const getAdminAllRequests = async (req, res) => {
    try {
        const requests = await Maintenance.find()
            .populate('propertyId', 'title')
            .populate('tenantId', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json({ count: requests.length, requests });
    } catch (error) {
        console.error("Error fetching admin requests:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// 12. Get maintenance statistics
export const getAdminStats = async (req, res) => {
    try {
        const total = await Maintenance.countDocuments();
        const pending = await Maintenance.countDocuments({ status: 'pending' });
        const inProgress = await Maintenance.countDocuments({ status: 'in-progress' });
        const resolved = await Maintenance.countDocuments({ status: 'resolved' });

        res.status(200).json({
            total,
            pending,
            inProgress,
            resolved
        });
    } catch (error) {
        console.error("Error fetching admin stats:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};