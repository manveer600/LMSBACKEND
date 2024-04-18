import Course from "../models/course.model.js";
import User from "../models/user.model.js"
import favCourse from "../models/fav.course.model.js";
import AppError from "../utils/error.utils.js";

export const userStats = async(req,res) => {
    console.log(req.user);
    const allUserCounts = await User.countDocuments();

    const subscribedUsersCount = await User.countDocuments({
        "subscription.status":"active"
    })

    console.log(subscribedUsersCount);
    return res.status(200).json({
        success:true,
        message:'All registered users count',
        allUserCounts,
        subscribedUsersCount
    });
}

export const contactUs = async (req, res) => {
    const { name, email, message } = req.body;
    console.log(name);
    console.log(email);
    console.log(message);
    if (!name || !email || !message) {
        return res.status(400).json({
            success: false,
            message: 'Every field is required',
        });
    }

    try {
        const user = await User.create({
            name,
            email,
            message,
        });

        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Message saved successfully',
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Error saving message to the database',
            error: error.message,
        });
    }
};

export const favouriteCourses = async (req, res, next) =>{
    const {id} = req.params;

    const favouriteCourse = await Course.findById(id);

    if(!favouriteCourse){
        return res.status(400).json({
            success:false,
            message:"No such course exists",
        })
    }
    console.log(favouriteCourse);
    const existingFavCourse = await favCourse.findOne({courseId:id});
    console.log('exisiting fav course ', existingFavCourse);
    if(existingFavCourse){
        return next(new AppError('Already added to favourites',400));
    }
    const favoCourse = await favCourse.create({
        courseId:id,
        thumbnail:{
            public_id:favouriteCourse.thumbnail.public_id,
            secure_url:favouriteCourse.thumbnail.secure_url
        },
        title:favouriteCourse.title,
        description:favouriteCourse.description, 
        category:favouriteCourse.category, 
        numberOfLectures:favouriteCourse.numberOfLectures, 
        createdBy:favouriteCourse.createdBy, 
        lectures:favouriteCourse.lectures,
        createdAt:favouriteCourse.createdAt, 
        updatedAt:favouriteCourse.updatedAt
    })
    await favoCourse.save();
    return res.status(200).json({
        success:true,
        course:favoCourse,
    })
}

export const deleteFavCourses = async(req,res,next) => {
    const {id} = req.params;
    console.log(id);
    const deletedFav = await favCourse.findOneAndDelete({courseId:id});
    if (!deletedFav) {
        return res.status(400).json({
            status: 'fail',
            message:'The Favorite course was not found'
        })
    }
    //Give the user access to the course they have removed from their favorites
    return res.status(200).json({
        success:true,
        message:'Course removed from favourites'
    })
}

export const getAllFavCourses = async(req,res,next) =>{
    try{
        const courses = await favCourse.find({}).select('-lectures');

        return res.status(200).json({
            success:true,
            courses:courses,
            message:'Courses fetched successfully'
        })
    }catch(e){
        console.log(e);
    }
}