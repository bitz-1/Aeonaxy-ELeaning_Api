const express = require('express');
const router = express.Router();
const {registerUser,login, verifyToken, updateUserProfile, getUserInfo } = require ("../controllers/authUser");
const apiRoutes = require('./apiRoutes')
 




router.post('/register', async (req, res) => {
    await registerUser(req, res);
});

router.post('/login', async(req,res)=>{
    await login(req,res);
});

router.get('/profile',verifyToken,getUserInfo);

router.post('/profile/update',verifyToken,updateUserProfile);

router.use('/api',verifyToken,apiRoutes);

module.exports = router;