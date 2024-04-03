const express = require('express');
const router = express.Router();
const {registerUser,login, verifyToken} = require ("../controllers/authUser");

router.post('/register', async (req, res) => {
    await registerUser(req, res);
});

router.post('/login', async(req,res)=>{
    await login(req,res);
});

router.get('/home-profile',verifyToken,(req,res)=>{
    res.json({user:req.user})
} )


module.exports = router;