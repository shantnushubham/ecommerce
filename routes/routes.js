var express = require('express');
var router = express.Router();
// Controllers
var viewController = require('../controllers/view_controller');

// -> /*
router.get('/*', viewController);

module.exports = router;
