import { v2 as cloudinary } from 'cloudinary';

export function getCloudinaryConfig() {
    return {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
        apiKey: process.env.CLOUDINARY_API_KEY || '',
        apiSecret: process.env.CLOUDINARY_API_SECRET || ''
    };
}

export function initCloudinary() {
    const config = getCloudinaryConfig();
    
    if (config.cloudName && config.apiKey && config.apiSecret) {
        cloudinary.config({
            cloud_name: config.cloudName,
            api_key: config.apiKey,
            api_secret: config.apiSecret
        });
        console.log('Cloudinary initialized');
    } else {
        console.warn('Cloudinary not configured - file uploads will not work');
    }
    
    return cloudinary;
}

export function getCloudinary() {
    return cloudinary;
}

export default cloudinary;
