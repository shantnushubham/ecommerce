var itemMetaModel = require("../models/Items/ItemMetadata")
var itemmodel = require('../models/Items/Items')
var cartmodel = require('../models/cart/cart')
var functions = require('../Middlewares/common/functions')
var codeModel = require('../models/offer/offer')
var mongoose = require("mongoose")
var offersModel=require('../models/offer/offer')
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
                console.log(err);
                callback({ success: false, message: 'could not find any item by that name' })

            }
            else {
                if (functions.isEmpty(founditem)) {
                    console.log({ success: false, message: 'could not find any item by that name' });
                    callback({ success: false, message: 'could not find any item by that name' })

                }
                else {//item is not a service
                    cartmodel.aggregate([
                        { $match: { uuid: uuid } },
                        { $lookup: { from: 'items', localField: 'iid', foreignField: 'iid', as: 'item' } },
                        {
                            $project: {
                                "quantity": "$quantity",
                                "iid": "$iid",
                                "item": { "$arrayElemAt": ["$item", 0] },

                            }

                        },
                        {
                            $project: {
                                "isService": "$item.isService",
                                "quantity": "$quantity",
                                "iid": "$iid",
                                "item": "$item"
                            }
                        }
                    ]).exec(function (err, foundS) {
                        if (err) {
                            console.log(err);
                            callback({ success: false, message: 'db error' })
                        }
                        else {
                            var containsService = false, containsProduct = false
                            if (foundS.length > 0 && foundS[0].isService) {
                                containsService = true

                            }
                            if (foundS.length > 0 && !foundS[0].isService) {
                                containsProduct = true

                            }
                            // console.log("containsService",containsService);
                            // console.log("containsProduct",containsProduct);

                            // console.log("should be added?",(founditem.isService == false && containsService == true) || (founditem.isService == true && containsProduct == true));
                            if ((founditem.isService == false && containsService == true) || (founditem.isService == true && containsProduct == true)) {
                                callback({ success: false, message: 'cannot add a product with a service to cart' })
                            }
                            else {
                                cartmodel.findOne({ iid: iid, uuid: uuid }, function (err, foundItem) {
                                    if (err) {
                                        console.log(err);
                                        callback({ success: false, found: false })

                                    }
                                    else {
                                        var cartelement
                                        if (functions.isEmpty(foundItem)) {
                                            if (quantity > founditem.stock)
                                                callback({ success: false, message: "not enough items in stock" })
                                            else {


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
                                        }
                                        else {
                                            if (parseInt(quantity) + foundItem.quantity > founditem.stock)
                                                callback({ success: false, message: "not enough items in stock" })
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


                                    }
                                })



                            }

                        }
                    })







                }
            }

        })
    }

    addManyToCart(uuid, iid, qty) {
        return new Promise((resolve, reject) => {
            // if (qty.length < itemList.length) reject({ success: false, err: 'quantity array less than items' })

            itemmodel.findOne({ iid: iid }, function (err, foundItem) {
                if (err || functions.isEmpty(foundItem)) {
                    console.log(err);
                    reject({ success: false, err: "error in getting obj" })

                }

                else {
                    cartmodel.findOne({ uuid: uuid, iid: iid }, function (err, foundCart) {
                        if (err)
                            reject({ success: false })
                        else {
                            if (functions.isEmpty(foundCart)) {
                                var ob = {
                                    uuid: uuid,
                                    iid: foundItem.iid,
                                    quantity: parseInt(qty),
                                    image: foundItem.image,
                                    name: foundItem.name,

                                }
                                cartmodel.create(ob, function (err, createdCI) {
                                    if (err)
                                        reject({ err: err, success: false })
                                    else
                                        resolve({ success: true, createdCI })
                                })
                            }
                            else {
                                var ob = {
                                    uuid: uuid,
                                    iid: foundItem.iid,
                                    quantity: parseInt(qty) + foundCart.quantity,
                                    image: foundItem.image,
                                    name: foundItem.name,

                                }
                                cartmodel.findOneAndUpdate({ uuid: uuid, iid: iid }, ob, function (err, createdCI) {
                                    if (err)
                                        reject({ err: err, success: false })
                                    else
                                        resolve({ success: true, createdCI })
                                })
                            }
                        }


                    })

                }

            });


        })



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

    getListingForOrder(uuid, user, code, callback) {
        cartmodel.aggregate([
            { $match: { uuid: uuid } },
            { $lookup: { from: 'items', localField: 'iid', foreignField: 'iid', as: 'item' } },
            {
                $project: {
                    "quantity": "$quantity",
                    "iid": "$iid",
                    "item": { "$arrayElemAt": ["$item", 0] },

                }

            },
            {
                $project: {
                    "price": "$item.price",
                    "name": "$item.name",
                    "sku": "$item.sku",
                    "quantity": "$quantity",
                    "tax": "$item.tax",
                    "iid": "$iid",
                    "item": "$item"
                }
            }
        ]).exec(function (err, cartItem) {
            if (err) {
                console.log(err);
                callback({ success: false })
            }
            else {
                // console.log(cartItem);
                let total = 0
                let cartlist = []
                let allowCOD = true
                let itemArray = []
                var tax = 0;
                if (code.length > 2) {


                    offersModel.findOne({ code: code, active: true, discount: { $gt: 0 } }, function (err, offer) {
                        var di = 0
                        if (err) {
                            di = 0;
                        }
                        else if (functions.isEmpty(offer)) {
                            callback({ success: false, message: 'code invalid' })
                        }
                        else {
                            if (offer.used.includes(uuid)) {
                                callback({ success: false, message: "This code has already been used by you." })
                            }
                            else {
                                var valid = true
                                if (offer.items.length > 0) {

                                    for (var i = 0; i < cartList.length; i++) {
                                        if (offer.items.includes(cartItem[i].iid) == false) {
                                            valid = false
                                            break;
                                        }
                                    }

                                }
                                if (valid == false) {
                                    callback({ success: false, message: 'there are items in your cart on which this code is not applicable' })
                                }
                                else {

                                    if (offer.isPercent) {
                                        di = offer.discount
                                        cartItem.forEach(cartEl => {
                                            var item = {}

                                            item.quantity = cartEl.quantity
                                            item.iid = cartEl.iid
                                            item.name = cartEl.item.name
                                            item.sku = cartEl.sku
                                            item.selling_price = parseInt(cartEl.price * (1 - (di / 100)))

                                            if (cartEl.item.cod == false) allowCOD = false
                                            cartlist.push(item)
                                            itemArray.push(cartEl.item)
                                            var itemprice = cartEl.price * (1 - (di / 100))
                                            var temptax = user.state.toLowerCase() === "jharkand".toLowerCase() ? itemprice * cartEl.quantity * (cartEl.tax / 200)* 2 : itemprice * cartEl.quantity * (cartEl.tax / 100)
                                            tax += temptax
                                            total = total + (itemprice * cartEl.quantity) + temptax
                                        });

                                        if (total <= 0 || cartlist.length == 0) {
                                            callback({ success: false, message: "cant checkout with empty cart" })
                                        }
                                        else
                                            callback({
                                                success: true, cartList: cartlist,
                                                itemArray: itemArray, total: parseInt(total),
                                                allowCOD: allowCOD, tax: tax, code: code,
                                                discount: di, isPercent: true
                                            })
                                    }
                                    else {
                                        di = 0
                                        cartItem.forEach(cartEl => {
                                            var item = {}

                                            item.quantity = cartEl.quantity
                                            item.iid = cartEl.iid
                                            item.name = cartEl.item.name
                                            item.sku = cartEl.sku
                                            item.selling_price = parseInt(cartEl.price * (1 - (di / 100)))

                                            if (cartEl.item.cod == false) allowCOD = false
                                            cartlist.push(item)
                                            itemArray.push(cartEl.item)
                                            var itemprice = cartEl.price * (1 - (di / 100))
                                            var temptax = user.state.toLowerCase() === "jharkand".toLowerCase() ? itemprice * cartEl.quantity * (cartEl.tax / 200) * 2 : itemprice * cartEl.quantity * (cartEl.tax / 100)
                                            tax += temptax
                                            total = total + (itemprice * cartEl.quantity) + temptax
                                        });

                                        if (total <= 0 || cartlist.length == 0) {
                                            callback({ success: false, message: "cant checkout with empty cart" })
                                        }
                                        else
                                            callback({
                                                success: true, cartList: cartlist,
                                                itemArray: itemArray, total: parseInt(total),
                                                allowCOD: allowCOD, tax: tax, code: code,
                                                discount: di, isPercent: false
                                            })
                                    }
                                }
                            }
                        }
                    })
                }
                else {
                    var di = 0
                    cartItem.forEach(cartEl => {
                        var item = {}

                        item.quantity = cartEl.quantity
                        item.iid = cartEl.iid
                        item.name = cartEl.item.name
                        item.sku = cartEl.sku
                        item.selling_price = parseInt(cartEl.price * (1 - (di / 100)))

                        if (cartEl.item.cod == false) allowCOD = false
                        cartlist.push(item)
                        itemArray.push(cartEl.item)
                        var itemprice = cartEl.price * (1 - (di / 100))
                        var temptax = user.state.toLowerCase() === "jharkand".toLowerCase() ? itemprice * cartEl.quantity * (cartEl.tax / 200) * 2 : itemprice * cartEl.quantity * (cartEl.tax / 100)
                        tax += temptax
                        total = total + (itemprice * cartEl.quantity) + temptax
                    });

                    if (total <= 0 || cartlist.length == 0) {
                        callback({ success: false, message: "cant checkout with empty cart" })
                    }
                    else
                        callback({
                            success: true, cartList: cartlist,
                            itemArray: itemArray, total: parseInt(total),
                            allowCOD: allowCOD, tax: tax, code: null,
                            discount: 0, isPercent: false
                        })
                }

            }
        })
    }

    getListingForCheckout(uuid, user, code, callback) {

        cartmodel.aggregate([
            { $match: { uuid: uuid } },
            { $lookup: { from: 'items', localField: 'iid', foreignField: 'iid', as: 'item' } },
            {
                $project: {
                    "quantity": "$quantity",
                    "iid": "$iid",
                    "item": { "$arrayElemAt": ["$item", 0] }
                    , "price": "$item.price",
                    "tax": "$item.tax"
                }
            }
        ]).exec(function (err, cartItem) {
            if (err) {
                console.log(err);
                callback({ success: false, message: 'database error' })
            }
            else {
                // console.log(cartItem);
                if (code.length > 2) {
                    offersModel.findOne({ code: code, active: true, discount: { $gt: 0 } }, function (err, offer) {
                        var di = 0
                        if (err) {
                            di = 0;
                        }
                        else if (functions.isEmpty(offer)) {
                            callback({ success: false, message: 'code invalid' })
                        }
                        else {
                            if (offer.used.includes(uuid)) {
                                callback({ success: false, message: "This code has already been used by you." })
                            }
                            else {
                                var valid = true
                                if (offer.items.length > 0) {

                                    for (var i = 0; i < cartList.length; i++) {
                                        if (offer.items.includes(cartItem[i].iid) == false) {
                                            valid = false
                                            break;
                                        }
                                    }

                                }
                                if (valid == false) {
                                    callback({ success: false, message: 'there are items in your cart on which this code is not applicable' })
                                }
                                else {

                                    if (offer.isPercent) {
                                        di = offer.discount
                                        let total = 0
                                        let allowCOD = true
                                        var tax = 0
                                        cartItem.forEach(cartEl => {
                                            if (cartEl.item.cod == false) allowCOD = false
                                            var itemprice = cartEl.price[0] * (1 - (di / 100));
                                            console.log("items price",itemprice);
                                            var temptax = user.state.toLowerCase() === "jharkand".toLowerCase() ? itemprice * cartEl.quantity * (cartEl.tax[0] / 200) * 2 : itemprice * cartEl.quantity * (cartEl.tax[0] / 100)
                                            console.log("temptax",temptax);
                                            tax += temptax
                                            total = total + (itemprice * cartEl.quantity) + temptax
                                            console.log("tot",total);
                                            // total = total + parseInt((parseInt(cartEl.price[0]) * cartEl.quantity))
                                        });
                                        // console.log({ success: true, cartList: cartItem, total: total, codAllowed: allowCOD, tax: tax });
                                        if (total <= 0) {
                                            callback({ success: false, message: "cant checkout with empty cart" })
                                        }
                                        else
                                            callback({ success: true, cartList: cartItem, total: parseInt(total), codAllowed: allowCOD, tax: tax, code: code, discount: di, isPercent: true })
                                    }
                                    else {
                                        di = 0
                                        let total = 0
                                        let allowCOD = true
                                        var tax = 0
                                        cartItem.forEach(cartEl => {
                                            if (cartEl.item.cod == false) allowCOD = false
                                            var itemprice = cartEl.price[0]* (1 - (di / 100));
                                            var temptax = user.state.toLowerCase() === "jharkand".toLowerCase() ? itemprice * cartEl.quantity * (cartEl.tax[0] / 200) * 2 : itemprice * cartEl.quantity * (cartEl.tax[0] / 100)
                                            tax += temptax
                                            total = total + (itemprice * cartEl.quantity) + temptax

                                        });
                                        // console.log({ success: true, cartList: cartItem, total: total, codAllowed: allowCOD, tax: tax });
                                        if (total <= 0) {
                                            callback({ success: false, message: "cant checkout with empty cart" })
                                        }
                                        else
                                            callback({ success: true, cartList: cartItem, total: parseInt(total), codAllowed: allowCOD, tax: tax, code: code, discount: di, isPercent: false })
                                    }


                                }
                            }


                        }

                    })
                } else {
                    var di = 0
                    let total = 0
                    let allowCOD = true
                    var tax = 0
                    cartItem.forEach(cartEl => {
                        if (cartEl.item.cod == false) allowCOD = false
                        var itemprice = cartEl.price[0] * (1 - (di / 100));
                        var temptax = user.state.toLowerCase() === "jharkand".toLowerCase() ? itemprice * cartEl.quantity * (cartEl.tax[0] / 200) * 2 : itemprice * cartEl.quantity * (cartEl.tax[0] / 100)
                        tax += temptax
                        total = total + (itemprice * cartEl.quantity) + temptax

                    });
                    console.log({ success: true, cartList: cartItem, total: total, codAllowed: allowCOD, tax: tax });
                    if (total <= 0) {
                        callback({ success: false, message: "cant checkout with empty cart" })
                    }
                    else
                        callback({ success: true, cartList: cartItem, total:parseInt(total), codAllowed: allowCOD, tax: tax, code: null, discount: 0, isPercent: false })

                }


            }
        })

    }

    getItemForList(iid, qty, uuid) {
        return new Promise((resolve, reject) => {
            itemmodel.findOne({ iid: iid }, function (err, foundItem) {
                if (err)
                    reject({ success: false, item: {} })
                else {
                    var itemdata = {
                        itemID: foundItem.iid,
                        itemName: foundItem.name,
                        quantity: parseInt(qty),
                        price: foundItem.price,
                        image: foundItem.image,
                        uuid: uuid,
                        item: foundItem,
                        tax: foundItem.tax
                    }
                    resolve(itemdata)
                }
            })
        })
    }

}
module.exports = new cart()
