const { json } = require('body-parser');
const {connect} = require('../config/poolNeonDB');
const fs = require('fs');
const path = require('path');
const {Resend} = require('resend');
const logger = require('../config/logger')

const resend = new Resend(process.env.RESEND_KEY);

// Function to enroll user in a course
async function enrollCourses(req, res) {
    const { courseId } = req.body;
    const userId =  req.userId; 
    const client = await connect();
    logger.info(`Enrolling courses for user ${userId}`);
    let mail;

    try{
        if (!Array.isArray(courseId)){
            logger.warn("Course IDs must be provided as an Array");
            return res.status(400).json({message:"Course IDs must be provided as an Array"});      
        }

        const user = await client.query("SELECT course_enrolled from users WHERE id = $1",[userId]);
        const enrollCourses = user.rows[0]?.course_enrolled ? JSON.parse(user.rows[0].course_enrolled) : [];

        const existingCourses = await client.query("SELECT course_id from courses WHERE course_id = ANY($1::int[])",[courseId])
        const missingCourses = courseId.filter(courseId => !existingCourses.rows.some(row => row.course_id === courseId));

        if (!missingCourses.length === 0){
            logger.warn("Courses not found")
            res.status(404).json({message:"courses not found "})
        }

        const newCoursesToEnroll = courseId.filter( courseId => !enrollCourses.includes(courseId));

        if (newCoursesToEnroll.length === 0){
            logger.warn("All courses are already enrolled")
            return res.status(400).json({message:"All courses are already enrolled"})
        }

        const updatedCourses = [...enrollCourses,...newCoursesToEnroll];

        await client.query("UPDATE users SET course_enrolled = $1 WHERE id = $2",[JSON.stringify(updatedCourses),userId]);

        const userData = await client.query('SELECT email, fullname FROM users WHERE id = $1', [userId]);
        const { email, fullname } = userData.rows[0];
        
        const emailHtmlPath= path.join(__dirname,'email','enrolled_email.html');
        const emailHtml = fs.readFileSync(emailHtmlPath,'utf8');

        logger.info(`Sending enrollment email to ${email}`);

        mail = await resend.emails.send({
            from : 'noreply@bitzdev.tech',
            to : email,
            subject:'Successfully Enrolled Aeonaxy ELearning ',
            html:emailHtml.replace(/\${fullname}/g,fullname)
        });

        logger.info("Enrollment Successful.");

        res.status(200).json({ user: { message: "Enrollment Successful.", mail } });

        


        
    }catch(error){
        logger.error("Error enrolling in courses:", error.message);
        res.status(500).json({message:"Internal server Error"})

    } finally{
        client.release();
    }

}


// Function to get enrolled courses for a user
async function getEnrolledCourses(req, res) {
    const userId = req.userId; 
    const client = await connect();
    logger.info(`Retrieving enrolled courses for user ${userId}`);

    try {
       
        const user = await client.query("SELECT course_enrolled FROM users WHERE id = $1", [userId]);
        const enrolledCourses = user.rows[0]?.course_enrolled ? JSON.parse(user.rows[0].course_enrolled) : [];

        if (enrolledCourses.length === 0) {
            logger.warn("User has not enrolled in any courses");
            return res.status(404).json({ message: "User has not enrolled in any courses" });
        }

      
        const courses = await client.query("SELECT * FROM courses WHERE course_id = ANY($1::int[])", [enrolledCourses]);

        res.status(200).json(courses.rows);
    } catch (error) {
        logger.error("Error retrieving enrolled courses:", error.message);
        res.status(500).json({ message: "Internal server error" });
    } finally {
        client.release();
    }
}



module.exports = {getEnrolledCourses,enrollCourses};