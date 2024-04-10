const schemaScriptPg = `
    CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        fullname VARCHAR(400) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        profile_picture VARCHAR(500),
        course_enrolled VARCHAR(200),
        role varchar(20) 
    );
`
module.exports= schemaScriptPg