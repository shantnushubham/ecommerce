var itemMetaModel = require("../../models/Items/ItemMetadata")
var itemmodel = require('../../models/Items/Items')
var cartmodel = require('../../models/cart/cart')
var cartservices = require('../../openServices/cart')
var mongoose = require("mongoose")
var middleware = require('../../Middlewares/user/middleware')
var async= require('async')

//get items from cart
exports.getAllItems = function (req, res) {
    
    cartmodel.aggregate([
        { $match : { uid:'xyz' } },
        { $lookup: { from: 'items', localField: 'iid', foreignField: 'iid', as: 'item' } },
        { $project: { 
            "quantity": "$quantity", 
            "uid": "$uid", 
            "item": { "$arrayElemAt": [ "$item", 0 ] } 
        }} ]).exec(function(err,found){
        if(err){
            console.log(err);
            req.flash('error','error in fetching cart')
            res.redirect('/items')
        }
        else{
        
        cartlisting = cartservices.verifyCart(found, 'xyz')
        //  console.log(cartlisting);   
         cartlisting.forEach(element => {
             console.log(element);
         });
        res.render('cartpage',{cart:cartlisting})
    }
    })
   
  

}

// remove double entry
//add to cart
exports.addItem = function (req, res) {
    itemmodel.findOne({ iid: req.params.iid, active: true }, function (err, founditem) {
        if (err) {
            console.log(err);
            req.flash('error', 'could not find any item by that name')
            res.redirect('/items')
        }
        else {
            if (middleware.isEmpty(founditem)) {
                console.log('empty');
                req.flash('error', 'could not find any item by that name')
                res.redirect('/items')
            }
            else {
                cartservices.checkCartForItem(founditem.iid, 'xyz', function (cartItem) {
                    if (cartItem.success == false) {
                        console.log('trouble in fetching cart');
                        req.flash('error', 'trouble in fetching cart')
                        res.redirect('/items')
                    }
                    else {
                        if (cartItem.found == true) {
                            console.log('success already');
                            req.flash('success', 'You already have this item in your cart')
                            res.redirect('/cartpage')
                        }
                        else {
                            console.log(req.body);
                            cartservices.addToCart(founditem.iid,'xyz',req.body.quantity,function(addedCart){
                                if(addedCart.success==false)
                                {
                                    console.log(addedCart.message);
                                    req.flash('error',addedCart.message)
                                    res.redirect('/items')
                                }
                                else
                                {
                                    console.log('success');
                                    req.flash('success','added to cart')
                                    res.redirect('/items')
                                }
                            })

                        }

                    }
                })

            }
        }
    })


}

//call logger?

//update count of item
exports.getUpdateCart=function(req,res){
    var cartlisting = []
    cartservices.getUserCartItems('xyz',function(cartitem){
        if(cartitem.success==false)
        {
            req.flash('error','error in fetching cart')
            res.render('cartpage',{cart:cartlisting})
        }
        else
        {
            cartitem.items.forEach(element => {
                itemmodel.findOne({ iid: element.iid }, function (err, founditem) {
                    if (err) {
                        req.flash('error','error in fetching cart')
                        res.render('cartpage',{cart:cartlisting})
                     }
                    else {
                        var itemdata = {
                            itemID: element.iid,
                            itemName: founditem.name,
                            quantity: element.quantity,
                            price: founditem.price,
                            image: founditem.image,
                            uid: 'xyz',
                        }
                        cartlisting.push(itemdata)
        
                    }
                })
            });
        }
    })
   
    cartlisting = cartservices.verifyCart(cartlisting, 'xyz')
    res.render('updateCart',{cart:cartlisting})
}

exports.updateCart = function (req, res) {
   var errolist=[]
  console.log(req.body);
   var errorFlag=false
   var cart=req.body
   var ids=Object.keys(cart)
   console.log(ids);
   
    // ids.forEach(element => {
    //     console.log(cart[element]);
    //      cartservices.updateCart(element,'xyz',cart[element],function(updatedCart){
    //         if(updatedCart.success==false){
    //             console.log('error');
    //             errolist.push('error for element with iid'+element.iid)
    //             errorFlag=true
    //         }
            
    //     })
    // });
    
ids.forEach(obj => promiseArr.push( cartservices.updateCart(obj,'xyz',cart[obj])));

    // if(errorFlag){
    //     console.log(errorlist);
    //     }
    
    Promise.all(promiseArr).then((respo) =>{
        console.log('updated');
    console.log(respo);
    res.redirect('/cartpage')} ).catch(err => {
        console.log(err);
res.redirect('/cartpage')
})
    


}
//clear cart
exports.clearCart = function (req, res) {
    
   cartservices.clearCart('xyz',function(updatedCart){
    if(updatedCart.success==false)
    {
        req.flash('error','error in clearing cart. please try again')
        res.redirect('/cartpage')
    }
    else
    {
        res.redirect('/cartpage')
    }
   })
}

exports.verify = function (req, res) {
    console.log(req.session.cart)
    var newCart = [
        {
            itemID: '123', quantity: 7, uid: 'xxyz'
        },
        {
            itemID: '127', quantity: 6, uid: 'xyz'
        },
        {
            itemID: '122', quantity: 4, uid: 'xyz'
        },
    ]
    console.log(cartservices.verifyCart(newCart, 'xyz'))
}

exports.checkout = function (req, res) {
   

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
