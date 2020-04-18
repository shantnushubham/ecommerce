var express = require('express');
var cartController= require('../controllers/cart/cartController')
var app = express();

app.get('/additem/:iid',function(req,res){
    console.log(req.session)
    if(!req.session.cart)
    {
        req.session.cart=[]
    }
    var cartitem={
        itemID:req.params.iid,
        quantity:1,
        uid:'xyz',
        update:true,
    }
    req.session.cart.push(cartitem)
    console.log(req.session)
    res.render('test')
})
app.get('/cartpage',cartController.getAllItems)
app.get('/updateCart',cartController.getUpdateCart)
app.post('/updateCart',cartController.updateCart)
app.get('/clearcart',cartController.clearCart)
app.post('/add/:iid',cartController.addItem)
// app.get('/verify',cartController.verify)

module.exports=app
