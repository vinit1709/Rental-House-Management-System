import Lease from "../models/lease.model.js";
import Application from "../models/application.model.js";
import Property from "../models/property.model.js";
import User from "../models/user.model.js";
import PDFDocument from "pdfkit";
import { v2 as cloudinary } from "cloudinary";
// import streamifier from "streamifier";

/* ============================================
   Helper: Generate & Upload PDF to Cloudinary
============================================ */
const generateAndUploadLeasePDF = async (lease, landlord, tenant, property) => {
    return new Promise((resolve, reject) => {
        // Create a new PDF document with standard A4 margins
        const doc = new PDFDocument({ margin: 50, size: 'A4' });

        // Setup Cloudinary Upload Stream
        const cloudinaryStream = cloudinary.uploader.upload_stream(
            { folder: "rhms/leases/documents", resource_type: "auto", public_id: `lease_${lease._id}.pdf`, format: "pdf" },
            (error, result) => {
                if (error) {
                    console.error("Cloudinary Upload Error:", error);
                    return reject(error);
                }
                resolve(result.secure_url);
            }
        );

        // --- THE FIX: Pipe the PDF directly to Cloudinary! ---
        doc.pipe(cloudinaryStream);

        // --- DRAW THE PDF CONTENT ---

        // TITLE
        doc.font('Helvetica-Bold').fontSize(18).text("LEAVE AND LICENSE AGREEMENT", { align: "center" });
        doc.moveDown(2);

        // INTRODUCTION
        const currentDate = new Date().toLocaleDateString('en-IN');
        doc.font('Helvetica').fontSize(11).text(`This Leave and License Agreement (hereinafter referred to as the "Agreement") is made and executed on this ${currentDate}, by and between:`, { align: 'justify' });
        doc.moveDown(1);

        // LICENSOR (Landlord)
        doc.font('Helvetica-Bold').text(`Mr./Mrs. ${landlord.name}`, { continued: true })
            .font('Helvetica').text(`, holding Government ID verified by RHMS, residing in India, hereinafter referred to as the `, { continued: true })
            .font('Helvetica-Bold').text(`"Licensor"`, { continued: true })
            .font('Helvetica').text(` (which expression shall include their heirs, successors, and assigns).`);
        doc.moveDown(1);

        doc.font('Helvetica-Bold').text(`AND`, { align: 'center' });
        doc.moveDown(1);

        // LICENSEE (Tenant)
        doc.font('Helvetica-Bold').text(`Mr./Mrs. ${tenant.name}`, { continued: true, align: 'left' })
            .font('Helvetica').text(`, holding Government ID verified by RHMS, hereinafter referred to as the `, { continued: true })
            .font('Helvetica-Bold').text(`"Licensee"`, { continued: true })
            .font('Helvetica').text(` (which expression shall include their heirs, successors, and assigns).`);
        doc.moveDown(1);

        doc.font('Helvetica-Oblique').text(`(The Licensor and Licensee are collectively referred to herein as the "Parties".)`);
        doc.moveDown(1.5);

        // Horizontal Line Separator
        doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
        doc.moveDown(1.5);

        // I. PROPERTY
        doc.font('Helvetica-Bold').fontSize(12).text(`I. PROPERTY`);
        doc.moveDown(0.5);
        doc.font('Helvetica').fontSize(11).text(`The Licensor agrees to grant on a leave and license basis to the Licensee the residential property located at ${property.address.street}, ${property.address.city}, ${property.address.state}, ${property.address.pincode}, measuring approximately ${property.sqft || '___'} square feet (SF) of residential space (hereinafter known as the "Premises"). Any change in the use of the Premises requires prior written consent from the Licensor.`, { align: 'justify' });
        doc.moveDown(1);

        // II. PERIOD OF TENANCY
        doc.font('Helvetica-Bold').fontSize(12).text(`II. PERIOD OF TENANCY`);
        doc.moveDown(0.5);
        doc.font('Helvetica').fontSize(11).text(`The term of this Agreement shall commence on the ${new Date(lease.startDate).toLocaleDateString('en-IN')} and expire at Midnight on the ${new Date(lease.endDate).toLocaleDateString('en-IN')}.`, { align: 'justify' });
        doc.moveDown(1);

        // III. MONTHLY PAYMENTS
        doc.font('Helvetica-Bold').fontSize(12).text(`III. MONTHLY PAYMENTS`);
        doc.moveDown(0.5);
        doc.font('Helvetica').fontSize(11).text(`The Licensee agrees to pay a net monthly payment of ₹${lease.monthlyRent}, payable monthly with the first payment due upon the commencement of the Lease and each installment payable thereafter on the ${lease.rentDueDay} day of each month. Rent for any fractional calendar month shall be a pro-rata portion of the monthly rent.`, { align: 'justify' });
        doc.moveDown(1);

        // IV. SECURITY DEPOSIT
        doc.font('Helvetica-Bold').fontSize(12).text(`IV. SECURITY DEPOSIT`);
        doc.moveDown(0.5);
        doc.font('Helvetica').fontSize(11).text(`A deposit in the amount of ₹${lease.securityDeposit} shall be due and payable in advance as security for the faithful performance of the terms and conditions of this Agreement. The Security Deposit may not be used to pay the last month’s rent unless written permission is granted by the Licensor.`, { align: 'justify' });
        doc.moveDown(1);

        // V. OBLIGATIONS (Formatted with Indentation/Bullets)
        doc.font('Helvetica-Bold').fontSize(12).text(`V. OBLIGATIONS OF LICENSEE`);
        doc.moveDown(0.5);
        doc.font('Helvetica-Bold').fontSize(11).text(`• Maintenance: `, { continued: true, indent: 20 })
            .font('Helvetica').text(`The Licensee shall properly maintain the Premises in a good, safe, and clean condition. The Licensee shall, at its sole expense, keep the interior of the Premises in as good a condition and repair as it is at the date of this Lease, reasonable wear and use excepted.`, { align: 'justify' });
        doc.moveDown(0.5);
        doc.font('Helvetica-Bold').text(`• Waste Disposal: `, { continued: true, indent: 20 })
            .font('Helvetica').text(`The Licensee shall properly and promptly remove all rubbish and see that the same is disposed of according to local regulations.`, { align: 'justify' });
        doc.moveDown(0.5);
        doc.font('Helvetica-Bold').text(`• Prohibited Items: `, { continued: true, indent: 20 })
            .font('Helvetica').text(`In no event shall explosives or extra hazardous materials be taken onto or retained on the Premises.`, { align: 'justify' });
        doc.moveDown(1);

        // Reset Indent back to 0 for next sections
        doc.text('', { indent: 0 });

        // VI. ALTERATIONS
        doc.font('Helvetica-Bold').fontSize(12).text(`VI. ALTERATIONS & IMPROVEMENTS`);
        doc.moveDown(0.5);
        doc.font('Helvetica').fontSize(11).text(`The Licensee agrees that no alterations or changes of any nature shall be made to the Premises without first obtaining the consent of the Licensor in writing.`, { align: 'justify' });
        doc.moveDown(1);

        // VII. SUBLET
        doc.font('Helvetica-Bold').fontSize(12).text(`VII. SUBLET & ASSIGNMENT`);
        doc.moveDown(0.5);
        doc.font('Helvetica').fontSize(11).text(`The Licensee may not transfer or assign this Lease, or sublet said leased Premises or any part thereof, without first obtaining the prior written consent and approval of the Licensor.`, { align: 'justify' });
        doc.moveDown(1);

        // VIII. DEFAULT & POSSESSION
        doc.font('Helvetica-Bold').fontSize(12).text(`VIII. DEFAULT & POSSESSION`);
        doc.moveDown(0.5);
        doc.font('Helvetica').fontSize(11).text(`In the event the Licensee fails to pay said rent when due, or is otherwise in default of any terms for a period of more than 15 days after receiving notice, the Licensor may declare the Lease terminated and immediately re-enter and take possession of the Premises. Rent in default shall accrue a late fee penalty per day until paid in full.`, { align: 'justify' });
        doc.moveDown(1);

        // IX. INDEMNIFICATION & X. GOVERNING LAW
        doc.font('Helvetica-Bold').fontSize(12).text(`IX. GOVERNING LAW`);
        doc.moveDown(0.5);
        doc.font('Helvetica').fontSize(11).text(`This Lease shall be governed by the laws of the State of Gujarat, India. Any disputes arising out of this agreement shall be subject to the exclusive jurisdiction of the local courts.`, { align: 'justify' });
        doc.moveDown(2);

        // --- SIGNATURES SECTION ---
        doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
        doc.moveDown(1.5);

        doc.font('Helvetica-Bold').fontSize(11).text(`IN WITNESS WHEREOF, the parties hereto set their electronic signatures to this Agreement on this ${currentDate}.`);
        doc.moveDown(1.5);

        // Side-by-side Layout for Signatures
        const currentY = doc.y;

        // Landlord Box (Left)
        doc.font('Helvetica-Bold').text(`LICENSOR E-SIGNATURE:`, 50, currentY);
        doc.font('Helvetica').text(`Name: ${landlord.name}`, 50, currentY + 15);
        doc.text(`Status: VERIFIED via RHMS`, 50, currentY + 30);
        doc.text(`Time: ${new Date(lease.landlordSignature.signedAt).toLocaleString('en-IN')}`, 50, currentY + 45);

        // Tenant Box (Right)
        doc.font('Helvetica-Bold').text(`LICENSEE E-SIGNATURE:`, 300, currentY);
        doc.font('Helvetica').text(`Name: ${tenant.name}`, 300, currentY + 15);
        doc.text(`Status: VERIFIED via RHMS`, 300, currentY + 30);
        doc.text(`Time: ${new Date(lease.tenantSignature.signedAt).toLocaleString('en-IN')}`, 300, currentY + 45);

        doc.moveDown(5);

        // FOOTER COMPLIANCE NOTE
        doc.font('Helvetica-Oblique').fontSize(9).fillColor('grey')
            .text(`Note: This document is executed electronically and authenticated under the Information Technology Act, 2000. This replaces the requirement for a physical Notary Public acknowledgment.`, 50, doc.y, { align: 'center' });

        // Finalize PDF
        doc.end();
    });
};


