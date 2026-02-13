const router = require('express').Router()
const authController = require('../../controller/auth/auth')
const { allow } = require('../../middleware/auth')
const upload = require('../../middleware/upload')

const cpUpload = upload.fields([
  { name: "profileImage", maxCount: 1 },
  { name: "schoolLogo", maxCount: 1 },
]);

const cpUpload2 = upload.fields([
  { name: "profileImage", maxCount: 10 }, 
  { name: "schoolLogo", maxCount: 10 }   
]);



router.post('/login', authController.login)
router.post('/forgot-password', authController.forgotPassword)
router.post('/reset-password', authController.verifyOtpAndUpdatePassword)

router.post('/register', allow('SUPER_ADMIN') ,cpUpload2,authController.register)
router.post('/update',cpUpload,authController.update)


router.get('/logout' ,authController.logout)
router.get('/user' , authController.profile)
router.get('/speUser' , authController.dataForUpdateProfile)
router.get('/allusers' , authController.allUsers)

router.get('/refresh' , authController.refreshToken)
router.get('/usersschools' , authController.getUserSchools)
router.post('/switch-school' ,authController.switchSchool)

module.exports = router;