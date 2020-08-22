var itemMetaModel = require("../../models/Items/ItemMetadata")
var itemmodel = require('../../models/Items/Items')
var cartmodel = require('../../models/cart/cart')
var cartservices = require('../../openServices/cart')
var mongoose = require("mongoose")
var middleware = require('../../Middlewares/common/functions')
var async= require('async')

//get items from cart
exports.getAllItems = function (req, res) {
    console.log('user='+req.user);
    console.log('body='+req.body);

    cartmodel.aggregate([
        { $match : { uuid:req.user.uuid } },
        { $lookup: { from: 'items', localField: 'iid', foreignField: 'iid', as: 'item' } },
        { $project: { 
            "quantity": "$quantity", 
            "uuid": "$uuid", 
            "item": { "$arrayElemAt": [ "$item", 0 ] } 
        }} ]).exec(function(err,found){
        if(err){
            console.log(err);
            req.flash('error','error in fetching cart')
            res.redirect('/items')
        }
        else{
        
        cartlisting = cartservices.verifyCart(found, req.user.uuid)
        //  console.log(cartlisting);   
         
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
                cartservices.checkCartForItem(founditem.iid, req.user.uuid, function (cartItem) {
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
                            cartservices.addToCart(founditem.iid,req.user.uuid,req.body.quantity,function(addedCart){
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
    console.log('getting cart');
    var cartlisting = []
    cartservices.getUserCartItems(req.user.uuid,function(cartitem){
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
                            uuid: req.user.uuid,
                        }
                        cartlisting.push(itemdata)
        
                    }
                })
            });
        }
    })
   
    cartlisting = cartservices.verifyCart(cartlisting, req.user.uuid)
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
    //      cartservices.updateCart(element,req.user.uuid,cart[element],function(updatedCart){
    //         if(updatedCart.success==false){
    //             console.log('error');
    //             errolist.push('error for element with iid'+element.iid)
    //             errorFlag=true
    //         }
            
    //     })
    // });
    var promiseArr=[]
ids.forEach(obj => promiseArr.push( cartservices.updateCart(obj,req.user.uuid,cart[obj]) ) ) ;

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
// res.redirect('/cartpage');
    


}
//clear cart
exports.clearCart = function (req, res) {
    
   cartservices.clearCart(req.user.uuid,function(updatedCart){
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
    console.log('user='+req.user);
    cartservices.getListingForCheckout(req.user.uuid,function(resp){
        console.log(resp);
    })
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
