const Project = require('../model/Project')
const ProjectDoc = require('../model/ProjectDoc')
const asyncHandler = require('express-async-handler')
const fs = require('fs');
const path = require('path');

// @desc Get all projects 
// @route GET /projects
// @access Private
const getAllProjects = asyncHandler(async (req, res) => {
    // Get all projects from MongoDB
    const projects = await Project.find({status : 1}).populate([{ path: 'categoryId' },{ path: 'userId' }]).lean()


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

    project.projectDocs.push(projectDoc._id);
    await project.save();    
  
  
      return res.status(201).json({ message: 'Project was added successfully' });
    
  });

// @desc Update a project
// @route PATCH /projects
// @access Private
const updateProject = asyncHandler(async (req, res) => {
    let { _id, projectTitle, categoryId, piName, focalPoint, projectType } = req.body;
    console.log(req.body)
    const id = _id
    // find the existing project
    const project = await Project.findById(id).exec();
    
    if(req.file){
    const file  = req.file;
        // Delete existing document
    const result = await ProjectDoc.findOneAndDelete({ projectId: id })
    const filePath = path.join(__dirname, 'public/uploads', result.projectDoc);
    fs.unlinkSync(filePath);
    project.projectDocs = project.projectDocs.filter(docId => !docId.equals(result._id));

    const projectDoc = await ProjectDoc.create({
          projectId: project._id,
          projectDoc: file.filename
        });
    project.projectDocs.push(projectDoc._id);
    }
     // Update project fields
     project.projectTitle = projectTitle;
     project.categoryId = categoryId;
     project.piName = piName;
     project.focalPoint = focalPoint;
     project.projectType = projectType;
 
    await project.save();    
  
  
      return res.status(201).json({ message: 'Project was updated successfully' });
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

// @desc Get project by id
// @route GET /projects/get
// @access Private
const getProjectByid = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const project = await Project.findById(id).populate('projectDocs');
    
        if (!project) {
          return res.status(404).json({ error: 'Project not found' });
        }
    
        res.status(201).json({message:'Project fetched successfully',data:project});
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
      }
})

// @desc Get project by id
// @route GET /projects/delete
// @access Private
const projectDeactivate = asyncHandler(async (req, res) => {
    try {
        const { id } = req.body;
        const project = await Project.findByIdAndUpdate(id,{status:0},{new:true});
    
        if (!project) {
          return res.status(404).json({ error: 'Project not updated' });
        }
    
        res.status(201).json({message:'Project deleted successfully'});
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
      }
})

module.exports = {
    getAllProjects,
    createNewProject,
    updateProject,
    deleteProject,
    getProjectCount,
    getProjectByid,
    projectDeactivate
}