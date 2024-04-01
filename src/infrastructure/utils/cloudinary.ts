import dotenv from "dotenv";
dotenv.config();

// const cloudinary = require("cloudinary")
//   .v2;
// cloudinary.config({
//   cloud_name: process.env.cloud_NAME,
//   api_key: process.env.cloud_API,
//   api_secret: process.env.cloud_APISECRET,
// });
// module.exports = cloudinary;

import {v2 as cloudinary} from "cloudinary";
          
cloudinary.config({ 
  cloud_name: process.env.cloud_NAME,
  api_key: process.env.cloud_API,
  api_secret: process.env.cloud_APISECRET,

});

export default cloudinary;