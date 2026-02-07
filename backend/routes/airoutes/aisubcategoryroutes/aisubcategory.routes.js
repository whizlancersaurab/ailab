const express = require('express')
const categoryController = require('../../../controller/aicontrollers/ai-sub-category/aisubcategory')
const router = express.Router()


router.post('/addsubcat' , categoryController.addSubCategory)
router.delete('/delsubcat/:id' , categoryController.deleteSubCategory)
router.get('/allsubcat' , categoryController.allSubCategories)
router.get('/spesubcat/:id' , categoryController.getSpeSubCategory)
router.patch('/editsubcat/:id' , categoryController.updateSubCategory)
router.get('/subcatbycat/:id' , categoryController.getSubCategoriesByCategory)


module.exports = router