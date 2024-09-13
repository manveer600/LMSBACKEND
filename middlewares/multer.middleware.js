import multer from 'multer';
import path from 'path'
const upload = multer({
    limits: { fileSize: 50 * 1024 * 1024 * 1024 }, //50GB
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, './uploads');
        },
        filename: function (req, file, cb) {
            cb(null, `${file.fieldname}-${Date.now()}-${file.originalname}`);
        }
    }),
    fileFilter: function (req, file, cb) {
        const extension = path.extname(file.originalname);
        console.log('File extension:', extension);

        const allowedExtensions = ['.png', '.jpg', '.jpeg', '.webp'];

        if (!allowedExtensions.includes(extension.toLowerCase())) {
            console.log('Unsupported file type:', extension);
            return cb(new Error('Unsupported file type'), false);
        }

        cb(null, true);
        console.log('File is valid and uploading...');
    }
});

export default upload;