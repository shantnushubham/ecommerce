var express = require('express');
var adminController = require('../controllers/admin/adminController')
var orderController = require('../controllers/orders/orderController')
var UserController = require('../controllers/user/userController')
const { ensureAuthenticated, forwardAuthenticated } = require('../Middlewares/user/middleware');
const functions = require('../Middlewares/common/functions')
var app = express();

app.get("/admin", functions.isAdmin, adminController.showAdminPage)
app.get("/admin/item-section", functions.isAdmin, adminController.showItemsSection)
app.get('/admin/items', functions.isAdmin, adminController.getAllItems)
app.get('/admin/items/:iid', functions.isAdmin, adminController.getItem)
app.get('/admin/items/status/:status', functions.isAdmin, adminController.getItemByStatus)
app.post('/admin/items/category/', functions.isAdmin, adminController.getItemByCategory)
app.get('/admin/createItem', functions.isAdmin, function (req, res) {
    res.render('createItem')
})
app.post('/admin/createItem', functions.isAdmin, adminController.createItem)
app.get('/admin/update-item/:iid',functions.isAdmin,adminController.getUpdateItem)
app.post('/admin/update-item/:iid',functions.isAdmin,adminController.updateItem)

app.get('/admin/setDiscount', function (req, res) {
    res.render('setDiscount')
})

app.post('/admin/setDiscount', functions.isAdmin, adminController.setDiscount)
app.get('/admin/items/:iid/activate', functions.isAdmin, adminController.activateItem)
app.get('/admin/items/:iid/deactivate', functions.isAdmin, adminController.deactivateItem)

// app.get('/populate/:iid',adminController.populate)

app.get('/admin/createDeal', functions.isAdmin, orderController.getdealCode)
app.post('/admin/createDeal', functions.isAdmin, orderController.postDealCode)

app.get('/admin/discountCodes', orderController.getDiscountCodeList)

app.get("/admin/user-section", functions.isAdmin, UserController.showUserSection)
app.get('/admin/getUsers/:uuid', functions.isAdmin, UserController.getUserById)
app.get('/admin/getUsers', functions.isAdmin, UserController.getAllUsers)
app.get('/admin/getIndividuals', functions.isAdmin, UserController.getAllIndividual)

app.get('/business/allowCredit/:uuid',functions.isAdmin,UserController.allowCredit)
// List of individual users needed

app.get("/admin/account-invoice", functions.isAdmin, adminController.showAccountAndInvoice)
app.get('/downloads/bizAccounts',functions.isAdmin,adminController.downloadBizAccList)
app.get("/downloads/invoice/payment", functions.isAdmin, adminController.getCSVDownloadPagePayment)
app.post('/downloads/invoice/payment',functions.isAdmin,adminController.downloadInvoiceByRangePayment)
app.get("/downloads/invoice/shipment", functions.isAdmin, adminController.getCSVDownloadPageShipment)
app.post('/downloads/invoice/shipment',functions.isAdmin,adminController.downloadInvoiceByRangeShipment)
app.get('/downloads/users/:type',adminController.downloadUserList)


module.exports = app