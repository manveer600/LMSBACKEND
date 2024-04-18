import express from 'express';
const router = express.Router();

import {getRazorpayApiKey, buySubscription, verifySubscription, cancelSubscription, allPayments} from "../controllers/paymentController.js"
import { authorizedRoles, isLoggedIn, authorizedSubscribers } from '../middlewares/auth.middleware.js';
console.log('payment');
router.get('/razorpay-key', isLoggedIn, getRazorpayApiKey);
router.post('/subscribe', isLoggedIn,  buySubscription);
router.post('/verify', isLoggedIn, verifySubscription);
router.post('/unsubscribe', isLoggedIn, authorizedSubscribers, cancelSubscription);
router.get('/', isLoggedIn , authorizedRoles ,allPayments);

export default router;