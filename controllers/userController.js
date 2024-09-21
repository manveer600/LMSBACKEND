import User from "../models/user.model.js";
import AppError from "../utils/error.utils.js";
import emailValidator from 'email-validator';
import bcrypt from 'bcrypt';
import cloudinary from 'cloudinary';
import crypto from 'crypto';
import fs from 'fs';
import sendEmail from "../utils/sendEmail.js";
const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: true,
    sameSite: "none"
}

function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
}

const generateOTP = async (req, res, next) => {
    try {
        const { fullName, email, password } = req.body;
        if (!email) {
            //MERE PASS 1 ERROR OBJECT AAYA MENE USKO AAGE BHEJ DIYA AB AAGE KAHAN ?
            //AAGE MTLB ERROR.MIDDLEWARE.JS ME 
            return next(new AppError('All fields are required', 400));
        }

        const validateEmail = emailValidator.validate(email);
        if (!validateEmail) {
            return next(new AppError('Email is not valid', 400));
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return next(new AppError('Email already exists', 409));
        }

        const otp = generateOtp();
        const subject = `One Time Password`;
        const text = `Your One Time Password`;
        const html = `<h3><b>Your one time password link is this ${otp}.<b/><h3></br>Remember the link is only valid till for 5 mins.`;
        const emailSend = await sendEmail(email, subject, text, html);
        if (emailSend) {
            return res.status(200).json({
                success: true,
                message: `OTP has been sent to ${email} `,
                data: otp
            })
        }
        return res.status(400).json({
            sucess: false,
            message: `Unable to send the otp at ${email}. Please try later`
        })
    } catch (error) {
        console.log('error while generating OTP', error);
        return res.status(400).json({
            success: false,
            message: error?.message
        })
    }

}

const register = async (req, res, next) => {
    console.log('req body is this', req.body);
    console.log(req.file);
    try {
        const { fullName, email, password } = req.body;
        if (!fullName || !email || !password) {
            //MERE PASS 1 ERROR OBJECT AAYA MENE USKO AAGE BHEJ DIYA AB AAGE KAHAN ?
            //AAGE MTLB ERROR.MIDDLEWARE.JS ME 
            return next(new AppError('All fields are required', 400));
        }

        const validateEmail = emailValidator.validate(email);
        if (!validateEmail) {
            return next(new AppError('Email is not valid', 400));
        }

        const userExists = await User.findOne({ email });

        if (userExists) {
            return next(new AppError('Email already exists', 409));
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            fullName,
            email,
            password: hashedPassword,
            avatar: {
                public_id: "dummy",
                secure_url: 'dummy',
            }
        })


        if (!user) {
            return next(new AppError('User registration failed, please try again later', 400));
        }


        if (req.file) {
            console.log(req.file);
            try {
                const result = await cloudinary.v2.uploader.upload(req.file.path, { folder: 'lms' }, (error, result) => {
                    console.log(result, error);
                });
                if (result) {
                    user.avatar.public_id = result.public_id;
                    user.avatar.secure_url = result.secure_url;

                    console.log(user.avatar.public_id);
                    console.log(user.avatar.secure_url);
                    // remove the file from local machine(server)
                    fs.rm(`uploads/${req.file.filename}`, (error) => {
                        if (error) {
                            console.error("Error removing the file:", error);
                        } else {
                            console.log("File removed successfully");
                        }
                    });

                }
            } catch (e) {
                return next(new AppError(e.message, 400));
            }
        }

        await user.save();




        const token = await user.generateJWTToken();
        res.cookie('token', token, cookieOptions)
        user.password = undefined;
        console.log('token ready hai', token);
        console.log(res.cookie);
        return res.status(200).json({
            success: true,
            message: 'User registered successfully',
            data: user
        })

    } catch (e) {
        console.log(e);
        return next(new AppError(e.message, 400));
    }
}

const logout = (req, res) => {
    try {
        res
            .cookie('token', null, {
                secure: true,
                expires: new Date(Date.now() + 0),
                httpOnly: true,
                sameSite: "none"
            })
            .status(200).json({
                success: true,
                message: 'User logged out successfully'
            })
    }
    catch (e) {
        return next(new AppError(e.message, 400));
    }
}

const login = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return next(new AppError('All fields are required', 400));
        }

        const user = await User.findOne({ email }).select('+password');


        if (!user) {
            return next(new AppError(`User doesn't exist`, 400));
        }



        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
            return next(new AppError('Password is incorrect', 400));
        }


        const token = await user.generateJWTToken();
        console.log("Token is:", token);
        user.password = undefined;

        res
            .cookie('token', token, cookieOptions)
            .status(200).json({
                success: true,
                message: "User LoggedIn successfully",
                data: user,
                Token: token
            });


    } catch (e) {
        return next(new AppError(e.message, 500));
    }
}

const getProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;

        if (!userId) {
            return next(new AppError('User not found'));
        }
        const user = await User.findById(userId);

        if (!user) {
            return next(new AppError('User not found'));
        }
        res.status(200).json({
            success: true,
            message: "Fetched User Details",
            data: user
        })
    } catch (err) {
        return next(new AppError(err.message, 400));
    }
}

