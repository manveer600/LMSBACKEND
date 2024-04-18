import mongoose from "mongoose";

(()=>{
    try{
        mongoose.connect('mongodb+srv://singhmanveer645:1234567890@cluster0.dd5vd23.mongodb.net/').then((conn)=>{
            console.log(`Connection Successfull to database:${conn.connection.name}`);
        });
    }catch(e){
        console.log(e);
        process.exit(1);
    }
})();
