import mongoose from "mongoose";
const favCourseSchema = mongoose.Schema({
    courseId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true, 
    },
    title: {
        type: String,
        required:[true,'Title is required'],
        minLength:[8,'Title must be atleast 8 characters'],
        maxLength:[60,'Title should be atmost 60 characters long.'],
        trim:true,
    },
    description: {
        type: String,
        required:[true,'Description is required'],
        minLength:[20,'Description must be atleast 20 characters long']
    },
    category: {
        type: String,
        required:[true, 'Category is required'],
    },
    thumbnail: {
        public_id: {
            type: String,
            required:true
        },
        secure_url: {
            type: String,
            required:true
        }
    },
    lectures: [
        {
            title: String,
            description: String,
            lecture: {                                     //lecture{public_id, secure_url};
                public_id: {
                    type: String,
                    required:true,
                },
                secure_url: {
                    type: String,
                    required:true
                }
            }
        }
    ],
    numberOfLectures: {
        type: Number,
        default:0,
    },
    createdBy: {
        type: String,
        required:[true,"Insturctor name is required"]
    }
}, { timestamps: true })


const favCourse = mongoose.model('favCourse', favCourseSchema);

export default favCourse;