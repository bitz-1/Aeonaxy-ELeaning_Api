const jwt = require('jsonwebtoken');
const {connect} = require('../config/poolNeonDB');
const bcrypt = require('bcrypt');

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
            throw new Error('Invalid password');
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

function generateToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
}


function verifyToken(req , res , next){
    const token = req.headers.authorization && req.headers.authorization.split(" ")[1];

    if (!token){
        res.status(401).json({message:"Missing Token"});
    }
    try{
        const jwtDcypher = jwt.verify(token,process.env.JWT_SECRET);
        req.user = jwtDcypher;
        next();
    } catch(error){
        console.error("Token verification failed:",error.message);
        res.status(401).json({message:"Invalid Token"});
    }
}

module.exports = {registerUser, login, verifyToken};
