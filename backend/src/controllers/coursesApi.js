const {connect} = require('../config/poolNeonDB');



async function createCourse (req,res){
  const client = await connect();
  try {
    const {title,category,level,popularity,price,duration} = req.body
    console.log(req.body)
    const result = await client.query(
      "INSERT INTO courses (title,category,level,popularity,price,duration) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *",
      [title,category,level,popularity,price,duration]);
      console.log(result);
    res.status(200).json(result.rows[0]);
    
  } catch (error) {
    console.error("Error creating the course", error.message);
    res.status(401).json({message:"Error in listing course"})
  } finally{
    client.release()
  }
}


async function getCoursesAll(req, res) {
  const client = await connect();
  try {
    
    let {page,limit} = req.query;
    page = page ? parseInt(page) : 1;
    limit = limit ? parseInt(limit) : 5;

    // Validate page and limit parameters
    if (isNaN(page) || page <= 0 || isNaN(limit) || limit <= 0) {
      return res.status(400).json({ message: "Invalid page or limit value" });
    }
    const offset = (page - 1) * limit;
    const result = await client.query(
      "SELECT * FROM courses OFFSET $1 LIMIT $2",[offset,limit]
    );
  
  
    const totalCoursesResult = await client.query("SELECT COUNT(*) FROM courses");
    const totalCourses = parseInt(totalCoursesResult.rows[0].count);
    
    res.status(200).json({
      total_courses : totalCourses,
      page : parseInt(page),
      limit : parseInt(limit),
      courses : result.rows
    });
  } catch (error) {
    console.error("Error fetching courses", error.message);
    res.status(500).json({ message: "Error fetching courses" });
  } finally {
    client.release();
  }
}

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
    client.release();
  }
}

async function updateCourse(req, res) {
  const client = await connect();
  try {
    const id = req.params.id; // Extracting ID from route parameters
    const { title, category, level, popularity, price, duration } = req.body;

    const result = await client.query(
      "UPDATE courses SET title=$1, category=$2, level=$3, popularity=$4, price=$5, duration=$6 WHERE course_id=$7 RETURNING *",
      [title, category, level, popularity, price, duration, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error updating the course", error.message);
    res.status(500).json({ message: "Error updating course" });
  } finally {
    client.release();
  }
}

async function deleteCourse(req, res) {
  const client = await connect();
  try {
    const id = req.params.id; // Extracting ID from route parameters

    // Check if the course exists before attempting to delete it
    const course = await client.query(
      "SELECT * FROM courses WHERE course_id = $1",
      [id]
    );

    if (course.rows.length === 0) {
      return res.status(404).json({ message: "Course not found" });
    }

    // If the course exists, delete it from the database
    await client.query(
      "DELETE FROM courses WHERE course_id = $1",
      [id]
    );

    res.status(200).json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error("Error deleting the course", error.message);
    res.status(500).json({ message: "Error deleting course" });
  } finally {
    client.release();
  }
}




  
  module.exports = {createCourse,getCoursesAll,updateCourse,getCourseById,deleteCourse};
  