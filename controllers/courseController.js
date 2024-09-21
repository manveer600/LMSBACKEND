import Course from '../models/course.model.js'
import AppError from '../utils/error.utils.js';
import cloudinary from 'cloudinary';
import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const uploadFolder = path.join(__dirname, '../uploads');

if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder, { recursive: true });
}

export const getAllCourses = async (req, res, next) => {
    try {
        const where = {};

        if (req.query.title) {
            const searchItem = { $regex: req.query.title, $options: 'i' };

            where.$or = [
                { title: searchItem },
                { category: searchItem },
                { createdBy: searchItem }
            ]
        }

        console.log('where is this', where);
        const courses = await Course.find(where).select('-lectures');
        res.status(200).json({
            success: true,
            message: 'All Courses',
            data: courses
        });
    } catch (e) {
        console.log('Error while getting all courses', e);
        return next(new AppError(e.message, 400));
    }
};

export const getLecturesByCourseId = async (req, res, next) => {

    try {
        const { id } = req.params;

        const course = await Course.findById(id);

        if (!course) {
            return next(new AppError('Course does not exist with this id', 400));
        }

        res.status(200).json({
            success: true,
            message: `${course.title} lectures fetched successfully`,
            data: course.lectures
        })

    } catch (e) {
        return next(new AppError(e.message, 400));
    }



}

export const createCourse = async (req, res, next) => {
    try {
        const { title, description, createdBy, category } = req.body;

        if (!title || !description || !createdBy || !category) {
            return next(new AppError('All fields are required', 400));
        }

        const course = await Course.create({
            title,
            description,
            createdBy,
            category,
            thumbnail: {
                public_id: "dummy",
                secure_url: "dummy"
            }
        })

        if (!course) {
            return next(new AppError(`Course can't be created right now. Please try again later`, 500));
        }


        if (req.file) {
            try {
                const result = await cloudinary.v2.uploader.upload(req.file.path, { folder: 'lms' });
                if (result) {
                    course.thumbnail.secure_url = result.secure_url;
                    course.thumbnail.public_id = result.public_id;
                }

                fs.rm(`uploads/${req.file.filename}`, (err) => {
                    if (err) {
                        console.log('Error in removing file', err);
                    } else {
                        console.log('File removed');
                    }
                });
            } catch (e) {
                console.log(e);
                res.status(500).json({
                    message: "some error has occured"
                })
            }


        }

        await course.save();

        res.status(200).json({
            success: true,
            Message: "Course Created Successfully",
            course
        })

    } catch (e) {
        return next(new AppError(e.message, 500));
    }
}

export const removeCourse = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return next(new AppError('Course with give id does not exist', 400));
        }

        await Course.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Course has been successfully deleted"
        })
    }
    catch (e) {
        return next(new AppError(e.message, 500));
    }
}

export const updateCourseById = async (req, res, next) => {

    if (Object.keys(req.body).length === 0) {
        return res.status(200).json({
            Message: "Nothing to update"
        })
    }

    try {
        const { id } = req.params;

        const { title, description, createdBy, category } = req.body;

        const course = await Course.findById(id);

        if (!course) {
            return next(new AppError('Course does not exist with this id', 400));
        }

        if (description) {
            course.description = description;
        }

        if (category) {
            course.category = category;
        }

        if (createdBy) {
            course.createdBy = createdBy;
        }

        if (title) {
            course.title = title;
        }

        if (req.file) {
            await cloudinary.v2.uploader.destroy(course.thumbnail.public_id);
            course.thumbnail.secure_url = "dummy";
            course.thumbnail.public_id = "dummy";

            const result = await cloudinary.v2.uploader.upload(req.file.path, { folder: 'lms' });

            if (result) {
                course.thumbnail.secure_url = result.secure_url;
                course.thumbnail.public_id = result.public_id;
            }

            fs.rm(`uploads/${req.file.filename}`, (err) => {
                if (err) {
                    console.log('Error in removing file');
                } else {
                    console.log('File removed');
                }
            });
        }

        await course.save();

        return res.status(200).json({
            Success: true,
            Message: 'Course Updated Successfully',
            data: course
        })

    } catch (e) {
        return next(new AppError(e.message, 500));
    }
}

export const updateFavCourse = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;   
        const course = await Course.findById(id);
        if (!course) {
            return next(new AppError('Course does not exist with this id', 400));
        }
        const favCourseIndex = course.favCourse.findIndex((fav) => fav.userId.toString() === userId);
        console.log('index', favCourseIndex);
        let returnData;
        if (favCourseIndex == -1) {
            const favouriteCourse = { userId: userId, value: true };
            course.favCourse.push(favouriteCourse);
            returnData = course.favCourse[0];
        } else {
            course.favCourse[favCourseIndex].value = !course.favCourse[favCourseIndex].value;
            returnData = course.favCourse[favCourseIndex];
        }
        await course.save();
        return res.status(200).json({
            success: true,
            message: 'Fav Course Updated Successfully',
            data: course,
            favCourseData: returnData
        })


    } catch (e) {
        console.log('error updating fav course', e);
        return next(new AppError(e.message, 500));
    }
}

// export const getAllFavCourses = async(req,res,next) =>{
//     const favCourses = 
// }

