const Category = require('../model/Category')
const asyncHandler = require('express-async-handler')

// @desc Get all categories 
// @route GET /categories
// @access Private
const getAllCategories = asyncHandler(async (req, res) => {
    // Get all categories from MongoDB
    const categories = await Category.find().lean()

    // If no categories 
    if (!categories?.length) {
        return res.status(400).json({ message: 'No categories found' })
    }


    res.json(categories)
})

// @desc Create new category
// @route POST /categories
// @access Private
const createNewCategory = asyncHandler(async (req, res) => {
    let { categoryName } = req.body.values
    // Confirm category
    if (!categoryName) {
        return res.status(400).json({ message: 'category name is required' })
    }

    categoryName = categoryName.toLowerCase()

    // Check for duplicate category name
    const duplicate = await Category.findOne({ categoryName }).lean().exec()

    if (duplicate) {
        return res.status(409).json({ message: 'Category name must be unique' })
    }

    // Create and store the new user 
    const category = await Category.create({ categoryName })

    if (category) { // Created 
        return res.status(201).json({ message: 'New category created successfully',data:category})
    } else {
        return res.status(400).json({ message: 'Invalid category data received' })
    }
})

// @desc Update a category
// @route PATCH /categories
// @access Private
const updateCategory = asyncHandler(async (req, res) => {
    const { id,categoryName } = req.body.values

    // Confirm data
    if (!categoryName) {
        return res.status(400).json({ message: 'category name is required' })
    }

    // Confirm category exists to update
    const category = await Category.findById(id).exec()

    if (!category) {
        return res.status(400).json({ message: 'Category not found' })
    }

    // Check for duplicate title
    const duplicate = await Category.findOne({ categoryName }).lean().exec()

    // Allow renaming of the original category 
    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ message: 'Duplicate category title' })
    }

    category.categoryName = categoryName

    const updatedCategory = await category.save()

    res.status(201).json({ message:'Category updated successfully',data:updatedCategory})
})

// @desc Delete a category
// @route DELETE /categories
// @access Private
const deleteCategory = asyncHandler(async (req, res) => {
    console.log(req)
    const { id } = req.body

    // Confirm data
    if (!id) {
        return res.status(400).json({ message: 'Category ID required' })
    }

    // Confirm category exists to delete 
    const category = await Category.findById(id).exec()

    if (!category) {
        return res.status(400).json({ message: 'Category not found' })
    }

    const result = await category.deleteOne()

    res.status(201).json({message:'Category deleted successfully'})
})

module.exports = {
    getAllCategories,
    createNewCategory,
    updateCategory,
    deleteCategory
}