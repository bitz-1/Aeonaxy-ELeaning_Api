# Aeonaxy E-Learning Platform API

## Developer
Apurv Nandgaonkar  
Email: apurv.mod007@gmail.com

[Link](https://aeonaxy-eleaning-api.onrender.com)
[Link](https://aeonaxy.bitzdev.tech)


## Project Overview
The Aeonaxy project aims to develop the backend API for an E-Learning platform. The API provides functionalities for user authentication, user profile management including profile picture update, end-to-end authentication with JWT, email uniqueness validation, and user enrollment in courses. Additionally, CRUD operations for courses are available, with only admin users having permission to perform these operations. The API integrates with a PostgreSQL database for data storage, Resend for email integration, Bcrypt for password hashing, Cloudinary for image upload, and Winston and Morgan for logging. Filters and pagination are implemented to enhance the search experience for users.

## Tech Stack
- **Node.js**: Backend framework
- **Express.js**: Web framework for Node.js
- **Neon.js**: PostgreSQL database integration
- **Resend**: Email integration for sending notifications
- **Bcrypt**: Password hashing for security
- **Cloudinary**: Image upload service for user profile pictures
- **Winston and Morgan**: Logging and request/response logging

- backend
  - src
    - config
      - cloudinary.js
      - neonDB.js
      - logger.js
    - controllers
      - authUser.js
      - coursesApi.js
      - enrollments.js
    - models
      - schemaCourse.js
      - schemaPg.js
    - routes
      - apiRoutes.js
      - authRoutes.js
    - email
      - welcome_email.html
      - enrolled_email.html
    - server.js
  - package.json
  -.env
  - tmp (temporary directory)

  
---

## API Endpoints
### Authentication
- `POST /register`: Register a new user
- `POST /login`: User login
- `POST /admin`: Assign admin role to a user
- `GET /profile`: Get user profile
- `POST /profile/update`: Update user profile

### Courses
- `GET /api/courses`: Get all courses
- `GET /api/courses/course`: Get course by ID
- `POST /api/courses/create`: Create a new course
- `PUT /api/courses/:id`: Update course by ID
- `DELETE /api/courses/:id`: Delete course by ID

### Enrollments
- `POST /api/enrollments`: Enroll in courses
- `GET /api/enrollments`: Get enrolled courses

---

## Usage
1. Install dependencies: `npm install`
2. Start the server: `npm run dev`

---

This README provides an overview of the Aeonaxy E-Learning Platform API, including the project structure, tech stack, API endpoints, and usage instructions. For more detailed information, please refer to the project files and codebase.
