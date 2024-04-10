//modules 
const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const morgan  = require('morgan');
const bodyParser = require('body-parser');
const fs = require('fs');
require('dotenv').config();
require('../backend/src/config/poolNeonDB');
const authRoutes = require('./src/routes/authRoutes')
const path = require('path');


//server Initializationo
const app = express();
const PORT = process.env.PORT;

// Create a write stream (in append mode)
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });


// Logging middleware
app.use(morgan('combined', { stream: accessLogStream }));
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