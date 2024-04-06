const express = require('express');
const router = express.Router();
const {registerUser,login, verifyToken, updateUserProfile, getUserInfo } = require ("../controllers/authUser");
// const{connect} = require('../config/poolNeonDB');
const cloud = require('../config/cloudinary');
const bcrypt = require('bcrypt');



router.post('/register', async (req, res) => {
    await registerUser(req, res);
});

router.post('/login', async(req,res)=>{
    await login(req,res);
});

router.get('/profile',verifyToken,getUserInfo);

router.post('/profile/update',verifyToken,updateUserProfile);
    

module.exports = router;