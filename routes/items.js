var express = require('express');
var itemController= require('../controllers/item/itemController')
var app = express();

app.get('/items',itemController.getAllItems)
app.get('/items/:iid',itemController.getItem)


module.exports=app