const Category = require('../model/Category')
const Project = require('../model/Project')
const asyncHandler = require('express-async-handler')

// @desc Get the count of all categories
// @route GET /dashboard/count
// @access Private
const getDashboardCount = asyncHandler(async (req, res) => {
    const [categoryCount, projectCount] = await Promise.all([
        Category.countDocuments().exec(),
        Project.countDocuments().exec()
    ]);

    res.json({ categoryCount, projectCount });
});

module.exports = {
    getDashboardCount
}