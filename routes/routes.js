var express = require('express');
var router = express.Router();
const { forwardAuthenticated, ensureAuthenticated } = require('../Middlewares/user/middleware');

// Controllers
var viewController = require('../controllers/view_controller');
var UserControl = require('../controllers/user/userController');


router.get('/', (req,res) => {
  if(!req.user){
    return res.render('index')
  }
  else if( req.user && !req.user.active) {
    return res.render('address', {user: req.user})
  }
  else return res.render('index', {user: req.user})
})

router.get('/address', ensureAuthenticated, (req, res) => {
  return res.render('address', {user: req.user})
});

router.get('/dashboard', (req, res) => {
  res.render('dashboard', {
    user: req.user
  })
});

router.post('/checkPincodeValid', UserControl.checkPinCodeValid);

router.get('/recover', forwardAuthenticated, (req, res) => res.render('recover'));
router.get('/reset/:token', UserControl.reset, (req, res) => {
  return res.render('resetPassword', {token: req.params.token})});


  
  

router.post('/recover', UserControl.recover);
router.post('/resetpassword', UserControl.resetPassword);   
// -> /users
router.use('/users', require('./user/routes'));

// -> /*
router.get('/*', function(req,res){
  res.redirect('/')
});

module.exports = router;
