const router = require('express').Router()
const syllabusController = require('../../../controller/classes/syllabus-curriculam/syllabus')
const syllabusUpload = require('../../../middleware/syllabusUpload')



router.post('/addsyllabus' , syllabusController.addSyllabusMonths)
router.get('/allsyllabus' , syllabusController.getAllClassSyllabus)
router.delete('/delsyllabus/:id' , syllabusController.deleteSyllabusMonth)
router.get('/spesyllabus/:id' , syllabusController.getSyllabusById)
router.patch('/editsyllabus/:id' , syllabusController.updateSyllabusMonth)
router.get('/monthopt/:class_id' , syllabusController.getMonthForOptionByClassId)
router.get('/getsyllabus/:class_id/:id' , syllabusController.getSyllabusByClassIdAndId)
// router.post("/upload-syllabus/:schoolId", upload.single("pdf") , syllabusController.addClassSyllabusViaPdf)
router.post('/uploadsyllabus/:schoolId' , syllabusUpload.single("file"), syllabusController.addClassSyllabusViaExcel)


module.exports = router