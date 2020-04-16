var express = require('express');
var router = express.Router();

// Routes
var userRoutes = require('./user/routes');

// Controllers
var viewController = require('../controllers/view_controller');

// -> /api
// router.use('/api/user', userRoutes);

// -> /*
router.get('/*', viewController);

module.exports = router;
