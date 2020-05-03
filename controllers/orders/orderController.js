const cartServices = require('../../openServices/cart')
const express = require('express')
const router = express()
const orderServices = require('../../openServices/order')
const { ensureAuthenticated, forwardAuthenticated } = require('../../Middlewares/user/middleware');

exports.getCheckout = function (req, res) {

    cartServices.getListingForCheckout(req.user.uuid, function (cart) {
        if (cart.success == false) {
            req.flash('error', 'empty cart!')
            res.redirect('/cartpage')
        }
        else {
            console.log('here');
            orderServices.getUserAddress(req.user.uuid, function (address) {
                if (address.success == false) {
                    req.flash('error', 'error in getting address list')
                    res.redirect('/cartpage')
                }
                else {
                    res.render('checkout', { cart: cart.cartList, address: address })
                }
            })
        }
    })
}

exports.postCheckout = function (req, res) {
    cartServices.getListingForOrder(req.user.uuid, function (cart) {
        if (cart.success == false) {
            req.flash('error', 'error in getting cart list')
            res.redirect('/cartpage')
        }
        else {
            orderServices.findAddressByid(req.body.address, function (address) {
                if (address.success == false) {
                    req.flash('error', 'error in getting address list')
                    res.redirect('/cartpage')
                }
                else {
                    var userAdd = address.address
                    var order = {
                        fullAddress: userAdd.fullAddress,
                        city: userAdd.city,
                        state: userAdd.state,
                        country: userAdd.country,
                        pincode: userAdd.pincode,
                        total: cart.total,
                        orderedItems: cart.cartList,
                        uuid: req.user.uuid
                    }
                    orderServices.createOrder(order, function (createOrder) {
                        if (createOrder.success == false) {
                            req.flash('error', 'error in creating order')
                            res.redirect('/cartpage')
                        }
                        else {
                            res.redirect('/order/' + createOrder.order.orderId + '/payment')
                        }
                    })

                }
            })
        }
    })

}