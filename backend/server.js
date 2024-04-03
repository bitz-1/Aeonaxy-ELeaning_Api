//modules 
const express = require('express');
// const cookieSession = require('cookie-session');
const resend = require('resend');
const bodyParser = require('body-parser');
// const {getPg} = require('./src/config/neonDB');
require('dotenv').config();
require('../backend/src/config/poolNeonDB');
const authRoutes = require('./src/routes/authRoutes')

//server Initializationo
const app = express();
const PORT = process.env.PORT;

//middleware

app.use(bodyParser.json());


app.use('/api',authRoutes);

app.get('/', (req, res)=>{
    res.send("Aeonaxy-Api");
}); 
// example route to test the database 
// app.get('/api', async (req, res)=>{
//     try {
//         await getPgVersion();
//         res.send('check the console for NEON_PG DB version');
//     } catch (error) {
//         console.error('Error getting Neon_PG version', error);
//         res.status(500).send('Internal Error');
//     }
// });

//connection
app.listen(PORT,(error)=>{
    if (!error)
       console.log(`Server is running up on port ${PORT}`)
    else
       console.log("Error Occured ! Server can't start",error)

});