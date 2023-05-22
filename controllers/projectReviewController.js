const ProjectReview = require('../model/ProjectReview')
const asyncHandler = require('express-async-handler')
const fs = require('fs');
const path = require('path');

// @desc Get all project reviews by project id 
// @route GET /projects
// @access Private
const getAllProjectReviewById = asyncHandler(async (req, res) => {
    // Get all projects from MongoDB
    const projects = await ProjectReview.find({status : 1}).populate([{ path: 'categoryId' },{ path: 'userId' }]).lean()


    // If no projects 
    if (!projects?.length) {
        return res.status(400).json({ message: 'No projects found' })
    }


    res.json(projects)
})

// @desc Create new project review
// @route POST /projects
// @access Private
const createNewProjectReview = asyncHandler(async (req, res) => {
    let { projectId, userId, remarks, description, reviewParameter1,reviewParameter2,reviewParameter3,reviewParameter4,reviewParameter5, reviewTotal,reviewedBy, reviewDate } = req.body;
  
    // Create and store the new projectReview
    
    const file  = req.file;
    // Create a new ProjectReviewDoc instance
    const projectReviewDoc = file.filename
        
    const project = await ProjectReview.create({ projectId, userId, remarks, description, projectReviewDoc, reviewParameter1,reviewParameter2,reviewParameter3,reviewParameter4,reviewParameter5, reviewTotal, reviewedBy, reviewDate });  
  
    if(project)
      return res.status(201).json({ message: 'ProjectReview was added successfully' });
    else
    return res.status(409).json({ message: 'Unable to add project review' })
  });

// @desc Update a project
// @route PATCH /projects
// @access Private
const updateProjectReview = asyncHandler(async (req, res) => {
    let { _id, projectId, userId, remarks, description, reviewParameter1,reviewParameter2,reviewParameter3,reviewParameter4,reviewParameter5, reviewTotal, reviewedBy, reviewDate } = req.body;
    console.log(req.body)
    const id = _id
    // find the existing project
    const project = await ProjectReview.findById(id).exec();
    
    if(req.file){
    const file  = req.file;
        // Delete existing document
    const filePath = path.join(__dirname, '../public/reviewdocs', project.projectReviewDoc);
    console.log(filePath)
    fs.unlinkSync(filePath);
    project.projectReviewDoc = file.filename;
    }
     // Update project fields
     project.remarks = remarks;
     project.description = description;
     project.reviewParameter1 = reviewParameter1;
     project.reviewParameter2 = reviewParameter2;
     project.reviewParameter3 = reviewParameter3;
     project.reviewParameter4 = reviewParameter4;
     project.reviewParameter5 = reviewParameter5;
     project.reviewTotal = reviewTotal;
     project.reviewedBy = reviewedBy;
     project.reviewDate = reviewDate;
 
    await project.save();    
  
  
      return res.status(201).json({ message: 'Project Review was updated successfully' });
})

// @desc Delete a project
// @route DELETE /projects
// @access Private
const deleteProjectReview = asyncHandler(async (req, res) => {
    const { id } = req.params
    // Confirm data
    if (!id) {
        return res.status(400).json({ message: 'ProjectReview ID required' })
    }

    // Confirm project exists to delete 
    const project = await ProjectReview.findById(id).exec()

    if (!project) {
        return res.status(400).json({ message: 'ProjectReview not found' })
    }

    const result = await project.deleteOne()

    res.status(201).json({message:'ProjectReview deleted successfully'})
})

// @desc Get the count of all projects
// @route GET /projects/count
// @access Private
const getProjectReviewCount = asyncHandler(async (req, res) => {
    const count = await ProjectReview.countDocuments().exec()

    res.json({ count })
})

// @desc Get project by id
// @route GET /projects/get
// @access Private
const getProjectReviewByid = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const project = await ProjectReview.findById(id).exec();
    
        if (!project) {
          return res.status(404).json({ error: 'ProjectReview not found' });
        }
    
        res.status(201).json({message:'ProjectReview fetched successfully',data:project});
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
      }
})



module.exports = {
    getAllProjectReviewById,
    createNewProjectReview,
    updateProjectReview,
    deleteProjectReview,
    getProjectReviewCount,
    getProjectReviewByid
}