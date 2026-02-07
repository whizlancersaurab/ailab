const router = require('express').Router()
const adminControllers = require('../../../controller/aicontrollers/ai-admin/aiadmin')

router.get('/devicescount' , adminControllers.devicesCount)
router.get('/totaldevicetypecount' , adminControllers.TotaldeviceTypeCount)
router.get('/outofstockcount' , adminControllers.getOutOfStockDeviceCount)
module.exports = router