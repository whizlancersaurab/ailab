const router = require('express').Router()
const deviceController = require('../../controller/device/device')

router.post('/add', deviceController.addDevice);
router.get('/all', deviceController.getAllDevices);
router.get('/spe/:id', deviceController.getDeviceById);
router.patch('/update/:id', deviceController.updateDevice);
router.delete('/delete/:id', deviceController.deleteDevice);

router.get('/outofstock' , deviceController.OutOfStockDevices)
router.patch('/addquantity/:id' , deviceController.addQuantityInDevice)

// device type count
router.get('/devicecount' , deviceController.deviceTypeCount)


module.exports = router