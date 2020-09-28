var express = require('express');
var itemController = require('../controllers/item/itemController')
var app = express();
app.get('/items/category/:category', itemController.categoryPages)

app.get('/items', itemController.getAllItems)
app.get('/items/:iid', itemController.getItem)
// app.post('/items/filter',itemController.filterItems)
app.post('/items', itemController.filterItems)

module.exports = app