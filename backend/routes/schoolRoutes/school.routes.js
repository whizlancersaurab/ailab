const router = require('express').Router();
const schoolController = require('../../controller/schoolController/school');
const { allow } = require('../../middleware/auth');
const upload = require('../../middleware/upload');


const cpUpload = upload.fields([
  { name: "profileImage", maxCount: 1 },
  { name: "schoolLogo", maxCount: 1 },
  { name: "teacherProfileImage", maxCount: 1 },
]);


const superAdmin = allow('SUPER_ADMIN');

// Routes
router.get('/allschools', superAdmin, schoolController.allSchools);
router.get('/allactiveschools', superAdmin, schoolController.allActiveSchools);
router.get('/allsuspendedschools', superAdmin, schoolController.allSuspendedSchools);
router.get('/speschool/:id', superAdmin, schoolController.speSchool);
router.patch('/updschool/:id', superAdmin, schoolController.changeStatus);
router.delete('/delschool/:id', superAdmin, schoolController.deleteSchool);
router.get('/schoolstats', superAdmin, schoolController.schoolStats);
router.post('/addnew', superAdmin, cpUpload, schoolController.addNewSchool);

module.exports = router;