export const addLectureToCourseById = async (req, res, next) => {
    try {
        upload(req, res, async function (err) {
            if (err) {
                console.log('error while adding lecture', err.message);
                return res.status(400).json({ success: false, message: err.message });
                // return next(new AppError(err.message, 400));
            }
            else {
                if (!req.file) {
                    return res.status(400).json({
                        success: false,
                        message: 'Kindly upload a lecture'
                    })
                } else {
                    const { title, description } = req.body;
                    try {
                        const { id } = req.params;

                        if (!id) {
                            return res.status(400).json({
                                success: false,
                                message: 'Course is not valid'
                            })
                        }

                        if (!title || !description) {
                            return res.status(400).json({
                                success: false,
                                message: 'Title and description both are required'
                            })
                        }

                        const course = await Course.findById(id);

                        if (!course) {
                            return res.status(400).json({
                                success: false,
                                message: 'No course found'
                            })
                        }

                        let lecture = {};

                        //let's upload a lecture here
                        try {
                            const result = await cloudinary.v2.uploader.upload(req.file.path, {
                                folder: 'lms', // Save files in a folder named lms
                                resource_type: 'video',
                            });

                            if (result) {
                                lecture.public_id = result.public_id;
                                lecture.secure_url = result.secure_url;
                            }


                            fs.unlink(`uploads/${req.file.filename}`, (err) => {
                                if (err) {
                                    console.log('Error in removing file');
                                } else {
                                    console.log('File removed');
                                }
                            });

                        } catch (e) {
                            console.log(e);
                            res.status(500).json({
                                success: false,
                                message: 'There is an error while uploading a video.'
                            })
                        }

                        const lectureData = { title, description, lecture };
                        console.log(lectureData);
                        course.lectures.push(lectureData);

                        course.numberOfLectures = course.lectures.length;
                        await course.save();

                        return res.status(200).json({
                            success: true,
                            message: "Lecture Added Successfully",
                            data: course
                        })


                    } catch (e) {
                        console.log(e);
                        return res.status(400).json({
                            success: false,
                            message: e.message
                        })
                    }
                }
            }
        })
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

export const updateLecturesOfSpecificCourse = async (req, res, next) => {
    try {
        if (Object.keys(req.body).length === 0) {
            return res.status(200).json({
                Message: "Nothing to update"
            })
        }

        const { title, description } = req.body;
        console.log("Title is:", title);
        console.log("Description is:", description);

        const { id } = req.params;

        if (!id) {
            return next(new AppError("Please provide a valid id for the course.", 400));
        }

        const { lectureId } = req.params;

        if (!lectureId) {
            return next(new AppError("Please provide a valid id for the lecture.", 400));
        }


        const course = await Course.findById(id);

        if (!course) {
            return next(new AppError("No such course found.", 404));
        }

        const lecture = await course.lectures.find(obj => obj._id == lectureId);
        if (!lecture) {
            return next(new AppError("Lecture not found", 404));
        }

        console.log("Lecture found is:", lecture);

        if (title) {
            lecture.title = title;
        }

        if (description) {
            lecture.description = description;
        }


        if (req.file) {
            await cloudinary.v2.uploader.destroy(lecture.lecture.public_id);
            lecture.lecture.public_id = 'dummy';
            lecture.lecture.secure_url = 'dummy';

            const result = await cloudinary.v2.uploader.upload(req.file.path, { folder: 'lms' });
            console.log("Result is:", result);
            if (result) {
                lecture.lecture.public_id = result.public_id;
                lecture.lecture.secure_url = result.secure_url;
            }

            console.log("Req file is:");
            console.log(req.file);


            fs.rm(`uploads/${req.file.filename}`, (err) => {
                if (err) {
                    console.log('Error in removing file');
                } else {
                    console.log('File removed');
                }
            });
        }

        await course.save();
        return res.status(201).json({
            Message: "Lecture updated successfully",
            Success: "true",
            Lecture: lecture
        })
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
}

export const deleteLecturesOfSpecificCourse = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return next(new AppError("Please provide a valid id for the course.", 400));
        }

        const { lectureId } = req.params;

        if (!lectureId) {
            return next(new AppError("Please provide a valid id for the lecture.", 400));
        }



        const course = await Course.findById(id);
        console.log(course);
        console.log(lectureId);
        console.log(id)
        if (!course) {
            return next(new AppError("No such course found.", 404));
        }

        const lectureIndex = await course.lectures.findIndex(obj => obj._id.toString() === lectureId.toString());
        console.log(lectureIndex);
        if (lectureIndex == -1) {
            return next(new AppError('Lecture not found with this id', 404));
        }

        course.lectures.splice(lectureIndex, 1);
        await course.save();

        return res.status(200).json({
            Message: "Lecture deleted successfully",
            Success: "true"
        })
    } catch (e) {
        console.log(e);
        return next(new AppError(e.message, 500));
    }
}

export const deleteAllCourses = async (req, res, next) => {
    try {
        // Use the Mongoose model directly to delete all documents from the collection
        await Course.deleteMany({});

        return res.status(200).json({
            success: true,
            message: "Deleted all courses."
        });
    } catch (e) {
        console.log(e);
        return next(new AppError(e.message, 500));
    }
};

const upload = multer({
    limits: { fileSize: 50 * 1024 * 1024 * 1024 }, //50GB
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, uploadFolder);
        },
        filename: function (req, file, cb) {
            cb(null, `${file.fieldname}-${Date.now()}-${file.originalname}`);
        }
    }),
    // fileFilter: function (req, file, cb) {
    //     const extension = path.extname(file.originalname);

    //     const allowedExtensions = ['.png', '.jpg', '.jpeg', '.webp'];

    //     if (!allowedExtensions.includes(extension.toLowerCase())) {
    //         console.log('Unsupported file type:', extension);
    //         return cb(new Error('Unsupported file type'), false);
    //     }

    //     cb(null, true);
    //     console.log('File is valid and uploading...');
    // }
}).single('lecture');