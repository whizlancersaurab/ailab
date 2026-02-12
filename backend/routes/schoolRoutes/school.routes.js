const router = require('express').Router()
const schoolController = require('../../controller/schoolController/school')
const {allow} = require('../../middleware/auth')

router.get('/allschools' , allow('SUPER_ADMIN'),schoolController.allSchools)
router.get('/allactiveschools' , allow('SUPER_ADMIN'),schoolController.allActiveSchools)
router.get('/allsuspendedschools' , allow('SUPER_ADMIN'),schoolController.allSuspendedSchools)
router.get('/speschool/:id' , allow('SUPER_ADMIN'),schoolController.speSchool)
router.patch('/updschool/:id' , allow('SUPER_ADMIN'),schoolController.changeStatus)
router.delete('/delschool/:id' , allow('SUPER_ADMIN'),schoolController.deleteSchool)
router.get('/schoolstats' , allow("SUPER_ADMIN") , schoolController.schoolStats)


module.exports = router