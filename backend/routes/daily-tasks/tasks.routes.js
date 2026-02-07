const router = require('express').Router()
const tasksController  = require('../../controller/daily-task/taskController')

router.post('/add' ,tasksController.addDailyTask)
router.get('/all' , tasksController.getAllDailyTasks)
router.delete('/delete/:id' , tasksController.deleteDailyTask)
router.get('/spetask/:id' , tasksController.getDailyTaskById)
router.patch('/edit/:id' , tasksController.updateDailyTask)
router.get('/progress/:class_id',tasksController.getClassProgressData)
router.get('/allclassesprodata' , tasksController.getAllClassesProgress)


module.exports = router