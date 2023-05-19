const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const verifyJWT = require('../middleware/verifyJWT')

router.use(verifyJWT)

router.route('/count').get(homeController.getDashboardCount);

module.exports = router;