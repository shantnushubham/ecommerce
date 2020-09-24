var express = require('express');
var cartController= require('../controllers/cart/cartController')
const { ensureAuthenticated, forwardAuthenticated } = require('../Middlewares/user/middleware');
var app = express();

app.get('/cartpage',ensureAuthenticated,cartController.getAllItems)
app.get('/updateCart',ensureAuthenticated,cartController.getUpdateCart)
app.post('/updateCart',ensureAuthenticated,cartController.updateCart)
app.get('/clearcart',ensureAuthenticated,cartController.clearCart)
app.post('/add/:iid',ensureAuthenticated,cartController.addItem)
app.get('/verify',ensureAuthenticated,cartController.verify)
app.post('/addMany/:iid',cartController.addManyToCart)

module.exports=app
