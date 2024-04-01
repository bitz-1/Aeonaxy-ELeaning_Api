//modules 
const express = require('express');
const passport = require('passport');
const cookieSession = require('cookie-session');
const pg = require('pg');
const resend = require('resend');
require('dotenv/config');



//server Initializationo
const app = express();
const PORT = process.env.PORT;

//middleware
app.use(express.json());

app.get('/', (req, res)=>{
    res.send("Aeonaxy-Api");
});

//connection
app.listen(PORT,(error)=>{
    if (!error)
       console.log(`Server is running up on port ${PORT}`)
    else
       console.log("Error Occured ! Server can't start",error)

});