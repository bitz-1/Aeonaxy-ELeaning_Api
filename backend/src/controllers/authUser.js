const jwt = require('jsonwebtoken');
const {connect} = require('../config/poolNeonDB');
const bcrypt = require('bcrypt');
const cloud = require('../config/cloudinary');
const {Resend} = require('resend');
const fs = require('fs');
const path = require('path');
const logger = require('../config/logger');


const resend = new Resend(process.env.RESEND_KEY);

 
// Define the registration function
async function registerUser(req, res) {
    const client = await connect();
    let mail ;
    try {
        const {username,fullname, email, password} = req.body;
        logger.info(`Registering user: ${username}, ${fullname}, ${email}`);
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await client.query(
            "INSERT INTO users (username,fullname, email, password_hash) VALUES ($1, $2, $3, $4) RETURNING *",
            [username,fullname, email, hashedPassword]);
        logger.info("User registered successfully.");
        const emailHtmlPath= path.join(__dirname,'email','welcome_email.html');
        const emailHtml = fs.readFileSync(emailHtmlPath,'utf8');
          mail  = await resend.emails.send({
            from : 'noreply@bitzdev.tech',
            to : email,
            subject:'Welcome to Aeonaxy ELearning',
            html:emailHtml.replace(/\${fullname}/g,fullname)
        });
        logger.info("Welcome email sent.");
        res.status(201).json({user:result.rows[0],mail});
    } catch (error) {
        logger.error("Error registering user:", error.message);
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
            logger.warn(`User with email ${email} not found.`);
            return res.status(400).json({message:"User not found"});
        }
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
           
            logger.warn(`Invalid password for user with email ${email}.`);
            return res.status(401).json({message:"Invalid Password"});
        }

        const token = generateToken(user.id);
        logger.info(`User with email ${email} authenticated successfully.`);
        res.status(200).json({ token });
        console.log(token);
    } catch (error) {
        logger.error("Error authenticating user:", error.message);
        res.status(500).send('Server Error');
    } finally{
        client.release();
    }
}
//Token Generator
function generateToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '8h' });
}




//token verification auth to routes
async function verifyToken(req , res , next){
    logger.info("Verifying token.");
    const token = req.headers.authorization && req.headers.authorization.split(" ")[1];
 

    if (!token){
       logger.warn("Access Denied! Missing Token.");
       return res.status(401).json({message:"Access Denied ! Missing Token"});
    }
    try{
        const decodedToken = jwt.verify(token,process.env.JWT_SECRET);
        req.userId = decodedToken.userId;
        logger.info("Token verification successful.");
        next();
    } catch(error){
       logger.error("Token verification failed:", error.message);
       return  res.status(401).json({message:"Invalid Token"});
    }
}


async function assignAdminRole(req, res) {
    const { username, password, secretPassword } = req.body;
    logger.info(`Assigning admin role for user: ${username}`);
    const client = await connect();
    try {
        
        if (secretPassword !== process.env.ADMIN_KEY) {
            logger.warn("Unauthorized attempt to assign admin role without correct secret password.");
            return res.status(401).json({ message: "Secret password required to assign admin role" });
        }


        const result = await client.query("SELECT * FROM users WHERE username = $1", [username]);
        const user = result.rows[0];
        if (!user) {
            logger.warn(`User with username ${username} not found.`);
            return res.status(400).json({ message: "User not found" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            logger.warn(`Invalid password provided for user with username ${username}.`);
            return res.status(401).json({ message: "Invalid password" });
        }

        if (user.role === 'admin') {
            logger.warn(`User with username ${username} is already an admin.`);
            return res.status(400).json({ message: "User is already an admin" });
        }

      
        await client.query("UPDATE users SET role = 'admin' WHERE username = $1", [username]);
        logger.info(`Admin role assigned successfully for user: ${username}`);
        res.status(200).json({ message: 'Admin role assigned successfully.' });

    } catch (error) {
        logger.error("Error assigning admin role:", error.message);
        res.status(500).send('Server Error');
    } finally {
        client.release();
    }
}



//get user info profile
async function getUserInfo(req,res) {
    const userId = req.userId
    logger.info(`Fetching user information for user with ID: ${userId}`);
    const client = await connect();
    try {
        const result = await client.query('SELECT id,username,fullname, email ,profile_picture , role  FROM users WHERE id = $1', [userId]);
        if (result.rows.length === 0){
          logger.warn(`User with ID ${userId} not found.`);
            throw new Error ('user not found ');
        }
        logger.info(`User information fetched successfully for user with ID: ${userId}`);
        return res.json(result.rows[0]);
   
    } catch (error) {
         logger.error("Error fetching user information:", error.message);
        return res.status(500).json({ error: 'Server Error fetching user information' });
        
    } finally {
        client.release();
        
    }

}
// updating user profile

const updateUserProfile = async(req,res)=>{
    let client;
    try {
        logger.info("Updating user profile.");
        client = await connect();
        const userId = req.userId;
        logger.info(`User ID: ${userId}`);
        const {username,fullname,email,currentPassword,newPassword} = req.body;
        logger.info(`Update data received: ${JSON.stringify(req.body)}`);

        //check if currentPassword is provided 
        if (!currentPassword){
            logger.warn("Current password is required for profile update.");
            return res.status(400).json({message:"Current password is required for profile update"});
        }
        // validate updated data
        if(!username || ! email || !fullname){
            logger.warn("username, fullname, and email are required for profile update.");
            return res.status(400).json({message:"username ,fullname and email are required "});
        }
        //verify the current password 
        const result = await client.query('SELECT password_hash FROM users WHERE id = $1',[userId]);
        if (result.rows.length ===0){
            logger.error("User not found.");
            throw new Error("user not found");
         }
        const user = result.rows[0];
        const isPasswordValid = await bcrypt.compare(currentPassword,user.password_hash);
        if (!isPasswordValid){
            logger.warn("Incorrect current password.");
            return res.status(401).json({message:"Incorrect current password "})
        }
        // if new Newpassword is provided , update the password 
        if (newPassword){
            const hashedPassword = await bcrypt.hash(newPassword,10);
            await client.query('UPDATE users SET password_hash = $1 WHERE id = $2',[hashedPassword,userId]);
            logger.info("Password updated successfully.");

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
            await client.query('UPDATE users SET username = $1,fullname = $2 , email =$3 , profile_picture = $4 WHERE id =$5',[username,fullname,email,profilePictureUrl,userId]);
            logger.info("Profile picture uploaded successfully.");
        }else {
            await client.query('UPDATE users SET username = $1 ,fullname =$2 , email = $3  WHERE id = $4',[username,fullname,email,userId]);
        }

        const updateResult = await client.query('SELECT * from users WHERE id = $1',[userId]);
        const updatedProfile =updateResult.rows[0];
        logger.info("User profile updated successfully.")
        res.status(200).json({message:"profile updated",updatedProfile});
    } catch (error) {
        logger.error("Error updating the user profile:", error.message);
        res.status(500).json({message:"Server Error updating profile"});
        
    } finally{
        client.release();
    }
};


module.exports = {registerUser, login, verifyToken ,updateUserProfile,getUserInfo,assignAdminRole};

