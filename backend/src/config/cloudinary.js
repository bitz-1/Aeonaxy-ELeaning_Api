const cloud = require('cloudinary').v2;
require('dotenv').config();

let {CLOUD_NAME,API_KEY,API_SECRECT} = process.env;

cloud.config({
    cloud_name:CLOUD_NAME,
    api_key:API_KEY,
    api_secret:API_SECRECT
})


module.exports = cloud;



