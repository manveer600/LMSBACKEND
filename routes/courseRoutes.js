import express from "express";
const router = express.Router();

import { getAllCourses, getLecturesByCourseId, createCourse, updateCourseById, removeCourse, addLectureToCourseById, updateLecturesOfSpecificCourse, deleteLecturesOfSpecificCourse, deleteAllCourses, updateFavCourse } from '../controllers/courseController.js'
import { isLoggedIn, authorizedRoles } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";

router.get('/', getAllCourses);
router.post('/', isLoggedIn, authorizedRoles, upload.single('thumbnail'), createCourse);

router.get('/:id', isLoggedIn, getLecturesByCourseId);
router.put('/:id', isLoggedIn, authorizedRoles, upload.single('thumbnail'), updateCourseById);
router.put('/fav/:id', isLoggedIn, updateFavCourse);
router.delete('/deleteallcourses', isLoggedIn, authorizedRoles, deleteAllCourses);
router.delete('/:id', isLoggedIn, authorizedRoles, removeCourse);

router.post('/:id', isLoggedIn, authorizedRoles, addLectureToCourseById);
router.put('/:id/:lectureId', isLoggedIn, authorizedRoles, upload.single('lecture'), updateLecturesOfSpecificCourse)

router.delete('/:id/:lectureId', isLoggedIn, authorizedRoles, deleteLecturesOfSpecificCourse);
export default router;

