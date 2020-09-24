var express = require('express');
const listController=require('../controllers/listAndPackage/listController')
const vendorController=require('../controllers/item/vendorController')
const { ensureAuthenticated, forwardAuthenticated } = require('../Middlewares/user/middleware');
const middleware=require('../Middlewares/common/functions')
var app = express();

app.get('/admin/vendors',middleware.isAdmin,vendorController.getVendors)
app.get('/admin/vendors/:vendorId',middleware.isAdmin,vendorController.fetchVendorById)
app.get('/admin/createVendor',middleware.isAdmin,vendorController.getCreateVendor)
app.post('/admin/createVendor',middleware.isAdmin,vendorController.postCreateVendor)

module.exports=app