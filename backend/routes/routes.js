const express = require('express');
const authController = require('../controllers/authController');
const Router = express.Router();


// All your routes will go here
Router.get('/verify-token',authController.verifyToken)
Router.get('/getUser',authController.authenticateToken,authController.getUser)
Router.post('/regUser',authController.regUser)
Router.post('/logUser',authController.logUser)
Router.post('/sendMail',authController.sendMail)
Router.post('/verifyMail',authController.verifyEmail)

module.exports = Router;