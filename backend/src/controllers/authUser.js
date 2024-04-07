const jwt = require('jsonwebtoken');
const {connect} = require('../config/poolNeonDB');
const bcrypt = require('bcrypt');
const cloud= require('../config/cloudinary');
 
// Define the registration function
async function registerUser(req, res) {
    const client = await connect();
    try {
        const {username, email, password} = req.body;
        console.log(req.body);
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await client.query(
            "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING *",
            [username, email, hashedPassword]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }finally{
        client.release()
}};

// user Login 
async function login(req, res) {
    const client = await connect();
    try {
        const {email, password} = req.body;
        const result = await client.query("SELECT * FROM users WHERE email = $1", [email]);
        const user = result.rows[0];
        if(!user){
            return res.status(400).json({message:"User not found"});
        }
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            // throw new Error('Invalid password');
            return res.status(401).json({message:"Invalid Password"});
        }

        const token = generateToken(user.id);
        res.status(200).json({ token });
        console.log(token);
    } catch (error) {
        console.error("Error authenticating user:", error.message);
        res.status(500).send('Server Error');
    } finally{
        client.release();
    }
}
//Token Generator
function generateToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
}


//token verification auth to routes
async function verifyToken(req , res , next){
    const token = req.headers.authorization && req.headers.authorization.split(" ")[1];
    // const decodedToken = jwt.decode(token);
    // console.log(decodedToken);


    if (!token){
        res.status(401).json({message:"Access Denied ! Missing Token"});
    }
    try{
        const decodedToken = jwt.verify(token,process.env.JWT_SECRET);
        req.userId = decodedToken.userId;
        next();
    } catch(error){
        console.error("Token verification failed:",error.message);
        res.status(401).json({message:"Invalid Token"});
    }
}

//get user info profile
async function getUserInfo(req,res) {
    const userId = req.userId
    console.log(userId);
    const client = await connect();
    try {
        const result = await client.query('SELECT id,username, email ,profile_picture FROM users WHERE id = $1', [userId]);
        if (result.rows.length === 0){
            throw new Error ('user not found ');
        }

        return res.json(result.rows[0]);
   
    } catch (error) {
        console.error("Error fetching user information:", error.message);
        return res.status(500).json({ error: 'Server Error fetching user information' });
        
    } finally {
        client.release();
        
    }

}

const updateUserProfile = async(req,res)=>{
    let client;
    try {
        client = await connect();
        const userId = req.userId;
        console.log(userId)
        const {username,email,currentPassword,newPassword} = req.body;
        console.log(username,email,currentPassword,newPassword);

        //check if currentPassword is provided 
        if (!currentPassword){
            return res.status(400).json({message:"Current password is required for profile update"});
        }
        // validate updated data
        if(!username || ! email){
            return res.status(400).json({message:"Username and email are required "});
        }
        //verify the current password 
        const result = await client.query('SELECT password_hash FROM users WHERE id = $1',[userId]);
        if (result.rows.length ===0){
            throw new Error("user not found");
         }
        const user = result.rows[0];
        console.log(user);
        const isPasswordValid = await bcrypt.compare(currentPassword,user.password_hash);
        if (!isPasswordValid){
            return res.status(401).json({message:"Incorrect current password "})
        }
        // if new Newpassword is provided , update the password 
        if (newPassword){
            const hashedPassword = await bcrypt.hash(newPassword,10);
            await client.query('UPDATE users SET password_hash = $1 WHERE id = $2',[hashedPassword,userId]);

        }
        //upload profile to cloudinary
        if (req.files && req.files.profile_picture){
            const image = req.files.profile_picture;
            console.log(image);
            const cloudinaryResult = await cloud.uploader.upload(image.tempFilePath);
            console.log(`Successfully uploaded ${image}`);
            console.log(`Result: ${result.secure_url}`);
            const profilePictureUrl = cloudinaryResult.secure_url;
            console.log(cloudinaryResult);
            await client.query('UPDATE users SET username = $1 , email =$2 , profile_picture = $3 WHERE id =$4',[username,email,profilePictureUrl,userId]);
        }else {
            await client.query('UPDATE users SET username = $1 , email = $2  WHERE id = $3',[username,email,userId]);
        }

        const updateResult = await client.query('SELECT * from users WHERE id = $1',[userId]);
        const updatedProfile =updateResult.rows[0];
        res.status(200).json({message:"profile updated",updatedProfile});
    } catch (error) {
        console.error("Error updating the user profile : ", error.message);
        res.status(500).json({message:"Server Error updating profile"});
        
    } finally{
        client.release();
    }
};


module.exports = {registerUser, login, verifyToken ,updateUserProfile,getUserInfo};

