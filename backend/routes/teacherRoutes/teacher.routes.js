const express = require('express')
const teacherController = require('../../controller/teacherController/teacher')
const upload = require('../../middleware/upload')
const router = express.Router()


router.get('/speschoolteachers' , teacherController.speSchoolTeachers)
router.delete('/delteacher/:id' , teacherController.deleteTeacher)
router.post('/addteacher' , upload.single('teacherProfileImage') , teacherController.addNewTeacher)


module.exports = router