const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const loginLimiter = require('../middleware/loginLimiter')

router.route('/').post(loginLimiter, authController.login);
router.route('/refresh').get(authController.refresh);
router.route('/forgot-password').post(authController.forgotPassword);
router.route('/reset-password/:token').patch(authController.resetPassword);
router.route('/check-email').post(authController.checkEmailExists);
router.route('/logout').post(authController.logout);


module.exports = router;