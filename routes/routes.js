var express = require('express');
var router = express.Router();
const { forwardAuthenticated, ensureAuthenticated } = require('../Middlewares/user/middleware');

// Controllers
var viewController = require('../controllers/view_controller');

router.get('/', forwardAuthenticated, (req, res) => res.render('welcome'));

router.get('/dashboard', ensureAuthenticated, (req, res) =>
  res.render('dashboard', {
    user: req.user
  })
);

// -> /users
router.use('/users', require('./user/routes'));

// -> /*
router.get('/*', viewController);

module.exports = router;
