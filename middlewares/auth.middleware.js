import jwt from "jsonwebtoken";
import AppError from "../utils/error.utils.js";
import User from "../models/user.model.js";
export const isLoggedIn = async (req, res, next) => {
    try {
        const { token } = req.cookies;
        if (!token) {
            return res.status(400).json({
                success:false,
                message:'Unauthenticated, Please login.'
            })
        }

        const userDetails = await jwt.verify(token, process.env.JWT_SECRET);
        req.user = userDetails;
        next();

    } catch (e) {
        console.log('error is this', e);
        return res.status(400).json({
            success:false,
            message:e.message
        })
    }
}

export const authorizedRoles = (req, res, next) => {
    if (req.user.role === "USER") {
        return res.status(400).json({
            success: false,
            message: "You don't have permission to access this"
        })
    }
    next();
}

export const authorizedSubscribers = async (req, res, next) => {
    const user = await User.findById(req.user.id);
    console.log("authorizedSubscribers me user aa rha hai :", user);
    if (user.role == 'ADMIN' || user.subscription.status !== 'active') {
        return next(new AppError('Access denied! You are not a subscriber or your subscription has been cancelled', 403));
    }
    next();
}




