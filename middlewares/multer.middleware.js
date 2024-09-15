import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

// Resolve the current file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define the upload destination folder path
const uploadFolder = path.join(__dirname, '../uploads');

// Ensure the upload folder exists
if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder, { recursive: true });
}

// Set up Multer configuration
const upload = multer({
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB file size limit
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            console.log('Directory for upload:', uploadFolder);
            cb(null, uploadFolder); // Set the uploads folder as the destination
        },
        filename: function (req, file, cb) {
            // Generate a unique filename
            cb(null, `${file.fieldname}-${Date.now()}-${file.originalname}`);
        }
    }),
    fileFilter: function (req, file, cb) {
        const extension = path.extname(file.originalname).toLowerCase();
        console.log('File extension:', extension);

        // Define allowed file extensions
        const allowedExtensions = ['.png', '.jpg', '.jpeg', '.webp'];

        if (!allowedExtensions.includes(extension)) {
            console.log('Unsupported file type:', extension);
            return cb(new Error('Unsupported file type'), false);
        }

        cb(null, true);
        console.log('File is valid and uploading...');
    }
});

export default upload;
