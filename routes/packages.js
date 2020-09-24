var express = require('express');
const packageController = require('../controllers/listAndPackage/packageController')
const { ensureAuthenticated, forwardAuthenticated } = require('../Middlewares/user/middleware');
const functions = require('../Middlewares/common/functions')
var app = express();

app.post('/admin/create-package', packageController.createPackage)//works
app.get('/admin/get/package/:lid', packageController.showPackageByLid)
app.post('/admin/package-add/:iid', packageController.addToPackage)//works
app.get('/admin/package/remove/:iid/:lid', packageController.removeFromPackage)
app.get('/admin/package-update/:lid', ensureAuthenticated, packageController.getUpdatePackage)//works
app.post('/admin/package-update/:lid', ensureAuthenticated, packageController.postUpdatePackage)//works
app.post('/admin/publish-package/:lid', ensureAuthenticated, packageController.publishPackage)
app.get('/user/export-list/:lid', ensureAuthenticated, packageController.addPackageToCart)






module.exports = app
