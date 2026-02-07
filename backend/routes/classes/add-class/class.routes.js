const router = require('express').Router()
const classController = require('../../../controller/classes/add-class/class')




router.post('/addclass', classController.addClass)
router.get('/allclasses', classController.getClasses)
router.delete('/delclass/:id', classController.deleteClass)
router.get('/speclass/:id', classController.getClassById)
router.patch('/editclass/:id', classController.updateClass)
router.get('/option' , classController.getAllClassForOption)


module.exports = router