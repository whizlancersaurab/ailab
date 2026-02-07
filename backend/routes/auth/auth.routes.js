const router = require('express').Router()
const authController = require('../../controller/auth/auth')
const { allow } = require('../../middleware/auth')
const upload = require('../../middleware/upload')

const cpUpload = upload.fields([
  { name: "profileImage", maxCount: 1 },
  { name: "schoolLogo", maxCount: 1 },
]);


router.post('/login', authController.login)
router.post('/forgot-password', authController.forgotPassword)
router.post('/reset-password', authController.verifyOtpAndUpdatePassword)

router.post('/register', allow('SUPER_ADMIN') ,cpUpload,authController.register)
router.post('/update',cpUpload,authController.update)

router.get('/logout' ,authController.logout)
router.get('/user' , authController.profile)
router.get('/refresh' , authController.refreshToken)


module.exports = router;