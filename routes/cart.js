var express = require('express');
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
module.exports=app
