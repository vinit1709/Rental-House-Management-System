import Property from "../models/property.model.js";
import User from "../models/user.model.js";
import Visit from "../models/visit.model.js";
import { validationResult } from "express-validator";

/* =========================================
   Public Routes (Searching & Viewing)
========================================= */

// Get all available properties with filters
export const getAllProperties = async (req, res) => {
    try {
        const { minRent, maxRent, search, city, type, bhk } = req.query;

        // Only show properties approved by admin and marked 'available'
        const filter = { status: "available", isApproved: true };

        if (minRent || maxRent) {
            filter.rent = {};
            if (minRent) filter.rent.$gte = Number(minRent);
            if (maxRent) filter.rent.$lte = Number(maxRent);
        }

        if (city) filter["address.city"] = { $regex: city, $options: "i" };
        if (type) filter.type = type;
        if (bhk) filter.bhk = Number(bhk);

        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
                { "address.city": { $regex: search, $options: "i" } },
                { "address.pincode": { $regex: search, $options: "i" } },
            ];
        }

        const properties = await Property.find(filter).sort({ createdAt: -1 });

        return res.status(200).json({ count: properties.length, properties });
    } catch (error) {
        console.error("Error fetching properties:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get single property details
export const getPropertyById = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);

        if (!property) return res.status(404).json({ message: "Property not found" });

        // Increment view count
        property.viewCount += 1;
        await property.save({ validateBeforeSave: false });

        return res.status(200).json({ property });
    } catch (error) {
        console.error("Error fetching property by ID:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

/* =========================================
   Landlord Routes (Property Management)
========================================= */

// Create new property listing
// POST http://localhost:3003/api/properties
// @access Private (Landlord)
// Check if landlord verified or not
// Return success with property details
export const createProperty = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        // --- KYC VERIFICATION CHECK ---
        const landlord = await User.findById(req.user._id);
        // console.log(landlord);
        if (!landlord || landlord.verificationStatus !== 'verified') {
            return res.status(403).json({ message: "Action denied. Your identity must be verified by an admin before you can list a property." });
        }

        const { title, description, type, bhk, sqft, address, rent, deposit, amenities, furnishing, availableFrom } = req.body;

        // Map the frontend address (with lat/lng) to the backend GeoJSON schema
        const formattedAddress = {
            street: address.street,
            city: address.city,
            state: address.state,
            country: address.country || 'India',
            pincode: address.pincode,
            coordinates: {
                type: 'Point',
                // GeoJSON expects [longitude, latitude] - note the order!
                coordinates: [parseFloat(address.lng || 0), parseFloat(address.lat || 0)]
            }
        };

        const property = await Property.create({
            landlordId: req.user._id,
            title,
            description,
            type,
            bhk,
            sqft, // Added sqft
            address: formattedAddress, // Mapped address
            rent,
            deposit,
            amenities,
            furnishing,
            availableFrom: availableFrom || Date.now(),
            status: "draft", // Starts as draft
        });

        return res.status(201).json({ message: "Property created successfully in draft mode", property });
    } catch (error) {
        console.error("Error creating property:", error.message);
        res.status(500).json({ message: error.message });
    }
};

// Get all properties listed by logged-in landlord
export const getMyListings = async (req, res) => {
    try {
        const properties = await Property.find({ landlordId: req.user._id }).sort({ createdAt: -1 });
        return res.status(200).json({ count: properties.length, properties });
    } catch (error) {
        console.error("Error fetching landlord listings:", error.message);
        res.status(500).json({ message: error.message });
    }
};

// Update existing property details
export const updateProperty = async (req, res) => {
    try {
        // --- KYC VERIFICATION CHECK ---
        const landlord = await User.findById(req.user._id);
        if (!landlord || landlord.verificationStatus !== 'verified') {
            return res.status(403).json({ message: "Action denied. Your identity must be verified before updating properties." });
        }

        const property = await Property.findOne({ _id: req.params.id, landlordId: req.user._id });

        if (!property) return res.status(404).json({ message: "Property not found" });

        if (!["draft", "rejected"].includes(property.status)) {
            return res.status(400).json({ message: "Cannot edit property while pending or active. Please switch to draft." });
        }

        // Handle address & coordinate updates specifically if they were sent
        let updateData = { ...req.body };
        if (updateData.address && updateData.address.lat && updateData.address.lng) {
            updateData.address.coordinates = {
                type: 'Point',
                coordinates: [parseFloat(updateData.address.lng), parseFloat(updateData.address.lat)]
            };
            // Clean up the temporary frontend lat/lng keys so they don't bloat the DB
            delete updateData.address.lat;
            delete updateData.address.lng;
        }

        Object.assign(property, updateData);

        // Reset rejection status if they are updating a rejected draft
        if (property.status === "rejected") {
            property.status = "draft";
            property.rejectionReason = null;
        }

        await property.save();
        return res.status(200).json({ message: "Property updated successfully", property });
    } catch (error) {
        console.error("Error updating property:", error.message);
        res.status(500).json({ message: error.message });
    }
};

