var express = require('express');
var adminController= require('../controllers/admin/adminController')
const { ensureAuthenticated, forwardAuthenticated } = require('../Middlewares/user/middleware');
var app = express();

app.get('/admin/items',ensureAuthenticated,adminController.getAllItems)
app.get('/admin/items/:iid',ensureAuthenticated,adminController.getItem)
app.get('/admin/items/status/:status',ensureAuthenticated,adminController.getItemByStatus)
app.get('/admin/items/category/:category',ensureAuthenticated,adminController.getItemByCategory)
app.get('/admin/createItem',ensureAuthenticated,function(req,res){
    res.render('createItem')
})
app.post('/admin/createItem',ensureAuthenticated,adminController.createItem)
app.get('admin/setDiscount',function(req,res){
    res.render('setDiscount')
})

app.post('/admin/setDiscount',ensureAuthenticated,adminController.setDiscount)
app.get('/admin/items/:iid/activate',ensureAuthenticated,adminController.activateItem)
app.get('/admin/items/:iid/deactivate',ensureAuthenticated,adminController.deactivateItem)
// app.get('/populate/:iid',adminController.populate)
module.exports=app
