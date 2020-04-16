var itemMetaModel=require("../../models/Items/ItemMetadata")
var itemmodel=require('../../models/Items/Items')
var cartservices=require('../../openServices/cart')
var mongoose=require("mongoose")
//get items from cart
exports.getAllItems=function(req,res){
    var cart=req.session.cart
    var cartlisting=[]
    cart.forEach(element => {
        itemmodel.findOne({iid:element.itemID},function(err,founditem){
            if(err)
            {}
            else{
                var itemdata={
                    itemID:element.iid,
                    itemName:founditem.name,
                    quantity:element.quantity,
                    price:founditem.price,
                    image:founditem.image,
                    uid:'xyz',
                }
                cartlisting.push(itemdata)
                
            }
        })
    });
    cartlisting=cartservices.verifyCart(cartlisting,'xyz')
    console.log(req.session)
    console.log(cartlisting)
    res.render('test')
    // res.render('cartpage',cartlisting)
    
}

// remove double entry
//add to cart
exports.addItem=function(req,res){
    if(!req.session.cart)
    {
        req.session.cart=[]
    }
    
    // var item=req.body.itemID
    var item='123'
    var found=false
    for(var i=0;i<req.session.cart.length;i++){
        
       if(req.session.cart[i].itemID==item)
       {
        found=true
        req.session.cart[i].quantity++
       }
    }
    if(!found)
    {
        
    var cartitem={
        // itemID:req.params.iid,
        itemID:'123',
        quantity:1,
        uid:'xyz',
        
    }
    req.session.cart.push(cartitem)
    }
    console.log(req.session)
    // res.redirect('/items')
    res.render('test')
    
}

//call logger?

//update count of item
exports.updateCart=function(req,res){
    console.log(req.session)
    if(!req.session.cart)
    {
        req.session.cart=[]
    }
    // var newCart=req.body.cart
    var newCart=[
        {
            itemID:'123',quantity:7,uid:'xxyz'
        },
        {
            itemID:'127',quantity:6,uid:'xyz'
        },
        {
            itemID:'122',quantity:4,uid:'xyz'
        },
    ]
    console.log(newCart)
    console.log(req.session.cart.length)
    for(var i=0;i<newCart.length;i++)
    {
        for(var j=0;j<req.session.cart.length;j++){
            console.log(req.session.cart[j].itemID+"  "+newCart[i].itemID)
            if(req.session.cart[j].itemID==newCart[i].itemID){
                if(newCart[i].quantity<=0)
                {
                    req.session.cart.splice(j,1)
                }
                else{
                req.session.cart[j].quantity=newCart[i].quantity
                    console.log('changed='+req.session.cart)
            }
            }
        }
    }
    // res.redirect('/cartpage')
    console.log(req.session)
    res.render('test')
   
    
}
//clear cart
exports.clearCart=function(req,res){
    req.session.cart=[]
    // res.redirect('/cartpage')
    console.log(req.session)
    res.render('test')
}

exports.verify=function(req,res){
    console.log(req.session.cart)
    var newCart=[
        {
            itemID:'123',quantity:7,uid:'xxyz'
        },
        {
            itemID:'127',quantity:6,uid:'xyz'
        },
        {
            itemID:'122',quantity:4,uid:'xyz'
        },
    ]
    console.log(cartservices.verifyCart(newCart,'xyz'))
}

exports.checkout=function(req,res){
    if(!req.session.cart)
    req.session.cart=[]
    else{
        if(req.session.cart.length==0)
        {
            //send back to add item page
        }
        else{
            var decidedCart=cartservices.verifyCart(req.session.cart)
            res.render('checkout',{decidedCart:decidedCart})
        }
    }
    
}

//pages needed
/**
 * cartpage
 * updatecart page
 * item page
 * item listing page
 * checkout page
 * 
 */
