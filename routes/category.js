const express = require('express')
const router = express.Router()
const categoryController = require('../controllers/categoryController')
const verifyJWT = require('../middleware/verifyJWT')

router.route('/category-tree').get(categoryController.categoryTree);

// Write routes after this if you want JWT authentication
router.use(verifyJWT)

router.route('/')
    .get(categoryController.getAllCategories)
    .post(categoryController.createNewCategory)
    .patch(categoryController.updateCategory)
router.route('/:id').delete(categoryController.deleteCategory)  

module.exports = router