var express = require('express')
var router = express.Router()

const { ensureAuthenticated, forwardAuthenticated } = require('../../Middlewares/user/middleware');

var UserControl = require('../../controllers/user/userController')

router.get('/login', forwardAuthenticated, (req, res) => res.render('login'));
router.get('/register', forwardAuthenticated, (req, res) => res.render('register'));

router.post('/register', UserControl.register);
router.post('/login', UserControl.login);
router.get('/logout', UserControl.logout);


router.get('/getUserById', ensureAuthenticated, UserControl.getUserById)
router.post('/addUserAddress', ensureAuthenticated, UserControl.addUserAddress)
router.put('/updateUserData', ensureAuthenticated, UserControl.updateUserData)
router.put('/makeDefaultAddress', ensureAuthenticated, UserControl.makeAdressToDefaultAddress)
router.put('/updateAddress', ensureAuthenticated, UserControl.updateUserAddress)
router.delete('/deleteUser', ensureAuthenticated, UserControl.deleteUserById)
router.delete('/deleteAddress', ensureAuthenticated, UserControl.deleteAddress)



module.exports = router