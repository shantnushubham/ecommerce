const cartServices = require('../../openServices/cart')
const codaAllow = require('../../models/Orders/codAllow')
const express = require('express')
const router = express()
const orderServices = require('../../openServices/order')
const { ensureAuthenticated, forwardAuthenticated } = require('../../Middlewares/user/middleware');
require('dotenv').config()
const envData = process.env
const url = require('url')

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

exports.creditPath = function (req, res) {
    orderServices.findOrderById(req.params.orderId, req.user.uuid, function (foundOrder) {
        if (foundOrder.success == false) {
            req.flash('error', 'trouble in payment')
            res.redirect('/cartpage')
        }
        else {
            if (foundOrder.found == false) {
                req.flash('error', 'could not find order by that id')
                res.redirect('/cartpage')
            }
            else {
                if (foundOrder.order.creditAllowed == false) {
                    req.flash('error', 'error! credit not allowed by admin')
                    res.redirect('/')
                }
                else {
                    // var total = foundOrder.order.total * (1 - (foundOrder.order.creditPercent/100))
                    orderServices.creditOrderUpdate(foundOrder.order.orderId, req.user.uuid, function (updatedOrder) {
                        if (updatedOrder.success == false) {

                            req.flash('error', 'error! credit path error')
                            res.redirect('/')
                        }
                        else {
                            res.redirect('/order/' + updatedOrder.order.orderId + '/payment')
                        }
                    })

                }
            }
        }
    })

}

exports.codPath = function (req, res) {
    console.log(req.body);
    cartServices.getListingForOrder(req.user.uuid, function (cart) {//get total and cart items
        if (cart.success == false) {
            console.log('error in getting cart list');
            req.flash('error', 'error in getting cart list')
            res.redirect('/cartpage')
        }
        else {
            codaAllow.find({}, function (err, foundThres) {
                var cod = false
                if (!err && foundThres.length >= 1 && cart.allowCOD == true) {
                    if (cart.total < foundThres[0].from) {
                        req.flash('error', 'cod not allowed')
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
                                var userAdd = address.address
                                var finalAmt = cart.total
                                var order = {
                                    fullAddress: userAdd.fullAddress,
                                    city: userAdd.city,
                                    state: userAdd.state,
                                    country: userAdd.country,
                                    pincode: userAdd.pincode,
                                    total: finalAmt * 1.18,
                                    orderedItems: cart.cartList,
                                    uuid: req.user.uuid,
                                    paymentType: 'COD',
                                    codAllowed: true
                                }
                                orderServices.createOrder(order, function (createOrder) {
                                    if (createOrder.success == false) {
                                        console.log('error in creating order');
                                        req.flash('error', 'error in creating order')
                                        res.redirect('/cartpage')
                                    }
                                    else {
                                        res.render('successPage', { order: createOrder.order })
                                    }
                                })

                            }
                        })
                    }
                }
                else {
                    req.flash('error', 'COD not possible')
                    res.redirect('/')
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
                    console.log({ success: true, found: true, order: foundOrder.order, Olist: result })
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
            res.render('userCancelList', { cancellations: cancellations.cancelReq })
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
            res.render('adminCancelList', { cancellations: cancellations.cancelReq })
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
        weight: req.body.weight,
        shipRocketId: req.body.shipRocketId,
        paid: true,
        status: 'authorized'

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

exports.getAllowCred = function (req, res) {
    res.render('allowCred', { orderId: req.params.orderId })
}
exports.allowCred = function (req, res) {
    orderServices.allowCredit(req.params.orderId, req.body.percent, function (order) {
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

exports.saveOrder = function (req, res) {
    cartServices.getListingForOrder(req.user.uuid, function (cart) {//get total and cart items
        if (cart.success == false) {
            console.log('error in getting cart list');
            req.flash('error', 'error in getting cart list')
            res.redirect('/cartpage')
        }
        else {
            codaAllow.find({}, function (err, foundThres) {
                var cod = true

                if (!err && foundThres.length >= 1 && cart.allowCOD == true) {
                    if (cart.total < foundThres[0].from) {
                        cod = false
                    }
                }

                orderServices.findAddressByid(req.body.address, function (address) {//get address of user
                    if (address.success == false) {
                        console.log('error in getting address list');
                        req.flash('error', 'error in getting address list')
                        res.redirect('/cartpage')
                    }
                    else {
                        var userAdd = address.address
                        var finalAmt = cart.total
                        var order = {
                            fullAddress: userAdd.fullAddress,
                            city: userAdd.city,
                            state: userAdd.state,
                            country: userAdd.country,
                            pincode: userAdd.pincode,
                            total: finalAmt,
                            orderedItems: cart.cartList,
                            uuid: req.user.uuid,
                            paymentType: 'online',
                            codAllowed: cod,
                            shipmentStatus: 'saved'
                        }
                        orderServices.createOrder(order, function (createOrder) {
                            if (createOrder.success == false) {
                                console.log('error in creating order');
                                req.flash('error', 'error in creating order')
                                res.redirect('/cartpage')
                            }
                            else {
                                res.rediect('/saved-orders')
                            }
                        })

                    }
                })




            })

        }
    })

}

exports.savedToCod = function (req, res) {
    orderServices.findOrderById(req.params.orderId, req.user.uuid, function (foundCod) {
        if (foundCod.success == false) {

        }
        else {
            codaAllow.find({}, function (err, foundThres) {
                if (!err && foundThres.length >= 1 && foundCod.order.allowCOD == true) {
                    if (foundCod.order.total < foundThres[0].from) {
                        req.flash('error', 'COD not allowed')
                        res.rediect('/saved-orders')
                    }
                    else {
                        orderServices.updateOrderDoc(req.params.orderId, { paymentType: 'COD', shipmentStatus: 'processing', total: parseInt(foundCod.order.total) * 1.18 }, function (updatedOrder) {
                            if (updatedOrder.success == false) {
                                req.flash('error', 'error in processing order')
                                res.rediect('/saved-orders')
                            }
                            else {
                                req.session.mode = ''
                                res.render('successPage', { order: updatedOrder.order })
                            }
                        })
                    }
                }
                else {
                    req.flash('error', 'error in processing order')
                    res.rediect('/saved-orders')
                }

            })
        }
    })

  
}

exports.savedToCredit = function (req, res) {
    orderServices.findOrderById(req.params.orderId,req.user.uuid,function(foundOrder){
        if(foundOrder.success==false)
        {
            req.flash('error', 'error in processing order')
            res.rediect('/saved-orders')
        }
        else
        {
            if(foundOrder.order.creditAllowed==false)
            {
                req.flash('error', 'credit not allowed')
                res.rediect('/saved-orders')
            }
            else
            {
                orderServices.updateOrderDoc(req.params.orderId, { paymentType: 'credit', shipmentStatus: 'processing' }, function (updatedOrder) {
                    if (updatedOrder.success == false) {
                        req.flash('error', 'error in processing order')
                        res.rediect('/saved-orders')
                    }
                    else {
                        req.session.mode = 'credit'
                        res.rediect('/order/' + updatedOrder.order.orderId + '/payment')
                    }
                })
            }
        }
    })
   
}
exports.savedToPay = function (req, res) {
    orderServices.updateOrderDoc(req.params.orderId, { paymentType: 'online', shipmentStatus: 'processing' }, function (updatedOrder) {
        if (updatedOrder.success == false) {
            req.flash('error', 'error in processing order')
            res.rediect('/saved-orders')
        }
        else {
            req.session.mode = ''
            res.rediect('/order/' + updatedOrder.order.orderId + '/payment')
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

exports.authorizeOrder = function (req, res) {
    orderServices.authorizeOrder(req.params.orderId, function (updated) {
        if (updated.success == false)
            req.flash('error', 'error')
        res.redirect('/admin/items')
    })
}

exports.setShipmentStatus = function (req, res) {
    orderServices.setShipStatus(req.params.orderId, req.params.st, function (updated) {
        if (updated.success == false)
            req.flash('error', 'error')
        res.redirect('/admin/items')
    })
}