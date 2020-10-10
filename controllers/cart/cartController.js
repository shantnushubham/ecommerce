var itemMetaModel = require("../../models/Items/ItemMetadata")
var itemmodel = require('../../models/Items/Items')
var cartmodel = require('../../models/cart/cart')
var cartservices = require('../../openServices/cart')
var mongoose = require("mongoose")
var middleware = require('../../Middlewares/common/functions')
var async = require('async')

//get items from cart
exports.getAllItems = function (req, res) {
    console.log('user=' + req.user);
    console.log('body=' + req.body);

    cartmodel.aggregate([
        { $match: { uuid: req.user.uuid } },
        { $lookup: { from: 'items', localField: 'iid', foreignField: 'iid', as: 'item' } },
        {
            $project: {
                "quantity": "$quantity",
                "uuid": "$uuid",
                "item": { "$arrayElemAt": ["$item", 0] }
            }
        }]).exec(function (err, found) {
            if (err) {
                console.log(err);
                req.flash('error', 'error in fetching cart')
                res.redirect('/items')
            }
            else {
                var codAllowed=true
                for(var i=0;i<found.length;i++)
                {
                    if(found[i].item.cod==false)
                    {
                        codAllowed=false
                        break
                    }
                }
                res.render('cartpage', { cart: found, codAllowed:codAllowed })
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
                cartservices.addToCart(founditem.iid, req.user.uuid, req.body.quantity, function (addedCart) {
                    if (addedCart.success == false) {
                        console.log(addedCart.message);
                        req.flash('error', addedCart.message)
                        res.redirect('/items')
                    }
                    else {
                        console.log('success');
                        req.flash('success', 'added to cart')
                        res.redirect('/cartPage')
                    }
                })
            }
        }
    })


}

//call logger?

//update count of item
exports.getUpdateCart = function (req, res) {
    console.log('getting cart');
    var cartlisting = []
    cartservices.getUserCartItems(req.user.uuid, function (cartitem) {
        if (cartitem.success == false) {
            req.flash('error', 'error in fetching cart')
            res.render('cartpage', { cart: cartlisting })
        }
        else {
            cartitem.items.forEach(element => {
                itemmodel.findOne({ iid: element.iid }, function (err, founditem) {
                    if (err) {
                        req.flash('error', 'error in fetching cart')
                        res.render('cartpage', { cart: cartlisting })
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
    
}

exports.updateCart = function (req, res) {
    var errolist = []
    console.log(req.body);
    var errorFlag = false
    var cart = req.body
    var ids = Object.keys(cart)
    console.log(ids);

    var promiseArr = []
    ids.forEach(obj => promiseArr.push(cartservices.updateCart(obj, req.user.uuid, cart[obj])));

    Promise.all(promiseArr).then((respo) => {
        console.log('updated');
        console.log(respo);
        res.redirect('/cartpage')
    }).catch(err => {
        console.log(err);
        res.redirect('/cartpage')
    })
    // res.redirect('/cartpage');



}
//clear cart
exports.clearCart = function (req, res) {

    cartservices.clearCart(req.user.uuid, function (updatedCart) {
        if (updatedCart.success == false) {
            req.flash('error', 'error in clearing cart. please try again')
            res.redirect('/cartpage')
        }
        else {
            res.redirect('/cartpage')
        }
    })
}

exports.addManyToCart = function (req, res) {
    console.log(req.body);
    var promiseArr = []
    for (var i = 0; i < req.body.iid.length; i++) {
        promiseArr.push(cartservices.addManyToCart('5iIinrQCH', req.body.iid[i], req.body.qty[i]))

    }
    Promise.all(promiseArr).then(result => {
        req.flash('success','added all to cart')
        res.redirect('/items/' + req.params.iid)

    }).catch(errors => {
        req.flash('error','error in one or more items in cart.Please check')
        res.redirect('/items/' + req.params.iid)


    })


}
exports.verify = function (req, res) {
    console.log('user=' + req.user);
    cartservices.getListingForCheckout(req.user.uuid, function (resp) {
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
