const Project = require('../model/Project')
const ProjectDoc = require('../model/ProjectDoc')
const asyncHandler = require('express-async-handler')

// @desc Get all projects 
// @route GET /projects
// @access Private
const getAllProjects = asyncHandler(async (req, res) => {
    // Get all projects from MongoDB
    const projects = await Project.find().populate('categoryId').lean()

    // If no projects 
    if (!projects?.length) {
        return res.status(400).json({ message: 'No projects found' })
    }


    res.json(projects)
})

// @desc Create new project
// @route POST /projects
// @access Private
const createNewProject = asyncHandler(async (req, res) => {
    let { projectTitle, userId, categoryId, piName, focalPoint, projectType } = req.body;
  
    // Create and store the new project
    const project = await Project.create({ projectTitle, userId, categoryId, piName, focalPoint, projectType });
    
    const file  = req.file;
        // Create a new ProjectDoc instance
    const projectDoc = await ProjectDoc.create({
          projectId: project._id,
          projectDoc: file.filename
        });
  
  
      return res.status(201).json({ message: 'Project was added successfully' });
    
  });

// @desc Update a project
// @route PATCH /projects
// @access Private
const updateProject = asyncHandler(async (req, res) => {
    const { id,projectName,parentId } = req.body.values

    // Confirm data
    if (!projectName) {
        return res.status(400).json({ message: 'project name is required' })
    }

    // Confirm project exists to update
    const project = await Project.findById(id).exec()

    if (!project) {
        return res.status(400).json({ message: 'Project not found' })
    }

    // Check for duplicate title
    const duplicate = await Project.findOne({ projectName }).lean().exec()

    // Allow renaming of the original project 
    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ message: 'Duplicate project title' })
    }    

    project.projectName = projectName
    project.parentId = parentId

    let updatedProject = await project.save()
    updatedProject = await Project.findById(project._id).populate('parentId').lean().exec();
    res.status(201).json({ message:'Project updated successfully',data:updatedProject})
})

// @desc Delete a project
// @route DELETE /projects
// @access Private
const deleteProject = asyncHandler(async (req, res) => {
    const { id } = req.params
    // Confirm data
    if (!id) {
        return res.status(400).json({ message: 'Project ID required' })
    }

    // Confirm project exists to delete 
    const project = await Project.findById(id).exec()

    if (!project) {
        return res.status(400).json({ message: 'Project not found' })
    }

    const result = await project.deleteOne()

    res.status(201).json({message:'Project deleted successfully'})
})

// @desc Get the count of all projects
// @route GET /projects/count
// @access Private
const getProjectCount = asyncHandler(async (req, res) => {
    const count = await Project.countDocuments().exec()

    res.json({ count })
})

module.exports = {
    getAllProjects,
    createNewProject,
    updateProject,
    deleteProject,
    getProjectCount
}