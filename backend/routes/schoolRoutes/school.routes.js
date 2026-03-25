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
router.get('/all/:schoolId',superAdmin ,schoolController.getAllRoboticsDevicesForSchoolDas);
router.get('/outofstock/:schoolId',superAdmin ,schoolController.OutOfStockDevicesForSchoolDas)
router.get('/devicecount/:schoolId',superAdmin ,schoolController.deviceTypeCountForSchoolDas)


// ai
router.get('/allai/:schoolId',superAdmin ,schoolController.AiGetAllDevicesForSchoolDas);
router.get('/aioutofstock/:schoolId', superAdmin,schoolController.AiOutOfStockDevicesForSchoolDas)
router.get('/aidevicecount/:schoolId',superAdmin ,schoolController.AideviceTypeCountForSchoolDas)

// syllabus
router.get('/allsyllabusforschooldas/:schoolId' ,superAdmin, schoolController.getAllClassSyllabusForSchoolDas)
router.get('/spesyllabusforschooldas/:id/:schoolId' , superAdmin, schoolController.getSyllabusByIdForSchoolDas)

// events
router.get('/eventsforschooldas/:schoolId' , superAdmin,schoolController.getEventsForSchoolDas)

// daily task
router.get('/dailytasksforschooldas/:schoolId' , superAdmin,schoolController.getAllDailyTasksForSchoolDas)
router.get('/progressdataforschooldas/:class_id/:schoolId', superAdmin, schoolController.getClassProgressDataForSchoolDas)

// robo cateogry and subcategory
router.get('/allrobocatforschooldas/:schoolId' , superAdmin,schoolController.getRoboCategoriesForSchoolDas)
router.get('/allrobosubcatforschooldas/:schoolId' , superAdmin,schoolController.allRoboSubCategoriesForSchoolDas)

// ai category and subcategory
router.get('/allaicatforschooldas/:schoolId' , superAdmin,schoolController.getAiCategoriesForSchoolDas)
router.get('/allaisubcatforschooldas/:schoolId' , superAdmin,schoolController.allAiSubCategoriesForSchoolDas)


module.exports = router;
