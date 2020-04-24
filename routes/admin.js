var express = require('express');
var adminController= require('../controllers/admin/adminController')
var app = express();

app.get('/admin/items',adminController.getAllItems)
app.get('/admin/items/:iid',adminController.getItem)
app.get('/admin/items/status/:status',adminController.getItemByStatus)
app.get('/admin/items/category/:category',adminController.getItemByCategory)
app.get('/admin/createItem',function(req,res){
    res.render('createItem')
})
app.post('/admin/createItem',adminController.createItem)
app.get('admin/setDiscount',function(req,res){
    res.render('setDiscount')
})

app.get('/',function(req,res){
    res.render('index')
})

app.post('/admin/setDiscount',adminController.setDiscount)
app.get('/admin/items/:iid/activate',adminController.activateItem)
app.get('/admin/items/:iid/deactivate',adminController.deactivateItem)
// app.get('/populate/:iid',adminController.populate)
module.exports=app
