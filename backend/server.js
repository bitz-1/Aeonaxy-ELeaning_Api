//modules 
const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const morgan  = require('morgan');
// const path = require ('path');  
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

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(cors());
app.use(fileUpload({
    tempFileDir: "tmp",
    useTempFiles: true,
    preserveExtension: 12,
    safeFileNames: true,
}));
app.use(bodyParser.urlencoded({ extended: true }));


//middleware
app.use('/',authRoutes);

app.get('/', (req, res)=>{
    res.send("Aeonaxy-Api");

}); 



app.listen(PORT,(error)=>{
    if (!error)
       console.log(`Server is running up on port ${PORT}`)
    else
       console.log("Error Occured ! Server can't start",error)

});