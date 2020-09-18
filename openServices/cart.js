var itemMetaModel = require("../models/Items/ItemMetadata")
var itemmodel = require('../models/Items/Items')
var cartmodel = require('../models/cart/cart')
var functions = require('../Middlewares/common/functions')

var mongoose = require("mongoose")
class cart {
    constructor() {

    }
    getUserCartItems(uuid, callback) {
        cartmodel.find({ uuid: uuid }, function (err, foundItem) {
            if (err) {
                callback({ success: false })

            }
            else {
                callback({ success: true, items: foundItem })
            }
        })
    }

    verifyCart(cart, uuid) {
        var i = 0
        for (i = 0; i < cart.length; i++) {
            var element = cart[i];
            if (element.uuid != uuid)
                cart.splice(i, 1)
        }

        return (cart)

    }

    checkCartForItem(iid, uuid, callback) {
        cartmodel.findOne({ iid: iid, uuid: uuid }, function (err, foundItem) {
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

    updateQuantity(iid, uuid, quantity, callback) {
        console.log(quantity);
        cartmodel.findOne({ iid: iid, uuid: uuid }, function (err, foundItem) {
            if (err) {
                console.log(err);
                callback({ success: false, found: false })

            }
            else {
                if (functions.isEmpty(foundItem)) {
                    console.log('not in cart');
                    callback({ success: false, found: false, message: 'item with iid' + iid + ' does not exist in cart' })
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

                                if (quantity == 0) {

                                    cartmodel.deleteOne({ iid: founditem.iid, uuid: uuid }, function (err, deleted) {
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
                                else {
                                    cartmodel.findOneAndUpdate({ iid: founditem.iid, uuid: uuid }, { '$set': { quantity: quantity } }, function (err, addedItem) {
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

    updateCart(iid, uuid, quantity) {
        iid = iid.trim()
        uuid = uuid.trim()
        return new Promise((resolve, reject) => {
            cartmodel.findOne({ iid: iid, uuid: uuid }).then(function (foundItem) {

                if (functions.isEmpty(foundItem)) {
                    console.log('not in cart');
                    // callback({ success: false, found: false,message:'item with iid'+iid+' does not exist in cart' })
                    reject()
                }
                else {
                    itemmodel.findOne({ iid: iid, active: true }).then(function (founditem) {

                        if (functions.isEmpty(founditem)) {
                            console.log('unavailable item');
                            // callback({ success: false, message: 'could not find any item by that name' })
                            reject()

                        }
                        else {

                            if (quantity == 0) {

                                cartmodel.deleteOne({ iid: founditem.iid, uuid: uuid }).then(function (deleted) {


                                    console.log('success deleting');
                                    // callback({ success: true, item: deleted })
                                    resolve()

                                }).catch(function (err) {
                                    console.log(err);
                                    // callback({success:false})
                                    reject()
                                })
                            }
                            else {
                                cartmodel.findOneAndUpdate({ iid: founditem.iid, uuid: uuid }, { '$set': { quantity: quantity } }).then(function (addedItem) {


                                    console.log('success');
                                    // callback({ success: true, item: addedItem })
                                    resolve()

                                }).catch(function (err) {
                                    console.log(err);
                                    // callback({success:false})
                                    reject()
                                })
                            }


                        }


                    }).catch(function (err) {
                        console.log(err);
                        // callback({success:false})
                        reject()
                    })

                }

            }).catch(function (err) {
                console.log(err);
                // callback({success:false})
                reject()
            })
        })


    }

    addToCart(iid, uuid, quantity, callback) {
        itemmodel.findOne({ iid: iid, active: true }, function (err, founditem) {
            if (err) {
                callback({ success: false, message: 'could not find any item by that name' })

            }
            else {
                if (functions.isEmpty(founditem)) {
                    callback({ success: false, message: 'could not find any item by that name' })

                }
                else {
                    cartmodel.findOne({ iid: iid, uuid: uuid }, function (err, foundItem) {
                        if (err) {
                            callback({ success: false, found: false })

                        }
                        else {
                            var cartelement
                            if (functions.isEmpty(foundItem)) {
                                cartelement = {
                                    uuid: uuid,
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
                            else {
                                cartelement = {
                                    uuid: uuid,
                                    iid: founditem.iid,
                                    quantity: parseInt(quantity) + foundItem.quantity,
                                    image: founditem.image,
                                    name: founditem.name,

                                }
                                cartmodel.findOneAndUpdate({ uuid: uuid, iid: founditem.iid, }, { quantity: parseInt(quantity) + foundItem.quantity, }, function (err, updatedCart) {
                                    if (err) {
                                        console.log(err);
                                        callback({ success: false, message: 'error in adding to cart' })

                                    }
                                    else {
                                        callback({ success: true, item: updatedCart })
                                    }
                                })

                            }


                        }
                    })






                }
            }

        })
    }

    addManyToCart(uuid, itemList, qty, callback) {
        if (qty.length < itemList.length) callback({ success: false, err: 'quantity array less than items' })
        else {
            itemmodel.find().where('iid').in(itemList).exec((err, items) => {
                if (itemList.length > items.length) {
                    callback({ success: false, err: "false object entry" })

                }
                else {
                    cartmodel.find({ uuid: uuid }, function (err, foundCart) {
                        if (err)
                            callback({ success: false })
                        else {
                            var mapC = {}
                            var input = []
                            var it={}

                            foundCart.forEach(el => {
                                mapC[el.iid] = el
                            })

                            
                            for (var i = 0; i < items.length; i++) {
                                if(items[i] in mapC)
                                {
                                    it = {
                                        uuid: uuid,
                                        iid: items[i].iid,
                                        quantity: parseInt(qty[i])+mapC[items[i]].quantity,
                                        image: items[i].image,
                                        name: items[i].name,
                                    }
                                }
                                else
                                {
                                    it = {
                                        uuid: uuid,
                                        iid: items[i].iid,
                                        quantity: parseInt(qty[i]),
                                        image: items[i].image,
                                        name: items[i].name,
                                    }
                                }
                                input.push(it)
                                
                            }
                            
                        }


                    })

                }

            });

        }

    }


    clearCart(uuid, callback) {
        cartmodel.deleteMany({ uuid: uuid }, function (err, updatedcart) {
            if (err) {
                console.log(err);
                callback({ success: false })
            }
            else {
                callback({ success: true, cart: updatedcart })
            }
        })
    }

    getListingForOrder(uuid, callback) {
        cartmodel.aggregate([
            { $match: { uuid: uuid } },
            { $lookup: { from: 'items', localField: 'iid', foreignField: 'iid', as: 'item' } },
            {
                $project: {
                    "quantity": "$quantity",
                    "iid": "$iid",
                    "item": { "$arrayElemAt": ["$item", 0] }
                    , "price": "$item.price"
                }
            }
        ]).exec(function (err, cartItem) {
            if (err) {
                console.log(err);
                callback({ success: false })
            }
            else {
                console.log(cartItem);
                let total = 0
                let cartlist = []
                cartItem.forEach(cartEl => {
                    var item = {}
                    item.quantity = cartEl.quantity
                    item.iid = cartEl.iid
                    cartlist.push(item)
                    total = total + parseInt((parseInt(cartEl.price[0]) * (1 - cartEl.item.discount) * cartEl.quantity))
                });
                console.log('total amt=', total);
                if (total <= 0 || cartlist.length == 0) {
                    callback({ success: false, message: "cant checkout with empty cart" })
                }
                else
                    callback({ success: true, cartList: cartlist, total: total })
            }
        })
    }

    getListingForCheckout(uuid, callback) {

        cartmodel.aggregate([
            { $match: { uuid: uuid } },
            { $lookup: { from: 'items', localField: 'iid', foreignField: 'iid', as: 'item' } },
            {
                $project: {
                    "quantity": "$quantity",
                    "iid": "$iid",
                    "item": { "$arrayElemAt": ["$item", 0] }
                    , "price": "$item.price"
                }
            }
        ]).exec(function (err, cartItem) {
            if (err) {
                console.log(err);
                callback({ success: false })
            }
            else {
                console.log(cartItem);
                let total = 0
                cartItem.forEach(cartEl => {
                    total = total + parseInt((parseInt(cartEl.price[0]) * (1 - cartEl.item.discount) * cartEl.quantity))
                });
                if (total <= 0) {
                    callback({ success: false, message: "cant checkout with empty cart" })
                }
                else
                    callback({ success: true, cartList: cartItem, total: total })
            }
        })

    }

}
module.exports = new cart()
