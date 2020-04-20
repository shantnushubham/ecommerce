var itemMetaModel = require("../models/Items/ItemMetadata")
var itemmodel = require('../models/Items/Items')
var cartmodel = require('../models/cart/cart')
var functions = require('../Middlewares/user/middleware')

var mongoose = require("mongoose")
class cart {
    constructor() {

    }
    getUserCartItems(uid,callback){
        cartmodel.find({uid:uid},function(err,foundItem){
            if(err)
            {
                callback({success:false})

            }
            else
            {
                callback({success:true,items:foundItem})
            }
        })
    }

    verifyCart(cart, uid) {
        var i = 0
        for (i = 0; i < cart.length; i++) {
            var element = cart[i];
            if (element.uid != uid)
                cart.splice(i, 1)
        }

        return (cart)

    }

    checkCartForItem(iid, uid, callback) {
        cartmodel.findOne({ iid: iid, uid: uid }, function (err, foundItem) {
            if (err) {
                callback({ success: false, found: false })

            }
            else {
                if (functions.isEmpty(foundItem)) {
                    callback({ success: true, found: false })
                }
                else {
                    callback({ success: true, found: true, item: foundItem })
                }
            }
        })
    }

    updateQuantity(iid, uid, quantity, callback) {
        console.log(quantity);
        cartmodel.findOne({ iid: iid, uid: uid }, function (err, foundItem) {
            if (err) {
                console.log(err);
                callback({ success: false, found: false })

            }
            else {
                if (functions.isEmpty(foundItem)) {
                    console.log('not in cart');
                    callback({ success: false, found: false,message:'item with iid'+iid+' does not exist in cart' })
                }
                else {
                    itemmodel.findOne({ iid: iid, active: true }, function (err, founditem) {
                        if (err) {
                            console.log(err);
                            callback({ success: false, message: 'could not find any item by that name' })
            
                        }
                        else {
                            if (functions.isEmpty(founditem)) {
                                console.log('unavailable item');
                                callback({ success: false, message: 'could not find any item by that name' })
            
                            }
                            else {
                                
                                if(quantity==0)
                                {

                                    cartmodel.deleteOne({iid:founditem.iid,uid:uid},function(err,deleted){
                                        if (err) {
                                            console.log(err);
                                            callback({ success: false, message: 'error in adding to cart' })
                
                                        }
                                        else {
                                            console.log('success deleting');
                                            callback({ success: true, item: deleted })
                                        }
                                    })
                                }
                                else
                                {
                                cartmodel.findOneAndUpdate({iid:founditem.iid,uid:uid},{'$set':{quantity:quantity}}, function (err, addedItem) {
                                    if (err) {
                                        console.log(err);
                                        callback({ success: false, message: 'error in adding to cart' })
            
                                    }
                                    else {
                                        console.log('success');
                                        callback({ success: true, item: addedItem })
                                    }
                                })
                            }
            
            
                            }
                        }
            
                    })

                }
            }
        })
    }

  updateCart(iid, uid, quantity){
        
        console.log(quantity);
        return new Promise((resolve,reject)=>{
            cartmodel.findOne({ iid: iid, uid: uid }).then( function(foundItem) {
            
            
                if (functions.isEmpty(foundItem)) {
                    console.log('not in cart');
                    // callback({ success: false, found: false,message:'item with iid'+iid+' does not exist in cart' })
                    reject()
                }
                else {
                    itemmodel.findOne({ iid: iid, active: true }).then(function ( founditem) {
                        
                            if (functions.isEmpty(founditem)) {
                                console.log('unavailable item');
                                // callback({ success: false, message: 'could not find any item by that name' })
                                reject()
            
                            }
                            else {
                                
                                if(quantity==0)
                                {

                                    cartmodel.deleteOne({iid:founditem.iid,uid:uid}).then(function(deleted){
                                        
                                        
                                            console.log('success deleting');
                                            // callback({ success: true, item: deleted })
                                            resolve()
                                        
                                    }).catch(function(err){
                                        console.log(err);
                                        // callback({success:false})
                                        reject()
                                    })
                                }
                                else
                                {
                                cartmodel.findOneAndUpdate({iid:founditem.iid,uid:uid},{'$set':{quantity:quantity}}).then(function ( addedItem) {
                                    
                                    
                                        console.log('success');
                                        // callback({ success: true, item: addedItem })
                                        resolve()
                                    
                                }).catch(function(err){
                                    console.log(err);
                                    // callback({success:false})
                                    reject()
                                })
                            }
            
            
                            }
                        
            
                    }).catch(function(err){
                        console.log(err);
                        // callback({success:false})
                        reject()
                    })

                }
            
        }).catch(function(err){
            console.log(err);
            // callback({success:false})
            reject()
        })
        })
       
        
    }

    addToCart(iid, uid, quantity,callback) {
        itemmodel.findOne({ iid: iid, active: true }, function (err, founditem) {
            if (err) {
                callback({ success: false, message: 'could not find any item by that name' })

            }
            else {
                if (functions.isEmpty(founditem)) {
                    callback({ success: false, message: 'could not find any item by that name' })

                }
                else {

                    var cartelement = {
                        uid: 'xyz',
                        iid: founditem.iid,
                        quantity: quantity,
                        image: founditem.image,
                        name: founditem.name,

                    }
                    cartmodel.create(cartelement, function (err, addedItem) {
                        if (err) {
                            console.log(err);
                            callback({ success: false, message: 'error in adding to cart' })

                        }
                        else {
                            callback({ success: true, item: addedItem })
                        }
                    })



                }
            }

        })
    }


    clearCart(uid,callback){
        cartmodel.deleteMany({uid:uid},function(err,updatedcart){
            if(err)
            {
                console.log(err);
                callback({success:false})
            }
            else{
                callback({success:true,cart:updatedcart})
            }
        })
    }

}
module.exports = new cart()
