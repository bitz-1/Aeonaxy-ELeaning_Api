const schemaCourse= `
    CREATE TABLE courses (
        course_id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        level VARCHAR(50),
        popularity VARCHAR(50),
        price VARCHAR(50),
        duration VARCHAR(50)
    );
` 
module.exports = schemaCourse;