const express = require('express')
const router = express.Router()
const categoryController = require('../controllers/categoryController')
const verifyJWT = require('../middleware/verifyJWT')

router.use(verifyJWT)

router.route('/')
    .get(categoryController.getAllCategories)
    .post(categoryController.createNewCategory)
    .patch(categoryController.updateCategory)
router.route('/:id').delete(categoryController.deleteCategory)    

module.exports = router