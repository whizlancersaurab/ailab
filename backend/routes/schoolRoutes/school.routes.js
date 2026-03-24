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


// super amdin extra feature
router.get('/devicescountforschooldas/:schoolId', superAdmin, schoolController.devicesCountForSchoolDas)
router.get('/totaldevicetypecountforschooldas/:schoolId', superAdmin, schoolController.TotaldeviceTypeCountForSchoolDas)
router.get('/outofstockcountforschooldas/:schoolId', superAdmin, schoolController.getOutOfStockDeviceCountForSchoolDas)
router.get('/aidevicescountforschooldas/:schoolId', superAdmin, schoolController.aiDevicesCountForSchoolDas)
router.get('/aitotaldevicetypecountforschooldas/:schoolId', superAdmin, schoolController.aiTotaldeviceTypeCountForSchoolDas)
router.get('/aioutofstockcountforschooldas/:schoolId', superAdmin, schoolController.aiGetOutOfStockDeviceCountForSchoolDas)

// robotics
router.get('/all/:schoolId', schoolController.getAllRoboticsDevicesForSchoolDas);
router.get('/outofstock/:schoolId', schoolController.OutOfStockDevicesForSchoolDas)
router.get('/devicecount/:schoolId', schoolController.deviceTypeCountForSchoolDas)


// ai
router.get('/allai/:schoolId', schoolController.AiGetAllDevicesForSchoolDas);
router.get('/aioutofstock/:schoolId', schoolController.AiOutOfStockDevicesForSchoolDas)
router.get('/aidevicecount/:schoolId', schoolController.AideviceTypeCountForSchoolDas)


module.exports = router;
