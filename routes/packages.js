var express = require('express');
const packageController = require('../controllers/listAndPackage/packageController')
const { ensureAuthenticated, forwardAuthenticated } = require('../Middlewares/user/middleware');
const functions = require('../Middlewares/common/functions')
var app = express();

// app.post('/admin/create-package', functions.isAdmin, packageController.createPackage)//works
// app.get('/admin/get/package/:lid', functions.isAdmin, packageController.showPackageByLid)
// app.post('/admin/package-add/:iid', functions.isAdmin, packageController.addToPackage)//works
// app.get('/admin/package/remove/:iid/:lid', functions.isAdmin, packageController.removeFromPackage)
// app.get('/admin/package-update/:lid', functions.isAdmin, packageController.getUpdatePackage)//works
// app.post('/admin/package-update/:lid', functions.isAdmin, packageController.postUpdatePackage)//works
// app.get('/admin/publish-package/:lid', functions.isAdmin, packageController.getPublishPackage)
// app.post('/admin/publish-package/:lid', functions.isAdmin, packageController.publishPackage)//works
// app.get('/export-package/:lid', ensureAuthenticated, packageController.addPackageToCart)//works



app.get('/admin/create-package',functions.isAdmin,packageController.getCreatePackage)
app.post('/admin/create-package',functions.isAdmin,packageController.postCreatePackage)
app.get('/admin/update-package',functions.isAdmin,packageController.getUpdatePackage)
app.post('/admin/update-package',functions.isAdmin,packageController.postUpdatePackage)
app.get('/admin/get-packageitems/:iid',functions.isAdmin,packageController.getPackageItems)
app.post('/add/package/:iid',ensureAuthenticated,packageController.addToCart)




module.exports = app
