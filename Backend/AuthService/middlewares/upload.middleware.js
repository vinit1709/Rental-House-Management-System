import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';
dotenv.config();

// Ensure you configure Cloudinary with your .env variables somewhere in your app setup
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

/* =========================================
   1. Storage Configuration for Identity/KYC Docs
========================================= */
const kycStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'rhms/users/kyc_documents', // Separated from properties
        allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'webp'], 
        // Cloudinary tip: PDFs are fully supported and great for document uploads!
    },
});

// Export the customized multer instances for Auth routes
export const uploadIdentityDoc = multer({ 
    storage: kycStorage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit for high-res IDs or PDFs
});