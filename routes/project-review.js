const express = require('express')
const router = express.Router()
const projectController = require('../controllers/projectReviewController')
const verifyJWT = require('../middleware/verifyJWT')
const {upload} = require('../middleware/fileHelper');

router.use(verifyJWT)

router.route('/')
    // .get(projectReviewController.getAllProjects)
    .post(upload.single('projectReviewDoc'),projectController.createNewProjectReview)
//     .patch(upload.single('projectDoc'),projectController.updateProject)
// router.route('/:id').delete(projectController.deleteProject)
// router.route('/get/:id').get(projectController.getProjectByid)
// router.route('/count').get(projectController.getProjectCount)
// router.route('/delete').patch(projectController.projectDeactivate)    

module.exports = router