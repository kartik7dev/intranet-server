const express = require('express')
const router = express.Router()
const projectReviewController = require('../controllers/projectReviewController')
const verifyJWT = require('../middleware/verifyJWT')
const {uploadReview} = require('../middleware/fileHelper');

router.use(verifyJWT)

router.route('/')
    // .get(projectReviewController.getAllProjects)
    .post(uploadReview.single('projectReviewDoc'),projectReviewController.createNewProjectReview)
    .patch(uploadReview.single('projectReviewDoc'),projectReviewController.updateProjectReview)
// router.route('/:id').delete(projectController.deleteProject)
router.route('/get/:id').get(projectReviewController.getProjectReviewByid)
// router.route('/count').get(projectController.getProjectCount)
// router.route('/delete').patch(projectController.projectDeactivate)    

module.exports = router