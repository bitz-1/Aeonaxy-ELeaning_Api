const express = require('express');
const {createCourse, getCoursesAll, updateCourse, getCourseById, deleteCourse} = require('../controllers/coursesApi');
const router = express.Router();



router.get('/courses',getCoursesAll);

router.get('/courses/course',getCourseById);

router.post('/courses',createCourse);

router.put('/courses/:id',updateCourse);

router.delete('/courses/:id',deleteCourse );

module.exports = router;

