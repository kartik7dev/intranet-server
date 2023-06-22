const Project = require('../model/Project')
const ProjectDoc = require('../model/ProjectDoc')
const ProjectReview = require('../model/ProjectReview')
const asyncHandler = require('express-async-handler')
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');
const mongoose = require("mongoose");


// @desc Get all projects 
// @route GET /projects
// @access Private
const getAllProjects = asyncHandler(async (req, res) => {
  const { page = 1, perPage = 20, query = null } = req.query;

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(perPage, 10),
    sort: { createdAt: -1 },
  };

  const queryFilter = { status: 1 };

  if (query) {
    queryFilter.$or = [
      { 'category.categoryName': { $regex: query, $options: 'i' } },
      { 'user.firstName': { $regex: query, $options: 'i' } },
      { 'user.lastName': { $regex: query, $options: 'i' } },
      { projectTitle: { $regex: query, $options: 'i' } },
      { piName: { $regex: query, $options: 'i' } },
      { focalPoint: { $regex: query, $options: 'i' } },
    ];
  }

  const countPromise = Project.countDocuments(queryFilter);
  // const projectsPromise = Project.find(queryFilter)
  //   .populate([{ path: 'categoryId' }, { path: 'userId' }, { path: 'projectDocs' }])
  //   .skip((options.page - 1) * options.limit)
  //   .limit(options.limit)
  //   .lean();

    const projectsPromise = Project.aggregate([
      {
        $lookup: {
          from: 'categories',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'category',
        },
      },
     
      { $unwind: '$category' },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $lookup: {
          from: 'projectdocs',
          localField: '_id',
          foreignField: 'projectId',
          as: 'projectDocs',
        },
      },
      { $match: queryFilter },
      { $skip: (options.page - 1) * options.limit },
      { $limit: options.limit },
      { $project: { category: 1, user: 1, projectDocs: 1, projectTitle : 1, piName : 1,focalPoint : 1, projectType : 1,_id : 1 } },
    ]);
    

  const [projects, totalCount] = await Promise.all([projectsPromise, countPromise]);

  // Fetch project reviews for each project
  const projectIds = projects.map((project) => project._id);
  const projectReviews = await ProjectReview.find({ projectId: { $in: projectIds } }).lean();

  // Group project reviews by projectId
  const projectReviewsByProjectId = projectReviews.reduce((acc, review) => {
    if (!acc[review.projectId]) {
      acc[review.projectId] = [];
    }
    acc[review.projectId].push(review);
    return acc;
  }, {});

  // Assign project reviews to their respective projects
  projects.forEach((project) => {
    const projectId = project._id;
    project.projectReviews = projectReviewsByProjectId[projectId] || [];
  });

  if (!projects.length) {
    return res.status(400).json({ message: 'No projects found' });
  }

  res.json({ projects, totalCount });
});



// @desc Create new project
// @route POST /projects
// @access Private
const createNewProject = asyncHandler(async (req, res) => {
    let { projectTitle, userId, categoryId, piName, focalPoint, projectType } = req.body;
  
    // Create and store the new project
    const project = await Project.create({ projectTitle, userId, categoryId, piName, focalPoint, projectType });
    
    if(req.file){
      const file  = req.file;
          // Create a new ProjectDoc instance
      const projectDoc = await ProjectDoc.create({
            projectId: project._id,
            projectDoc: file.filename
          });

      project.projectDocs.push(projectDoc._id);
      await project.save();    
    }
  
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
    const filePath = path.join(__dirname, '../public/uploads', result.projectDoc);
    console.log(filePath)
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



// @desc deactive project
// @route PATCH /projects/delete
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

// @desc Get projects by category ID
// @route GET /projects/category/:categoryId
// @access Private
const getProjectsByCategoryId = asyncHandler(async (req, res) => {
  try {
    const { categoryId } = req.params;

    // Get projects by category ID from MongoDB
    // const projects = await Project.find({ categoryId: categoryId, status: 1 }).populate([
    //   { path: 'categoryId' },
    //   { path: 'projectDocs' }
    // ]).lean();
    const projectsPromise = Project.aggregate([
      {
        $lookup: {
          from: 'categories',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'category',
        },
      },
     
      { $unwind: '$category' },
      {
        $lookup: {
          from: 'projectdocs',
          localField: '_id',
          foreignField: 'projectId',
          as: 'projectDocs',
        },
      },
      { $match: { $or: [{'category.parentId':new mongoose.Types.ObjectId(categoryId)},{categoryId: new mongoose.Types.ObjectId(categoryId)}]} },
      { $project: { category: 1, user: 1, projectDocs: 1, projectTitle : 1, piName : 1,focalPoint : 1, projectType : 1,_id : 1 } },
    ]);
    
    const [projects] = await Promise.all([projectsPromise])
    // If no projects
    if (!projects.length) {
      return res.status(400).json({ message: 'No projects found for the specified category' });
    }

    res.status(201).json({data:projects});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// @desc Export projects to excel
// @route POST /projects/export/
// @access Private
const exportProjectsToExcel = async (req, res) => {
  try {
    // Fetch all projects
    const projects = await Project.find({ status: 1 })
      .populate([{ path: 'categoryId' }, { path: 'userId' }])
      .lean();

    if (!projects.length) {
      return res.status(400).json({ message: 'No projects found' });
    }

    // Create a new workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Projects');

    // Define column headers
    worksheet.columns = [
      { header: 'Project Title', key: 'projectTitle' },
      { header: 'Category', key: 'category' },
      { header: 'PI Name', key: 'piName' },
      { header: 'ISRO CO-PI / Focal Point', key: 'focalPoint' },
      { header: 'Project Status', key: 'projectType' },
      { header: 'Posted By', key: 'user' },
    ];

    // Add project data to the worksheet
    projects.forEach((project) => {
      worksheet.addRow({
        projectTitle: project.projectTitle,
        category: project.categoryId.categoryName,
        piName: project.piName,
        focalPoint: project.focalPoint,
        projectType : project.projectType === 1 ? 'Completed' : 'Ongoing',
        user: project.userId.firstName + ' ' + project.userId.lastName,
       
      });
    });

    // Set response headers for file download
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', 'attachment; filename=projects.xlsx');

    // Save the workbook to a buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Send the buffer as the response
    res.send(buffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
    getAllProjects,
    createNewProject,
    updateProject,
    deleteProject,
    getProjectByid,
    projectDeactivate,
    getProjectsByCategoryId,
    exportProjectsToExcel 
}