const express = require('express');
const router = express.Router();
const {registerUser,login, verifyToken, updateUserProfile, getUserInfo, assignAdminRole } = require ("../controllers/authUser");
const apiRoutes = require('./apiRoutes');
const {getEnrolledCourses, enrollCourses } = require('../controllers/enrollments');



router.post('/register', async (req, res) => {
    await registerUser(req, res);
});

router.post('/login', async(req,res)=>{
    await login(req,res);
});

router.post('/admin',verifyToken,assignAdminRole);

router.get('/profile',verifyToken,getUserInfo);

router.post('/profile/update',verifyToken,updateUserProfile);

router.use('/api',verifyToken,apiRoutes);

router.post ('/api/enrollments',verifyToken,enrollCourses);

router.get('/api/enrollments',verifyToken,getEnrolledCourses);   


module.exports = router;