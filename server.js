import { config } from 'dotenv';
config();
import "./config/dbConnection.js"
import Razorpay from 'razorpay';
import app from './app.js';
const PORT = process.env.PORT || 5000;

import {v2 as cloudinary} from 'cloudinary';
          
cloudinary.config({ 
  cloud_name: process.env.CLOUDNAME,
  api_key: process.env.APIKEY,
  api_secret: process.env.APISECRET
});

export const razorpay = new Razorpay({
  key_id:process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET
})

app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
})








// import { config } from 'dotenv';
// config();
// import "./config/dbConnection.js";
// import Razorpay from 'razorpay';
// import app from './app.js';
// const PORT = process.env.PORT || 5000;

// import {v2 as cloudinary} from 'cloudinary';

// cloudinary.config({ 
//   cloud_name: process.env.CLOUDNAME,
//   api_key: process.env.APIKEY,
//   api_secret: process.env.APISECRET
// });

// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_SECRET
// });

// export default app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });




