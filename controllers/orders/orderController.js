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

exports.checkUserOrder = function (req, res) {

    orderServices.checkOrderDetails(req.params.orderId, function (foundOrder) {
        if (foundOrder.success == false || foundOrder.found == false) {
            req.flash('error', 'error in getting order details')
            res.redirect('/')
        }
        else {
            if (foundOrder.order.uuid === req.user.uuid) {

                var promiseArr = []
                foundOrder.order.orderedItems.forEach(element => {
                    promiseArr.push(orderServices.getItemForOrderList(element.iid, element.quantity))
                });
                Promise.all(promiseArr).then(result => {
                    res.render('userOrder', { success: true, found: true, order: foundOrder.order, Olist: result })
                }).catch(errors => {
                    res.render('userOrder', { success: false, found: true, order: foundOrder.order, Olist: errors })
                })
            }
            else {
                req.flash('error', 'unauthorized')
                res.redirect('/')
            }

        }

    })

}

exports.cancelOrder = function (req, res) {
    orderServices.cancelOrder(req.params.orderId, function (canceled) {
        if (canceled.success == false) {
            req.flash('error', 'error in creating Cancellation.please check cancelled requests')
            res.redirect('/')
        }
        else {
            req.flash('success', 'cancellation requested')
            res.redirect('/')
        }
    })
}

exports.userCancellationList = function (req, res) {
    orderServices.getCancellationsForUser(req.user.uuid, function (cancellations) {
        if (cancellations.success == false) {
            req.flash('error', 'error in fetching list')
            res.redirect('/')
        }
        else {
            res.render('userCancelList', { cancellations: cancellations })
        }
    })
}

exports.fetchCancellationById = function (req, res) {

    orderServices.getCancellationById(req.params.id, function (cancellations) {
        if (cancellations.success == false) {
            req.flash('error', 'error in data')
            res.redirect('/')
        }
        else {
            res.render('cancellationDetail', { cancellations: cancellations })
        }
    })
}

exports.getCancellationByIdAdmin = function (req, res) {

    orderServices.getCancellationById(req.params.id, function (cancellations) {
        if (cancellations.success == false) {
            req.flash('error', 'error in data')
            res.redirect('/')
        }
        else {
            res.render('cancellationDetailAdmin', { cancellations: cancellations })
        }
    })
}

exports.getAllCancellations = function (req, res) {

    orderServices.getAllCancellations(function (cancellations) {
        if (cancellations.success == false) {
            req.flash('error', 'error in fetching list')
            res.redirect('/')
        }
        else {
            res.render('adminCancelList', { cancellations: cancellations })
        }
    })
}

exports.getCancellationsByStatus = function (req, res) {

    orderServices.getCancellationByStatus(req.params.status, function (cancellations) {
        if (cancellations.success == false) {
            req.flash('error', 'error in fetching list')
            res.redirect('/')
        }
        else {
            res.render('adminCancelList', { cancellations: cancellations })
        }
    })
}

exports.getConfirmCancellation = function (req, res) {
    res.render('adminConfCancel', { cancellationId: req.params.cancellationId })
}

exports.postConfirmCancellation = function (req, res) {
    orderServices.acceptCancellation(req.params.cancellationId, req.body.transaction_id, function (cancelled) {
        if (cancelled.success == false) {
            req.flash('error', 'error in cancelling')
            res.redirect('/admin/cancels-filter')
        }
        else {

            req.flash('success', 'success')
            res.redirect('/admin/cancels-filter')
        }
    })
}

exports.getConfirmOrder = function (req, res) {
    res.render('confirmOrderAdmin', { orderId: req.params.orderId })
}

exports.confirmOrder = function (req, res) {
    var d = {
        shipmentStatus: 'approved',
        shipmentConfirmed: true,
        length: req.body.length,
        breadth: req.body.breadth,
        height: req.body.height,
        width: req.body.width,
        shipRocketId: req.body.shipRocketId
    }
    orderServices.acceptOrder(req.params.orderId, d, function (order) {
        if (order.success == false) {
            req.flash('error', 'error')
            res.redirect('/admin/orders-filter')
        }
        else {
            req.flash('success', 'success')
            res.redirect('/admin/orders-filter')
        }
    })
}

exports.getOrderByShipStatus = function (req, res) {
    orderServices.getOrderByShipment(req.params.shipment, function (foundOrder) {
        if (foundOrder.success == false) {
            req.flash('error', 'error')
            res.redirect('/admin/orders-filter')
        }
        else {
            res.render('adminOrders', { orders: foundOrder.order })
        }
    })
}

exports.getAllOrders = function (req, res) {
    orderServices.getAllOrders(function (foundOrder) {
        if (foundOrder.success == false) {
            req.flash('error', 'error')
            res.redirect('/admin/orders-filter')
        }
        else {
            res.render('adminOrders', { orders: foundOrder.order })
        }
    })
}

exports.getOrderByPayment = function (req, res) {
    orderServices.getOrderByPayment(req.params.payment, function (foundOrder) {
        if (foundOrder.success == false) {
            req.flash('error', 'error')
            res.redirect('/admin/orders-filter')
        }
        else {
            res.render('adminOrders', { orders: foundOrder.order })
        }
    })
}

exports.adminCheckOrder = function (req, res) {
    orderServices.checkOrderDetails(req.params.orderId, function (foundOrder) {
        if (foundOrder.success == false || foundOrder.found == false) {
            req.flash('error', 'error in getting order details')
            res.redirect('/')
        }
        else {


            var promiseArr = []
            foundOrder.order.orderedItems.forEach(element => {
                promiseArr.push(orderServices.getItemForOrderList(element.iid, element.quantity))
            });
            Promise.all(promiseArr).then(result => {
                res.render('adminCheckOrder', { success: true, found: true, order: foundOrder.order, Olist: result })
            }).catch(errors => {
                res.render('adminCheckOrder', { success: false, found: true, order: foundOrder.order, Olist: errors })
            })



        }

    })
}

exports.userOrderList = function (req, res) {
    orderServices.getOrderByUUID(req.user.uuid, function (foundOrder) {
        if (foundOrder.success == false) {
            req.flash('error', 'error in getting list')
            res.redirect('/')
        } else {
            res.render('oListUser', { order: foundOrder.order })
        }
    })

}

exports.authorizeOrder=function(req,res)
{
    orderServices.authorizeOrder(req.params.orderId,function(updated){
        if(updated.success==false)
        req.flash('error','error')
        res.redirect('/admin/items')
    })
}

exports.setShipmentStatus=function(req,res)
{
    orderServices.setShipStatus(req.params.orderId,req.params.st,function(updated){
        if(updated.success==false)
        req.flash('error','error')
        res.redirect('/admin/items')
    })
}