// Delete a property listing
export const deleteProperty = async (req, res) => {
    try {
        const property = await Property.findOneAndDelete({ _id: req.params.id, landlordId: req.user._id });
        if (!property) return res.status(404).json({ message: "Property not found" });

        return res.status(200).json({ message: "Property deleted successfully" });
    } catch (error) {
        console.error("Error deleting property:", error.message);
        res.status(500).json({ message: error.message });
    }
};

// Toggle property availability
export const updateAvailability = async (req, res) => {
    try {
        const { status } = req.body;
        const property = await Property.findOne({ _id: req.params.id, landlordId: req.user._id });

        if (!property) return res.status(404).json({ message: "Property not found" });
        if (!property.isApproved) return res.status(400).json({ message: "Cannot change availability of unapproved property" });

        property.status = status;
        await property.save();

        return res.status(200).json({ message: `Property status updated to ${status}`, property });
    } catch (error) {
        console.error("Error updating availability:", error.message);
        res.status(500).json({ message: error.message });
    }
};

/* =========================================
   File Uploads & Workflow
========================================= */

// Upload property photos
export const uploadPropertyPhotos = async (req, res) => {
    try {
        const property = await Property.findOne({ _id: req.params.id, landlordId: req.user._id });
        if (!property) return res.status(404).json({ message: "Property not found" });

        if (!req.files || req.files.length === 0) return res.status(400).json({ message: "No images provided" });

        const newPhotoUrls = req.files.map(file => file.path);

        if (property.photos.length + newPhotoUrls.length > 10) {
            return res.status(400).json({ message: "Cannot exceed 10 photos total" });
        }

        property.photos.push(...newPhotoUrls);
        await property.save();

        return res.status(200).json({ message: "Photos uploaded successfully", property });
    } catch (error) {
        console.error("Error uploading photos:", error.message);
        res.status(500).json({ message: error.message });
    }
};

