import multer from 'multer';
import path from 'path';


const upload = multer({
    dest: 'uploads/',
    limits: { fileSize: 50 * 1024 * 1024 },
    storage: multer.diskStorage({
        destination: "uploads/",
        filename: function (req, file, cb) {
            console.log('MULTER K ANDR HOON BROOOO', `${Date.now()}-${file.originalname}`);
            return cb(null, `${Date.now()}-${file.originalname}`);
        }
    }),
    fileFilter: function(req, file, cb){
        let extension = path.extname(file.originalname);
        if( extension !== '.png' && 
            extension !== '.jpg' && 
            extension !== '.jpeg' && 
            extension !== '.mp4'  && 
            extension !== '.webp'
        ){
            return cb(new Error(`Unsupported file type! ${extension}`), false);       
        }
        cb(null, true);
    },
});

export default upload;





// import multer from 'multer';
// const storage = multer.memoryStorage();
// const singleUpload = multer({ storage }).single('file');

// export default singleUpload;