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

const courseApi = (req, res) => {
    res.json({
      courses: [
        {
          id: "course_id_1",
          title: "Introduction to Python",
          category: "programming",
          level: "beginner",
          popularity: "high",
          price: 49.99,
          duration: "6 weeks"
        },
        {
          id: "course_id_2",
          title: "JavaScript Fundamentals",
          category: "programming",
          level: "advance",
          popularity: "high",
          price: 59.99,
          duration: "8 weeks"
        }
        // More course objects...
      ],
      total_courses: 100,
      page: 1,
      limit: 10
    });
  };
  
  module.exports = {createCourse,courseApi};
  