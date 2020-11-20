var express = require('express');
var router = express.Router();
const { forwardAuthenticated, ensureAuthenticated } = require('../Middlewares/user/middleware');
var functions = require('../Middlewares/common/functions')
// Controllers
var viewController = require('../controllers/view_controller');
var UserControl = require('../controllers/user/userController');
var offerpage = require('../models/Items/offerpage')

router.get('/', (req, res) => {
    if (!req.user) {
        return res.render('index')
    }
    else if (req.user && !req.user.active) {
        return res.render('address', { user: req.user })
    }
    else return res.render('index', { user: req.user })
})

router.get('/address', ensureAuthenticated, (req, res) => {
    res.render('address', { user: req.user })
});
// const ab=require('../controllers/common/Mailer')
// router.get('/emailtest',ab.Register)
router.get('/dashboard', (req, res) => {
    res.render('dashboard', {
        user: req.user
    })
});

router.get('/franchisee', (req, res) => {
    res.render('franchisee')
})

router.get("/bio-bubble", (req, res) => {
    res.render("bioBubble")
})

router.get("/air-fumigation", (req, res) => {
    res.render("airFumigation");
})

router.get("/complete-disinfection", (req, res) => {
    res.render("completeDisinfection");
})

router.get("/offers", (req, res) => {
    offerpage.findOne({ name: "offer" }, function (err, found) {
        if (err)
            return res.redirect('/')
        else if (functions.isEmpty(found)) {
            req.flash('success', 'No offers for now. Please check back later.')
            return res.redirect('/')
        }
        else {
            res.render('offers', { data: found })
        }

    })
})

router.get("/admin/offerpage", functions.isAdmin, function (req, res) {
    offerpage.findOne({ name: "offer" }, function (err, found) {
        if (err)
            return res.redirect('/admin')
        else {
            res.render('adminOfferPage', { data: found })
        }


    })
})

router.post('/admin/offerpage', functions.isAdmin, function (req, res) {
    var img = req.body.images.split('||')
    var data = req.body.data
    offerpage.findOneAndUpdate({ name: "offer" }, { cover: img, data: data }, function (err, found) {
        if (err)
            return res.redirect('/admin')
        else {
            req.flash("success", "Successfully Updated")
            res.redirect('/admin/offer-section')
        }
    })
})
router.get("/conditions-of-use", (req, res) => {
    res.render("conditionsOfUse")
})

router.get("/contact-us", (req, res) => {
    res.render("contactUs")
})

router.get("/about-us", (req, res) => {
    res.render("aboutUs");
})

router.get("/cookies-notice", (req, res) => {
    res.render("cookiesNotice")
})

router.get("/privacy-policy", (req, res) => {
    res.render("privacyPolicy")
})

router.post('/checkPincodeValid', UserControl.checkPinCodeValid);

router.get('/recover', forwardAuthenticated, (req, res) => res.render('recover'));
router.post('/recover', UserControl.recover);

router.get('/reset/:token', UserControl.reset, (req, res) => {
    res.render('resetPassword', { token: req.params.token })
});

router.post('/resetpassword', UserControl.resetPassword);
// -> /users
router.use('/users', require('./user/routes'));

// -> /*
router.get('/*', function (req, res) {
    res.redirect('/')
});

module.exports = router;
