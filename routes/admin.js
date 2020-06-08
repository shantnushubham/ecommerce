var express = require('express');
var adminController = require('../controllers/admin/adminController')
var orderController = require('../controllers/orders/orderController')
var UserController = require('../controllers/user/userController')
const { ensureAuthenticated, forwardAuthenticated } = require('../Middlewares/user/middleware');
const functions = require('../Middlewares/common/functions')
var app = express();

app.get('/admin/items', functions.isAdmin, adminController.getAllItems)
app.get('/admin/items/:iid', functions.isAdmin, adminController.getItem)
app.get('/admin/items/status/:status', functions.isAdmin, adminController.getItemByStatus)
app.get('/admin/items/category/:category', functions.isAdmin, adminController.getItemByCategory)
app.get('/admin/createItem', functions.isAdmin, function (req, res) {
    res.render('createItem')
})
app.post('/admin/createItem', functions.isAdmin, adminController.createItem)
app.get('admin/setDiscount', function (req, res) {
    res.render('setDiscount')
})

app.post('/admin/setDiscount', functions.isAdmin, adminController.setDiscount)
app.get('/admin/items/:iid/activate', functions.isAdmin, adminController.activateItem)
app.get('/admin/items/:iid/deactivate', functions.isAdmin, adminController.deactivateItem)
// app.get('/populate/:iid',adminController.populate)

app.get('/admin/createDeal', functions.isAdmin, orderController.getdealCode)
app.post('/admin/createDeal', functions.isAdmin, orderController.postDealCode)

app.get('/admin/discountCodes', orderController.getDiscountCodeList)

app.get('/admin/getUserById', functions.isAdmin, UserController.getUserById)
app.get('/admin/getUsers/:uid', functions.isAdmin, UserController.getAllUsers)

module.exports = app