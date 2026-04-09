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
   1. Storage Configuration for Maintenance Photos
========================================= */
const maintenanceStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'rhms/maintenance/images', // Neatly separated folder in your Cloudinary!
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'], // Strictly images for repairs
        resource_type: 'auto',
    },
});

// Export the customized multer instance for Maintenance routes
// (Named exactly 'upload' so it matches what we wrote in maintenance.routes.js)
export const upload = multer({
    storage: maintenanceStorage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit is perfect for high-res phone photos
});