const cartServices = require('../../openServices/cart')
const express = require('express')
const router = express()
const orderServices = require('../../openServices/order')
const { ensureAuthenticated, forwardAuthenticated } = require('../../Middlewares/user/middleware');
require('dotenv').config()
const envData=process.env

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
                    res.render('checkout', { total:cart.total,cart: cart.cartList, address: address }) 
                }
            })
        }
    })
}

exports.postCheckout = function (req, res) {
    // console.log('enter');
    console.log(req.body);
    cartServices.getListingForOrder(req.user.uuid, function (cart) {
        if (cart.success == false) {
            console.log('error in getting cart list');
            req.flash('error', 'error in getting cart list')
            res.redirect('/cartpage')
        }
        else {
            orderServices.findAddressByid(req.body.address, function (address) {
                if (address.success == false) {
                    console.log('error in getting address list');
                    req.flash('error', 'error in getting address list')
                    res.redirect('/cartpage')
                }
                else {
                    console.log('address=');
                    // console.log(address.address);
                    var userAdd = address.address
                    var finalAmt=cart.total
                    if(req.body.code)
                    {
                        orderServices.getDiscountForCode(req.body.code,function(disc){
                            finalAmt=finalAmt*(1-disc.discount)
                            var order = {
                                fullAddress: userAdd.fullAddress,
                                city: userAdd.city,
                                state: userAdd.state,
                                country: userAdd.country,
                                pincode: userAdd.pincode,
                                total: cart.finalAmt,
                                orderedItems: cart.cartList,
                                uuid: req.user.uuid
                            }
                            console.log(order);
                            orderServices.createOrder(order, function (createOrder) {
                                if (createOrder.success == false) {
                                    console.log('error in creating order');
                                    req.flash('error', 'error in creating order')
                                    res.redirect('/cartpage')
                                }
                                else {
                                    console.log('success');
                                    res.redirect('/order/' + createOrder.order.orderId + '/payment')
                                }
                            })
                        })
                    }
                    else
                    {
                        var order = {
                            fullAddress: userAdd.fullAddress,
                            city: userAdd.city,
                            state: userAdd.state,
                            country: userAdd.country,
                            pincode: userAdd.pincode,
                            total: cart.finalAmt,
                            orderedItems: cart.cartList,
                            uuid: req.user.uuid
                        }
                        console.log(order);
                        orderServices.createOrder(order, function (createOrder) {
                            if (createOrder.success == false) {
                                console.log('error in creating order');
                                req.flash('error', 'error in creating order')
                                res.redirect('/cartpage')
                            }
                            else {
                                console.log('success');
                                res.redirect('/order/' + createOrder.order.orderId + '/payment')
                            }
                        })
                    }

                    

                }
            })
        }
    })

}

exports.getUserRefcode=function(req,res)
{
    orderServices.createVoucherCode(5,5,true,0,function(updatedCode){
       console.log("**");
        console.log(updatedCode);
       res.redirect('/');
    })
}

exports.getdealCode=function(req,res)
{
    orderServices.createVoucherCode(5,5,false,0.55,function(updatedCode){
        console.log("**");
         console.log(updatedCode);
        res.redirect('/');
     })
}