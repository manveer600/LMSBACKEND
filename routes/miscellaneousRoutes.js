import { authorizedRoles, isLoggedIn } from "../middlewares/auth.middleware.js";
import {userStats, contactUs, deleteFavCourses, getAllFavCourses} from '../controllers/miscellaneousController.js'
import {favouriteCourses} from '../controllers/miscellaneousController.js'
console.log('yahan tk ponch gya');

import express from "express";
const router = express.Router();

// router.post('/favouriteCourses/:id', isLoggedIn, favouriteCourses);
// router.delete('/favouriteCourses/:id', isLoggedIn, deleteFavCourses);
// router.get('/getAllFavCourses', isLoggedIn, getAllFavCourses);
router.get('/admin/stats/users', isLoggedIn, authorizedRoles, userStats);
router.post('/contact', isLoggedIn, contactUs )

export default router;


