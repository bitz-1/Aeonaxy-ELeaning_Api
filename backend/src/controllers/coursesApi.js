const {connect} = require('../config/poolNeonDB');
const bcrypt = require('bcrypt');
const logger = require('../config/logger')


// create Course
async function createCourse(req, res) {
  const { title, category, level, popularity, price, duration, username, password } = req.body;
  logger.info("Creating new course.");

  const client = await connect();

  try {
      // Authenticate user and check if they are an admin
      const userResult = await client.query("SELECT * FROM users WHERE username = $1", [username]);
      const user = userResult.rows[0];
      
      if (!user) {
        logger.warn("User not found.");
        return res.status(401).json({ message: "User not found" });
      }

      // Verify the password
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        logger.warn("Invalid password.");
        return res.status(401).json({ message: "Invalid password" });
      }

      // Check if the user is an admin
      if (user.role !== 'admin') {
        logger.warn("User does not have permission to create a course.");
        return res.status(403).json({ message: "You do not have permission to create a course" });
      }

      // User is authenticated and has admin role, proceed to create course
      const result = await client.query(
          "INSERT INTO courses (title, category, level, popularity, price, duration) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
          [title, category, level, popularity, price, duration]
      );
      logger.info("Course created successfully.");
      res.status(200).json(result.rows[0]);
  } catch (error) {
      logger.error("Error creating the course:", error.message);
      res.status(500).json({ message: "Internal server error" });
  } finally {
      client.release();
  }
}



// get all course 

async function getCoursesAll(req, res) {
  const client = await connect();
  try {
    let { page, limit, category, level, popularity } = req.query;
    page = page ? parseInt(page) : 1;
    limit = limit ? parseInt(limit) : 5;


    if (isNaN(page) || page <= 0 || isNaN(limit) || limit <= 0) {
      logger.warn("Invalid page or limit value.");
      return res.status(400).json({ message: "Invalid page or limit value" });
    }

    const offset = (page - 1) * limit;
    let query = "SELECT * FROM courses WHERE 1=1";
    let queryParams = [];

    // Add filters to the query based on provided parameters
    if (category) {
      query += " AND category = $" + (queryParams.length + 1);
      queryParams.push(category);
    }
    if (level) {
      query += " AND level = $" + (queryParams.length + 1);
      queryParams.push(level);
    }
    if (popularity) {
      query += " AND popularity = $" + (queryParams.length + 1);
      queryParams.push(popularity);
    }

    query += " OFFSET $" + (queryParams.length + 1) + " LIMIT $" + (queryParams.length + 2);
    queryParams.push(offset, limit);

    const result = await client.query(query, queryParams);

    const totalCoursesResult = await client.query("SELECT COUNT(*) FROM courses");
    const totalCourses = parseInt(totalCoursesResult.rows[0].count);

    res.status(200).json({
      total_courses: totalCourses,
      page: parseInt(page),
      limit: parseInt(limit),
      courses: result.rows,
    });
    logger.info("Courses fetched successfully.");
  } catch (error) {
    logger.error("Error fetching courses:", error.message);
    res.status(500).json({ message: "Error fetching courses" });
  } finally {
    client.release();
  }
}


//find course by id

async function getCourseById(req, res) {
  const client = await connect();
  try {
    const courseId = req.query.id; // Extract course_id from route parameters
    console.log(courseId)
    const course = await client.query(
      "SELECT * FROM courses WHERE course_id = $1",
      [courseId]
    );

    if (course.rows.length === 0) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.status(200).json(course.rows[0]);
  } catch (error) {
    console.error("Error fetching course by ID", error.message);
    res.status(500).json({ message: "Error fetching course" });
  } finally {
    if (client){
    client.release();
  }
  }
}

//update Course 

async function updateCourse(req, res) {
  const { id } = req.params; // Extracting ID from route parameters
  const { title, category, level, popularity, price, duration, username, password } = req.body;
  logger.info("Updating course.");
  const client = await connect();

  try {
      // Authenticate user and check if they are an admin
      const userResult = await client.query("SELECT * FROM users WHERE username = $1", [username]);
      const user = userResult.rows[0];
      if (!user) {
        logger.warn("User not found.");
        return res.status(401).json({ message: "User not found" });
      }

      // Verify the password
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        logger.warn("Invalid password.");
        return res.status(401).json({ message: "Invalid password" });
      }

      // Check if the user is an admin
      if (user.role !== 'admin') {
        logger.warn("User does not have permission to update courses.");
        return res.status(403).json({ message: "You do not have permission to update courses" });
      }

      // User is authenticated and has admin role, proceed to update the course
      const result = await client.query(
          "UPDATE courses SET title=$1, category=$2, level=$3, popularity=$4, price=$5, duration=$6 WHERE course_id=$7 RETURNING *",
          [title, category, level, popularity, price, duration, id]
      );

      if (result.rowCount === 0) {
        logger.warn("Course not found.");
        return res.status(404).json({ message: "Course not found" });
      }
      logger.info("Course updated successfully.");
      res.status(200).json(result.rows[0]);
  } catch (error) {
      logger.error("Error updating the course:", error.message);
      res.status(500).json({ message: "Internal server error" });
  } finally {
      client.release();
  }
}

//deletecourse

async function deleteCourse(req, res) {
  const {id} = req.params; 
  const {username,password} = req.query;
  const client = await connect();
  logger.info("Deleting course.");
  try {
    
      const userResult = await client.query("SELECT * FROM users WHERE username = $1", [username]);
      const user = userResult.rows[0];
      if (!user) {
        logger.warn("User not found.");
        return res.status(401).json({ message: "User not found" });
      }

   
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        logger.warn("Invalid password.")
        return res.status(401).json({ message: "Invalid password" });
      }

     
      if (user.role !== 'admin') {
        logger.warn("User does not have permission to delete courses.");
        return res.status(403).json({ message: "You do not have permission to delete courses" });
      }

   
      const course = await client.query("SELECT * FROM courses WHERE course_id = $1", [id]);
      if (course.rows.length === 0) {
        logger.warn("Course not found.");
         return res.status(404).json({ message: "Course not found" });
      }

    
      await client.query("DELETE FROM courses WHERE course_id = $1", [id]);
      logger.info("Course deleted successfully.");

      res.status(200).json({ message: "Course deleted successfully" });
  } catch (error) {
      logger.error("Error deleting the course:", error.message)
      res.status(500).json({ message: "Internal server error" });
  } finally {
      client.release();
  }
}





  
  module.exports = {createCourse,getCoursesAll,updateCourse,getCourseById,deleteCourse};
  