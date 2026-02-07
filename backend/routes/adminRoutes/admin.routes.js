const router = require('express').Router()
const adminControllers = require('../../controller/adminController/admin')

router.get('/devicescount' , adminControllers.devicesCount)
router.get('/totaldevicetypecount' , adminControllers.TotaldeviceTypeCount)
router.get('/outofstockcount' , adminControllers.getOutOfStockDeviceCount)
module.exports = router