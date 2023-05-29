const express = require('express')
const router = express.Router()
const projectController = require('../controllers/projectController')
const verifyJWT = require('../middleware/verifyJWT')
const fileUpload = require("express-fileupload");
const filesPayloadExists = require('../middleware/filesPayloadExists');
const fileExtLimiter = require('../middleware/fileExtLimiter');
const fileSizeLimiter = require('../middleware/fileSizeLimiter');
const {upload} = require('../middleware/fileHelper');

router.route('/category/:categoryId').get(projectController.getProjectsByCategoryId)
router.use(verifyJWT)

router.route('/')
    .get(projectController.getAllProjects)
    .post(upload.single('projectDoc'),projectController.createNewProject)
    .patch(upload.single('projectDoc'),projectController.updateProject)
router.route('/:id').delete(projectController.deleteProject)
router.route('/get/:id').get(projectController.getProjectByid)

router.route('/delete').patch(projectController.projectDeactivate)    

module.exports = router