/* =========================================
   Controller Methods
========================================= */

// 1. Landlord Creates a Lease Draft
export const createLease = async (req, res) => {
    try {
        const { applicationId, startDate, endDate, monthlyRent, securityDeposit, rentDueDay, specialClauses } = req.body;

        // Verify the application exists and is approved
        const application = await Application.findById(applicationId);
        if (!application) return res.status(404).json({ message: "Application not found" });
        if (application.status !== "approved") return res.status(400).json({ message: "Can only create lease for approved applications." });
        if (application.landlordId.toString() !== req.user._id.toString()) return res.status(403).json({ message: "Unauthorized." });

        // Prevent duplicate leases for the same application
        const existingLease = await Lease.findOne({ applicationId });
        if (existingLease) return res.status(400).json({ message: "A lease has already been drafted for this application." });

        const newLease = await Lease.create({
            landlordId: req.user._id,
            tenantId: application.tenantId,
            propertyId: application.propertyId,
            applicationId,
            monthlyRent,
            securityDeposit,
            rentDueDay,
            startDate,
            endDate,
            specialClauses,
            status: "draft"
        });

        return res.status(201).json({ message: "Lease drafted successfully", lease: newLease });
    } catch (error) {
        console.error("Error creating lease:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// 2. Get All Leases for Logged-in User (Works for both Tenant and Landlord)
export const getMyLeases = async (req, res) => {
    try {
        // Find leases where the user is either the landlord OR the tenant
        const filter = req.user.role === 'landlord'
            ? { landlordId: req.user._id }
            : { tenantId: req.user._id };

        const leases = await Lease.find(filter)
            .populate('propertyId', 'title address photos')
            .populate('tenantId', 'name email phone')
            .populate('landlordId', 'name email phone')
            .sort({ createdAt: -1 });

        return res.status(200).json({ count: leases.length, leases });
    } catch (error) {
        console.error("Error fetching leases:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// 3. Digitally Sign the Lease
export const signLease = async (req, res) => {
    try {
        const lease = await Lease.findById(req.params.id);
        if (!lease) return res.status(404).json({ message: "Lease not found" });

        const userId = req.user._id.toString();
        const isLandlord = lease.landlordId.toString() === userId;
        const isTenant = lease.tenantId.toString() === userId;

        if (!isLandlord && !isTenant) {
            return res.status(403).json({ message: "You are not a party to this lease." });
        }

        // Apply signature based on role
        if (isLandlord) {
            if (lease.landlordSignature.isSigned) return res.status(400).json({ message: "You have already signed this lease." });
            lease.landlordSignature = { isSigned: true, signedAt: new Date() };
            lease.status = "pending_tenant_signature";
        }

        if (isTenant) {
            if (lease.tenantSignature.isSigned) return res.status(400).json({ message: "You have already signed this lease." });
            if (!lease.landlordSignature.isSigned) return res.status(400).json({ message: "Landlord must sign the lease first." });

            lease.tenantSignature = { isSigned: true, signedAt: new Date() };
        }

        await lease.save();

        // --- PDF GENERATION TRIGGER ---
        // If BOTH parties have signed, activate the lease and generate the PDF
        if (lease.landlordSignature.isSigned && lease.tenantSignature.isSigned) {
            lease.status = "active";
            await lease.save();

            // Fetch detailed info for the PDF
            const landlord = await User.findById(lease.landlordId);
            const tenant = await User.findById(lease.tenantId);
            const property = await Property.findById(lease.propertyId);

            // Generate and upload PDF
            try {
                const pdfUrl = await generateAndUploadLeasePDF(lease, landlord, tenant, property);

                lease.documentUrl = pdfUrl; // Save Cloudinary URL to database
                await lease.save();

                // Update Property status to 'rented'
                if (property) {
                    property.status = 'rented';
                    await property.save();
                }

            } catch (pdfError) {
                console.error("Failed to generate PDF:", pdfError);
                // Even if PDF fails, the lease is still legally active in DB
            }
        }

        return res.status(200).json({
            message: lease.status === "active" ? "Lease fully signed and activated! PDF generated." : "Signature recorded successfully.",
            lease
        });

    } catch (error) {
        console.error("Error signing lease:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// 4. Get a Single Lease by ID
export const getLeaseById = async (req, res) => {
    try {
        const lease = await Lease.findById(req.params.id)
            .populate('propertyId', 'title address photos type bhk')
            .populate('tenantId', 'name email phone')
            .populate('landlordId', 'name email phone');

        if (!lease) return res.status(404).json({ message: "Lease not found" });

        // Security: Only the involved Landlord or Tenant can view this lease
        const isAuthorized =
            lease.landlordId._id.toString() === req.user._id.toString() ||
            lease.tenantId._id.toString() === req.user._id.toString();

        if (!isAuthorized) {
            return res.status(403).json({ message: "Unauthorized to view this lease." });
        }

        return res.status(200).json({ lease });
    } catch (error) {
        console.error("Error fetching lease details:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// 5. Terminate an Active Lease
export const terminateLease = async (req, res) => {
    try {
        const lease = await Lease.findById(req.params.id);
        if (!lease) return res.status(404).json({ message: "Lease not found" });

        // Security: Only the Landlord can terminate (or you can allow both based on your rules)
        if (lease.landlordId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Only the landlord can terminate this lease." });
        }

        if (lease.status === 'terminated') {
            return res.status(400).json({ message: "Lease is already terminated." });
        }

        lease.status = "terminated";
        await lease.save();

        // Automatically free up the property again!
        const property = await Property.findById(lease.propertyId);
        if (property) {
            property.status = 'available';
            await property.save();
        }

        return res.status(200).json({ message: "Lease terminated successfully. Property is now available.", lease });
    } catch (error) {
        console.error("Error terminating lease:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// 6. Renew a Lease (Creates a new draft based on the old one)
export const renewLease = async (req, res) => {
    try {
        const { newStartDate, newEndDate, newMonthlyRent, newSecurityDeposit } = req.body;

        // 1. Basic body validation (Ensure dates are provided)
        if (!newStartDate || !newEndDate) {
            return res.status(400).json({ message: "New start date and end date are required for renewal." });
        }

        const oldLease = await Lease.findById(req.params.id);
        if (!oldLease) return res.status(404).json({ message: "Original lease not found" });

        if (oldLease.landlordId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Only the landlord can renew a lease." });
        }

        // --- NEW: TIME CHECK LOGIC ---
        const currentDate = new Date();
        const leaseEndDate = new Date(oldLease.endDate);

        // Calculate the date 30 days before the lease ends
        const renewalWindow = new Date(leaseEndDate);
        renewalWindow.setDate(renewalWindow.getDate() - 30);

        // If today is earlier than the renewal window, block it
        if (currentDate < renewalWindow) {
            return res.status(400).json({
                message: "Too early to renew. You can only renew a lease if it is already expired or within 30 days of its end date."
            });
        }
        // -----------------------------

        // Create a new drafted lease legally (new signatures will be required)
        const renewedLease = await Lease.create({
            landlordId: oldLease.landlordId,
            tenantId: oldLease.tenantId,
            propertyId: oldLease.propertyId,
            applicationId: oldLease.applicationId,
            monthlyRent: newMonthlyRent || oldLease.monthlyRent,
            securityDeposit: newSecurityDeposit || oldLease.securityDeposit,
            rentDueDay: oldLease.rentDueDay,
            startDate: newStartDate,
            endDate: newEndDate,
            specialClauses: oldLease.specialClauses,
            status: "draft" // Starts over as a draft waiting for signatures
        });

        // Mark the old one as expired
        oldLease.status = "expired";
        await oldLease.save();

        return res.status(201).json({
            message: "Lease renewed successfully. A new draft has been created for signing.",
            lease: renewedLease
        });
    } catch (error) {
        console.error("Error renewing lease:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

/* =========================================
   Document Management & Admin Routes
========================================= */

// 7. Upload documents to a lease (ID proof, photos)
export const uploadLeaseDocument = async (req, res) => {
    try {
        const lease = await Lease.findById(req.params.id);
        if (!lease) return res.status(404).json({ message: "Lease not found" });

        // Ensure user is part of the lease
        if (lease.landlordId.toString() !== req.user._id.toString() && lease.tenantId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Unauthorized to upload to this lease." });
        }

        if (!req.file) return res.status(400).json({ message: "No file provided." });

        const newDoc = {
            name: req.body.name || "Lease Document",
            url: req.file.path, // Assuming your uploadMiddleware uses Cloudinary
            uploadedBy: req.user._id
        };

        lease.documents.push(newDoc);
        await lease.save();

        return res.status(201).json({ message: "Document uploaded successfully", document: newDoc });
    } catch (error) {
        console.error("Error uploading lease document:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// 8. Get all documents attached to a lease
export const getLeaseDocuments = async (req, res) => {
    try {
        const lease = await Lease.findById(req.params.id);
        if (!lease) return res.status(404).json({ message: "Lease not found" });

        if (lease.landlordId.toString() !== req.user._id.toString() && lease.tenantId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Unauthorized to view these documents." });
        }

        return res.status(200).json({ count: lease.documents.length, documents: lease.documents });
    } catch (error) {
        console.error("Error fetching lease documents:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// 9. Download lease agreement as PDF
export const downloadLeasePDF = async (req, res) => {
    try {
        const lease = await Lease.findById(req.params.id);
        if (!lease) return res.status(404).json({ message: "Lease not found" });

        if (lease.landlordId.toString() !== req.user._id.toString() && lease.tenantId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Unauthorized." });
        }

        if (!lease.documentUrl) {
            return res.status(400).json({ message: "PDF has not been generated yet. Both parties must sign first." });
        }

        // Return the Cloudinary URL so the frontend can open/download it
        return res.status(200).json({ downloadUrl: lease.documentUrl });
    } catch (error) {
        console.error("Error fetching PDF URL:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// 10. Delete an uploaded document
export const deleteLeaseDocument = async (req, res) => {
    try {
        const { docId } = req.params;

        // Find the lease that contains this specific document
        const lease = await Lease.findOne({ "documents._id": docId });
        if (!lease) return res.status(404).json({ message: "Document or lease not found." });

        if (lease.landlordId.toString() !== req.user._id.toString() && lease.tenantId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Unauthorized to delete this document." });
        }

        // Remove the document from the array
        lease.documents = lease.documents.filter(doc => doc._id.toString() !== docId);
        await lease.save();

        return res.status(200).json({ message: "Document deleted successfully" });
    } catch (error) {
        console.error("Error deleting document:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// 11.1 Admin Only: Get Lease Statistics
export const getAdminLeaseStats = async (req, res) => {
    try {
        const activeLeases = await Lease.countDocuments({ status: 'active' });

        res.status(200).json({
            activeLeases
        });
    } catch (error) {
        console.error("Error fetching lease stats:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// 11. Admin Only: Get all leases across the platform
export const getAdminAllLeases = async (req, res) => {
    try {
        const leases = await Lease.find()
            .populate('propertyId')
            .populate('landlordId', 'name email')
            .populate('tenantId', 'name email')
            .sort({ createdAt: -1 });

        return res.status(200).json({ count: leases.length, leases });
    } catch (error) {
        console.error("Error fetching all leases for admin:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// 12. Admin Only: Get leases expiring in next 30 days
export const getExpiringLeases = async (req, res) => {
    try {
        const today = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(today.getDate() + 30);

        const expiringLeases = await Lease.find({
            status: 'active',
            endDate: {
                $gte: today,             // Not already expired
                $lte: thirtyDaysFromNow  // Expiring within 30 days
            }
        })
            .populate('propertyId', 'title')
            .populate('landlordId', 'name email')
            .populate('tenantId', 'name email');

        return res.status(200).json({ count: expiringLeases.length, leases: expiringLeases });
    } catch (error) {
        console.error("Error fetching expiring leases:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};