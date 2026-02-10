const router = require('express').Router()
const syllabusController = require('../../../controller/classes/syllabus-curriculam/syllabus')


router.post('/addsyllabus' , syllabusController.addSyllabusMonths)
router.get('/allsyllabus' , syllabusController.getAllClassSyllabus)
router.delete('/delsyllabus/:id' , syllabusController.deleteSyllabusMonth)
router.get('/spesyllabus/:id' , syllabusController.getSyllabusById)
router.patch('/editsyllabus/:id' , syllabusController.updateSyllabusMonth)
router.get('/monthopt/:class_id' , syllabusController.getMonthForOptionByClassId)
router.get('/getsyllabus/:class_id/:id' , syllabusController.getSyllabusByClassIdAndId)


module.exports = router