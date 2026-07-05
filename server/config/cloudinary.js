import { v2 as cloudinary } from 'cloudinary';

export function initCloudinary() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export function uploadToCloudinary(fileBuffer, originalName) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'placement-experience-pdfs',
        resource_type: 'raw',
        // Clean name and prefix timestamp
        public_id: `${Date.now()}-${originalName.replace(/\.pdf$/i, '').replace(/[^\w\s-]/g, '')}`,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
}

export function deleteFromCloudinary(publicId) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, { resource_type: 'raw' }, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
  });
}

export default cloudinary;
