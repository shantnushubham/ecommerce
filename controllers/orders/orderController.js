const cartServices = require('../../openServices/cart')
const express = require('express')
const router = express()
const orderServices = require('../../openServices/order')
const { ensureAuthenticated, forwardAuthenticated } = require('../../Middlewares/user/middleware');
require('dotenv').config()
const envData = process.env

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
                    res.render('checkout', { total: cart.total, cart: cart.cartList, address: address })
                }
            })
        }
    })
}

exports.postCheckout = function (req, res) {
    // console.log('enter');
    console.log(req.body);
    cartServices.getListingForOrder(req.user.uuid, function (cart) {//get total and cart items
        if (cart.success == false) {
            console.log('error in getting cart list');
            req.flash('error', 'error in getting cart list')
            res.redirect('/cartpage')
        }
        else {
            orderServices.findAddressByid(req.body.address, function (address) {//get address of user
                if (address.success == false) {
                    console.log('error in getting address list');
                    req.flash('error', 'error in getting address list')
                    res.redirect('/cartpage')
                }
                else {
                    // console.log('cartobj=',cart);
                    console.log('address=');
                    // console.log(address.address);
                    var userAdd = address.address
                    var finalAmt = cart.total
                    if (req.body.code && req.body.code != req.user.code && req.body.code != 'invalid')//check if code is valid
                    {
                        orderServices.checkIfCodeUsed(req.body.code, req.user.uuid, function (codeallow) {//check if user is allowed to use code
                            if (codeallow.success == false) {
                                req.flash('error', 'error in checking offer code')
                                res.redirect('/cartpage')
                            }
                            else {
                                if (codeallow.allow == true)//allowed user
                                {
                                    orderServices.getDiscountForCode(req.body.code, function (disc) {//get discount amount

                                        if (disc.success)
                                            finalAmt = finalAmt * (1 - disc.discount)

                                        var order = {
                                            fullAddress: userAdd.fullAddress,
                                            city: userAdd.city,
                                            state: userAdd.state,
                                            country: userAdd.country,
                                            pincode: userAdd.pincode,
                                            total: finalAmt,
                                            orderedItems: cart.cartList,
                                            uuid: req.user.uuid,
                                            code: disc.code
                                        }
                                        console.log(order);
                                        orderServices.createOrder(order, function (createOrder) {//create total order
                                            if (createOrder.success == false) {
                                                console.log('error in creating order');
                                                req.flash('error', 'error in creating order')
                                                res.redirect('/cartpage')
                                            }
                                            else {
                                                // console.log('success');
                                                res.redirect('/order/' + createOrder.order.orderId + '/payment')
                                            }
                                        })
                                    })
                                }
                                else {
                                    var order = {
                                        fullAddress: userAdd.fullAddress,
                                        city: userAdd.city,
                                        state: userAdd.state,
                                        country: userAdd.country,
                                        pincode: userAdd.pincode,
                                        total: finalAmt,
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
                    else {
                        var order = {
                            fullAddress: userAdd.fullAddress,
                            city: userAdd.city,
                            state: userAdd.state,
                            country: userAdd.country,
                            pincode: userAdd.pincode,
                            total: finalAmt,
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

exports.getUserRefcode = function (req, res) {
    orderServices.createVoucherCode(5, 5, true, 0, function (updatedCode) {
        console.log("**");
        console.log(updatedCode);
        res.redirect('/');
    })
}

exports.getdealCode = function (req, res) {
    res.render('offerGenerator')
}

exports.postDealCode = function (req, res) {
    orderServices.createVoucherCode(5, 5, false, req.body.discount, function (updatedCode) {
        console.log("**");
        console.log(updatedCode);
        res.render('offerGenerator', { code: updatedCode });
    })
}

exports.getDiscountCodeList = function (req, res) {
    orderServices.getDiscountListing(function (foundcodes) {
        if (foundcodes.success == false) {
            req.flash('error', 'could not get listing for discount codes')
            res.redirect('/admin')
        }
        else {
            console.log(foundcodes.codelist);
            res.render('discountListing', { codeArray: foundcodes.codelist })
        }
    })
}

exports.checkUserOrder=function(req,res)
{
    
orderServices.checkOrderDetails(req.params.orderId,function(foundOrder){
    if(foundOrder.success==false||foundOrder.found==false)
    {
        req.flash('error','error in getting order details')
        res.redirect('/')
    }
    else
    {
        var promiseArr=[]
        foundOrder.order.orderedItems.forEach(element => {
            promiseArr.push(orderServices.getItemForOrderList(element.iid,element.quantity))
        });
        Promise.all(promiseArr).then(result=>{
            res.send({ success: true, found: true, order: foundOrder.order, Olist:result })
        }).catch(errors=>{
            res.send({ success: false, found: true, order: foundOrder.order,Olist:errors })
        })
    }

})

}