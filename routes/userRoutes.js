import express from "express";
import {isLoggedIn} from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js"
const router = express.Router();
import { register, login, logout, getProfile, forgotPassword, resetPassword, changePassword, updateUser, deleteUser, generateOTP} from "../controllers/userController.js";
router.post('/register', upload.single('avatar') , register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/me', isLoggedIn ,getProfile);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/change-password', isLoggedIn, changePassword);
router.put('/update-user', isLoggedIn,upload.single('avatar'), updateUser);
router.delete('/delete-user', deleteUser);
router.post('/generateOtp', generateOTP)

export default router;