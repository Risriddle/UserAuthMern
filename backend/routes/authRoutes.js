const express = require('express');
const authController = require('../controllers/authController');

const Router = express.Router();


Router.get("/google/callback/", authController.googleAuth);



module.exports = Router;