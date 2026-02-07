const express = require('express')
const categoryController = require('../../controller/categoryController/category')
const router = express.Router()

router.post('/addcat' , categoryController.addCategory)
router.get('/allcat' , categoryController.getCategories)
router.delete('/delcat/:id' , categoryController.deleteCategory)
router.get('/specat/:id' , categoryController.getCategoryById)
router.patch('/edit/:id' , categoryController.updateCategory)
router.get('/catoption' , categoryController.categoryForOption)


module.exports = router