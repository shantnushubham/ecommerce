const cartServices = require('../../openServices/cart')
const express = require('express')
const router = express()
const orderServices = require('../../openServices/order')
const { ensureAuthenticated, forwardAuthenticated } = require('../../Middlewares/user/middleware');

exports.checkout = function (req, res) {
    cartServices.getListingForOrder(req.user.uuid, function (cart) {
        if (cart.success == false) {
            req.flash('error', 'empty cart!')
            res.redirect('/cartpage')
        }
        else {
            orderServices.createOrder(cart.cartList, cart.total, req.user.uuid, function (createdOrder) {
                if (createOrder.success == false) {
                    req.flash('error', 'trouble in creating order')
                    res.redirect('/cartpage')
                }
                else
                {
                 res.render('checkout',{order:createdOrder.order})   
                }
            })
        }
    })
}