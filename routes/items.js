var express = require('express');
var itemController = require('../controllers/item/itemController')
var app = express();
app.get('/items/category/:category', itemController.categoryPages)
app.get("/get-items/:category", itemController.getItemsByCategoryAndSubCategory)

app.get('/items', itemController.getAllItems)
app.get('/items/:iid', itemController.getItem)

app.post('/items', itemController.filterItems)
app.post('/search',itemController.search)
module.exports = app