const forgotPassword = async (req, res, next) => {
    const { email } = req.body;
    if (!email) {
        return next(new AppError('Email Required', 400));
    }

    const user = await User.findOne({ email });
    if (!user) {
        return next(new AppError('Email not registered', 400));
    }

    try {
        const resetToken = await user.generatePasswordResetToken();
        await user.save();

        //send token via email
        const url = `${process.env.FRONTEND_URL}/resetPassword/${resetToken}`
        const subject = 'Reset Password Link';
        const text = "Your reset password link";
        const html = `<h3><b>Your reset password link is this <a href='${url}'> Reset Password Link</a>. You can click here to reset your password.<b/><h3></br>Remember the link is only valid till 15 mins.`
        const emailSend = await sendEmail(email, subject, text, html);
        if (emailSend) {
            return res.status(200).json({
                success: true,
                message: `Reset Link has been sent to ${email} `,
                token: resetToken
            })
        }

        return res.status(400).json({
            success: false,
            message: `Unable to send email at ${email}, please try later `,
        })
    }
    catch (e) {
        user.forgotPasswordExpiry = undefined;
        user.forgotPasswordToken = undefined;

        await user.save();
        return next(new AppError(e.message, 500));

    }
}

const resetPassword = async (req, res, next) => {
    const { password, confirmPassword, resetToken } = req.body;

    if (!password) {
        console.log('Password required');
        return next(new AppError('Password is required', 400));
    }

    if (password != confirmPassword) {
        return next(new AppError('Password and Confirm Password does not match.', 400));
    }

    if (!resetToken) {
        return next(new AppError('Reset Token is missing', 400));
    }

    console.log('working till here');

    const hashToken = crypto.createHash('sha256')
        .update(resetToken)
        .digest('hex');

    console.log("HashForgotPassword Token is: ", hashToken);

    try {
        const user = await User.findOne({
            forgotPasswordToken: hashToken,
            forgotPasswordExpiry: { $gt: Date.now() }
        });

        if (!user) {
            return next(new AppError('Link Expired. Go Back and click on Forget Password again.', 400));
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        user.password = hashedPassword;
        user.forgotPasswordExpiry = undefined;
        user.forgotPasswordToken = undefined;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password Changed Successfully'
        })

    } catch (e) {
        return next(new AppError(e.message, 400));
    }


}

const changePassword = async (req, res, next) => {
    const { oldPassword, newPassword } = req.body;
    const { id } = req.user;


    if (!oldPassword || !newPassword) {
        return next(new AppError('Both old and new passwords are required to update your password', 400))
    }

    if (!id) {
        return next(new AppError('User does not exists', 400));
    }


    if (oldPassword == newPassword) {
        return next(new AppError('New Password cannot be same as Old Password', 400));
    }


    try {
        const user = await User.findById(id).select('+password');

        const isPasswordCorrect = await bcrypt.compare(oldPassword, user.password);

        if (!isPasswordCorrect) {
            return next(new AppError('Password does not match', 400));
        }


        const encryptedPassword = await bcrypt.hash(newPassword, 10);
        user.password = encryptedPassword;

        await user.save();
        user.password = undefined;
        return res.status(200).json({
            success: true,
            message: "Password changed successfully"
        })
    } catch (e) {
        return next(new AppError(e.message, 400));
    }
}

const updateUser = async (req, res, next) => {

    // if (Object.keys(req.body).length === 0) {
    //     return res.status(200).json({
    //         message: "Nothing to update"
    //     })
    // }

    const { fullName } = req.body;

    const { id } = req.user;

    const user = await User.findById(id);

    if (!user) {
        return next(new AppError('No such user found in the database', 404));
    }

    if (req.body.fullName) {
        user.fullName = fullName;
    }

    if (req.file) {
        await cloudinary.v2.uploader.destroy(user.avatar.public_id);

        user.avatar.public_id = null;
        user.avatar.secure_url = null;

        let result;
        try {
            result = await cloudinary.v2.uploader.upload(req.file.path, { folder: 'lms' });
        } catch (e) {
            console.log('Error uploading to cloudinary', error);
        }

        if (result) {
            user.avatar.public_id = result.public_id;
            user.avatar.secure_url = result.secure_url;

            console.log(user.avatar.public_id);
            console.log(user.avatar.secure_url);


            fs.unlink(`uploads/${req.file.filename}`, (error) => {
                if (error) {
                    console.error("Error removing the file:", error);
                } else {
                    console.log("File removed successfully");
                }
            });
        }
    }


    try {
        await user.save();

        return res.status(200).json({
            success: true,
            message: "User details updated successfully"
        });
    }

    catch (e) {
        return next(new AppError(e.message, 400));
    }
}


const deleteUser = async (req, res, next) => {
    const { email, password } = req.body;


    if (!password || !email) {
        return next(new AppError('Please provide your password and email', 400))
    }

    try {
        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            // User with the provided email does not exist
            return res.status(404).json({
                message: 'User not found',
            });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
            return next(new AppError('Password Incorrect'), 400);
        }

        //delete avatar from cloudinary
        if (user.avatar) {
            await cloudinary.v2.uploader.destroy(user.avatar.public_id);
        } else {
            console.log("No avatar on cloudinary");
        }


        await User.deleteOne({ _id: user._id });

        return res.status(200).json({
            message: 'User deleted successfully',
        });
    } catch (e) {
        console.log(e.message);
        return next(new AppError('Something went wrong', 500))
    }

}


export { register, login, logout, getProfile, forgotPassword, resetPassword, changePassword, updateUser, deleteUser, generateOTP };