const express = require('express');
const {courseApi,createCourse} = require('../controllers/coursesApi');
const router = express.Router();
router.get('/courses',courseApi);

router.post('/courses',createCourse);

router.put('/courses/:id', (req, res) => {
    // Logic to update an existing course
});

router.delete('/courses/:id',  (req, res) => {
    // Logic to delete an existing course
});

module.exports = router;