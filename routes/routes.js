var express = require('express');
var router = express.Router();
const { forwardAuthenticated, ensureAuthenticated } = require('../Middlewares/user/middleware');

// Controllers
var viewController = require('../controllers/view_controller');
var UserControl = require('../controllers/user/userController');

router.get('/', (req, res) => res.render('new'));

// router.get('/', (req, res) => {
//   console.log(req.user, 'sdf');
//   return res.render('index1')
// });


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
