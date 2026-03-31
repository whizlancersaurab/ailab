const express = require('express')
const stduentController = require('../../controller/studentController/student')
const upload = require('../../middleware/upload')
const router = express.Router()


router.get('/speschoolstudent' , stduentController.speSchoolStudent)
router.delete('/delstudent/:id' , stduentController.deleteStudnet)
router.post('/addstudent' , upload.single('studentProfileImage') , stduentController.addNewStudent)
router.patch('/updatestudent/:id' , upload.single('studentProfileImage') , stduentController.updateStudent)


module.exports = router