// Delete specific photo
export const deletePropertyPhoto = async (req, res) => {
    try {
        const { id, photoId } = req.params;

        const property = await Property.findOne({ _id: id, landlordId: req.user._id });

        if (!property) {
            return res.status(404).json({ message: "Property not found or unauthorized" });
        }

        const decodedPhotoIdentifier = decodeURIComponent(photoId);
        const photoToDelete = property.photos.find(url => url.includes(decodedPhotoIdentifier));

        if (!photoToDelete) {
            return res.status(404).json({ message: "Photo not found in this property" });
        }

        property.photos = property.photos.filter(url => url !== photoToDelete);
        await property.save();

        return res.status(200).json({
            message: "Photo deleted successfully",
            property
        });

    } catch (error) {
        console.error("Error deleting photo:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Landlord uploads legal documents
export const uploadVerificationDocument = async (req, res) => {
    try {
        const { type } = req.body;
        if (!type || !req.file) return res.status(400).json({ message: "Document type and file are required" });

        const property = await Property.findOne({ _id: req.params.id, landlordId: req.user._id });
        if (!property) return res.status(404).json({ message: "Property not found" });

        property.verificationDocuments.push({
            type,
            url: req.file.path
        });

        await property.save();
        return res.status(200).json({ message: "Document uploaded successfully", property });
    } catch (error) {
        console.error("Error uploading document:", error.message);
        res.status(500).json({ message: error.message });
    }
};

// Submit property for verification
export const submitForVerification = async (req, res) => {
    try {
        const property = await Property.findOne({ _id: req.params.id, landlordId: req.user._id });
        if (!property) return res.status(404).json({ message: "Property not found" });

        if (property.photos.length === 0) {
            return res.status(400).json({ message: "Please upload at least one photo before submitting." });
        }
        if (property.verificationDocuments.length === 0) {
            return res.status(400).json({ message: "Please upload at least one verification document (e.g., lightbill)." });
        }

        property.status = "pending";
        await property.save();

        return res.status(200).json({ message: "Property submitted for admin verification", property });
    } catch (error) {
        console.error("Error submitting property:", error.message);
        res.status(500).json({ message: error.message });
    }
};

/* =========================================
   Visit Requests (Tenant & Landlord)
========================================= */
// Tenant: Request a property visit
export const requestVisit = async (req, res) => {
    try {
        // --- KYC VERIFICATION CHECK ---
        const tenant = await User.findById(req.user._id);
        if (!tenant || tenant.verificationStatus !== 'verified') {
            return res.status(403).json({ message: "Action denied. You must verify your Government ID before scheduling property visits." });
        }

        const { visitDate, tenantMessage } = req.body;
        const propertyId = req.params.id;
        const tenantId = req.user._id;

        const property = await Property.findById(propertyId);
        if (!property) return res.status(404).json({ message: "Property not found" });
        if (property.status !== 'available' || !property.isApproved) {
            return res.status(400).json({ message: "This property is currently not available for visits." });
        }
        if (property.landlordId.toString() === tenantId.toString()) {
            return res.status(400).json({ message: "You cannot schedule a visit for your own property." });
        }

        const existingVisit = await Visit.findOne({ propertyId, tenantId, status: 'pending' });
        if (existingVisit) {
            return res.status(400).json({ message: "You already have a pending visit request for this property." });
        }

        const visit = await Visit.create({
            propertyId: property._id,
            tenantId: tenantId,
            landlordId: property.landlordId,
            visitDate,
            tenantMessage
        });

        return res.status(201).json({ message: "Visit requested successfully", visit });
    } catch (error) {
        console.error("Error requesting visit:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Tenant: Get all my scheduled property visits
export const getMyVisits = async (req, res) => {
    try {
        const visits = await Visit.find({ tenantId: req.user._id }).populate('propertyId').sort({ visitDate: 1 });
        return res.status(200).json({ count: visits.length, visits });
    } catch (error) {
        console.error("Error fetching tenant visits:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Landlord: Get all visit requests for a specific property
export const getPropertyVisits = async (req, res) => {
    try {
        const propertyId = req.params.id;
        const property = await Property.findOne({ _id: propertyId, landlordId: req.user._id });
        if (!property) return res.status(403).json({ message: "Unauthorized or Property not found" });

        const visits = await Visit.find({ propertyId }).populate('propertyId', 'title').populate('tenantId', 'name email').sort({ visitDate: 1 });
        return res.status(200).json({ count: visits.length, visits });
    } catch (error) {
        console.error("Error fetching property visits:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Landlord: Approve, reschedule, or reject a visit request
export const updateVisitStatus = async (req, res) => {
    try {
        const { status, landlordNotes } = req.body;
        const visitId = req.params.visitId;

        const visit = await Visit.findOne({ _id: visitId, landlordId: req.user._id });
        if (!visit) return res.status(404).json({ message: "Visit request not found or unauthorized" });

        visit.status = status;
        if (landlordNotes) visit.landlordNotes = landlordNotes;

        await visit.save();

        return res.status(200).json({ message: `Visit status updated to ${status}`, visit });
    } catch (error) {
        console.error("Error updating visit status:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

/* =========================================
   Admin Only Routes
========================================= */
// Get Property Statistics for Admin Dashboard
export const getAdminPropertyStats = async (req, res) => {
    try {
        const [totalProperties, pendingProperties] = await Promise.all([
            Property.countDocuments(),
            Property.countDocuments({ status: 'pending' })
        ]);

        res.status(200).json({
            totalProperties,
            pendingProperties
        });
    } catch (error) {
        console.error("Error fetching property stats:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Admin: Get all properties
export const getAdminAllProperties = async (req, res) => {
    try {
        const properties = await Property.find().populate('landlordId').sort({ createdAt: -1 });
        return res.status(200).json({ count: properties.length, properties });
    } catch (error) {
        console.error("Error fetching admin properties:", error.message);
        res.status(500).json({ message: error.message });
    }
};

// Admin: Approve or Reject Property
export const adminApproveProperty = async (req, res) => {
    try {
        const { isApproved, rejectionReason } = req.body;
        const property = await Property.findById(req.params.id);

        if (!property) return res.status(404).json({ message: "Property not found" });

        if (isApproved) {
            property.isApproved = true;
            property.status = "available";
            property.rejectionReason = null;
        } else {
            property.isApproved = false;
            property.status = "rejected";
            property.rejectionReason = rejectionReason || "No reason provided by admin.";
        }

        await property.save();
        return res.status(200).json({ message: `Property has been ${isApproved ? 'approved' : 'rejected'}`, property });
    } catch (error) {
        console.error("Error approving property:", error.message);
        res.status(500).json({ message: error.message });
    }
};