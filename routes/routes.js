var express = require('express');
var router = express.Router();
const { forwardAuthenticated, ensureAuthenticated } = require('../Middlewares/user/middleware');

// Controllers
var viewController = require('../controllers/view_controller');
var UserControl = require('../controllers/user/userController');

router.get('/', forwardAuthenticated, (req, res) => res.render('welcome'));

router.get('/dashboard', ensureAuthenticated, (req, res) =>
  res.render('dashboard', {
    user: req.user
  })
);


router.get('/recover', forwardAuthenticated, (req, res) => res.render('recover'));
router.get('/reset/:token', UserControl.reset, (req, res) => {
  return res.render('resetPassword', {token: req.params.token})});

router.post('/recover', UserControl.recover);
router.post('/resetpassword', UserControl.resetPassword);   
// -> /users
router.use('/users', require('./user/routes'));

// -> /*
router.get('/*', viewController);

module.exports = router;
