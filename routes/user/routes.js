var express = require('express')
var router = express.Router()
const passport = require('passport');
const middleware = require('../../Middlewares/common/functions')

const { ensureAuthenticated, forwardAuthenticated } = require('../../Middlewares/user/middleware');

var UserControl = require('../../controllers/user/userController')

router.get('/login', forwardAuthenticated, (req, res) => {
    return res.render('login')
});
router.get('/register', forwardAuthenticated, (req, res) => res.render('register'));
router.post('/register', forwardAuthenticated, UserControl.register);
router.post('/addDefaultAddress', ensureAuthenticated, UserControl.addDefaultUserAddress);
router.get('/getUserAddress', ensureAuthenticated, UserControl.getUserAddress);
router.post('/addAddress', ensureAuthenticated, UserControl.addUserAddress);
router.post('/login', passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/users/login",
    failureFlash: true
}), (req, res) => {
});


router.get('/logout', ensureAuthenticated, UserControl.logout);



router.post('/addUserAddress', ensureAuthenticated, UserControl.addUserAddress)
router.put('/updateUserData', ensureAuthenticated, UserControl.updateUserData)
router.put('/makeDefaultAddress', ensureAuthenticated, UserControl.makeAdressToDefaultAddress)
router.put('/updateAddress', ensureAuthenticated, UserControl.updateUserAddress)
router.get('/add/business-account', ensureAuthenticated, UserControl.getBusinessAccountReg)
router.get('/add/business-account', ensureAuthenticated, UserControl.postBusinessAccReg)
router.get('/business-accounts', middleware.isAdmin, UserControl.getAllBizReq)
router.get('/accept/business-account/:bid', middleware.isAdmin, UserControl.acceptBizReq)
router.get('/reject/business-account/:bid', middleware.isAdmin, UserControl.revokeBizAcc)




// router.delete('/deleteUser', ensureAuthenticated, UserControl.deleteUserById)
// router.delete('/deleteAddress', ensureAuthenticated, UserControl.deleteAddress)



module.exports = router