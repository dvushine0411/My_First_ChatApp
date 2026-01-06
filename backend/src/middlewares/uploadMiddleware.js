import multer from 'multer';
import cloudinary from '../libs/cloudinary.js'; 

// 1. Cấu hình Multer (Lưu vào RAM)
export const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// 2. Hàm helper: Convert Buffer -> Base64 -> Upload Cloudinary
export const uploadImageFromBuffer = (buffer) => {
    return new Promise((resolve, reject) => {
        const b64 = Buffer.from(buffer).toString("base64");
        const dataURI = "data:application/octet-stream;base64," + b64;

        cloudinary.uploader.upload(dataURI, {
            resource_type: "auto",
            folder: "VITChat/images" // Tên folder trên Cloudinary
        }, (error, result) => {
            if (error) return reject(error);
            resolve(result);
        });
    });
};