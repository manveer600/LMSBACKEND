import Course from '../models/course.model.js'
import AppError from '../utils/error.utils.js';
import cloudinary from 'cloudinary';
import fs from 'fs';

export const getAllCourses = async (req, res, next) => {
    try {
        const courses = await Course.find({}).select('-lectures');
        res.status(200).json({
            success: true,
            message: 'All Courses',
            courses    /*array of array*/
        })
    } catch (e) {
        return next(new AppError(e.message, 400));
    }
}

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
            lectures: course.lectures
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
            course
        })

    } catch (e) {
        return next(new AppError(e.message, 500));
    }
}

export const addLectureToCourseById = async (req, res, next) => {
    const { title, description } = req.body;
    try {
        const { id } = req.params;

        if (!id) {
            return next(new AppError("Please provide a valid ID", 400))
        }

        if (!title || !description) {
            return next(new AppError("Please fill all the fields", 400))
        }

        const course = await Course.findById(id);

        if (!course) {
            return next(new AppError("No Course Found with this ID", 400))
        }

        let lecture = {};

        if (req.file) {
            try {
                const result = await cloudinary.v2.uploader.upload(req.file.path, {
                    folder: 'lms', // Save files in a folder named lms
                    resource_type: 'video',
                });

                if (result) {
                    lecture.public_id = result.public_id;
                    lecture.secure_url = result.secure_url;
                    console.log("result is", lecture);
                }


                fs.rm(`uploads/${req.file.filename}`, (err) => {
                    if (err) {
                        console.log('Error in removing file');
                    } else {
                        console.log('File removed');
                    }
                });

            } catch (e) {
                console.log(e);
                res.status(500).json({
                    message: 'some error has occured'
                })
            }
        }

        const lectureData = { title, description, lecture };
        console.log(lectureData);
        course.lectures.push(lectureData);

        course.numberOfLectures = course.lectures.length;
        await course.save();

        res.status(200).json({
            success: true,
            message: "Lecture Successfully Added",
            course
        })


    } catch (e) {
        console.log('Error in adding lecture to course');
        console.log(e);
        return next(new AppError(e.message, 400));
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
    console.log('chal shukr h yahan tk toh ponch rha hoon')
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