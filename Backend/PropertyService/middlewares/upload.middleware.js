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
   1. Storage Configuration for Images
========================================= */
const imageStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'rhms/properties/images',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        // Optional: you can add transformations here to optimize image size
    },
});

/* =========================================
   2. Storage Configuration for Documents
========================================= */
const documentStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'rhms/properties/documents',
        // Notice we allow 'pdf' here alongside image formats for scanned documents
        allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'], 
    },
});

// Export the customized multer instances
export const uploadPropertyImages = multer({ 
    storage: imageStorage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit per image
});

export const uploadVerificationDocs = multer({ 
    storage: documentStorage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit for documents/PDFs
});