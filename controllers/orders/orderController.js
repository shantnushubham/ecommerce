const cartServices = require('../../openServices/cart')
const codaAllow = require('../../models/Orders/codAllow')
const express = require('express')
const router = express()
const orderServices = require('../../openServices/order')
const { ensureAuthenticated, forwardAuthenticated } = require('../../Middlewares/user/middleware');
const mailer = require('../common/Mailer')
require('dotenv').config()
const envData = process.env
const url = require('url')
const itemServices = require("../../openServices/items")
const order = require('../../openServices/order')
const userModel = require('../../models/User/User')
const fee = require('../../models/Orders/extraFee')
const functions = require('../../Middlewares/common/functions')

exports.getCheckout = function (req, res) {
    var code = ""
    if (req.body.code && req.body.code.length > 2)
        code = req.body.code
    else
        code = ""
    cartServices.getListingForCheckout(req.user.uuid, req.user, code, function (cart) {
        if (cart.success == false) {
            req.flash('error', cart.message)
            req.session.save(function () { res.redirect('/cartpage'); })
            // res.redirect('/cartpage')
        }
        else {
            console.log('here');
            orderServices.getUserAddress(req.user.uuid, function (address) {
                if (address.success == false) {
                    req.flash('error', 'error in getting address list')
                    res.redirect('/cartpage')
                }
                else {
                    fee.findOne({ name: "convenience", active: true }, function (err, foundFee) {
                        var extra = 0
                        if (err || functions.isEmpty(foundFee))
                            extra = 0
                        else {
                            extra = foundFee.charge
                        }
                        console.log({
                            total: cart.total, cart: cart.cartList,
                            address: address, codAllowed: cart.codAllowed, tax: cart.tax,
                            fee: extra, code: cart.code, discount: cart.discount,
                            percent: cart.isPercent
                        })
                        res.render('checkout', {
                            total: cart.total, cart: cart.cartList,
                            address: address, codAllowed: cart.codAllowed, tax: cart.tax,
                            fee: extra, code: cart.code, discount: cart.discount,
                            percent: cart.isPercent
                        })


                    })
                }
            })
        }
    })
}

exports.postCheckout = function (req, res) {

    var code = ""
    if (req.body.offer && req.body.offer.length > 2)
        code = req.body.offer
    else
        code = ""
    cartServices.getListingForOrder(req.user.uuid, req.user, code, function (cart) {//get total and cart items
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
                    fee.findOne({ name: "convenience", active: true }, function (err, foundFee) {
                        var extra = 0
                        if (err || functions.isEmpty(foundFee))
                            extra = 0
                        else {
                            extra = foundFee.charge
                        }
                        console.log('address=');

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
                            tax: cart.tax
                        }


                        order["total"] = order["total"] + extra
                        if (req.body.code && req.body.code.length > 0 && cart.code != null && cart.discount > 0) {
                            order["offerUsed"] = true
                            order["offerCode"] = req.body.offer
                        }
                        // console.log("order Details=", order);
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
            })
        }
    })

}

exports.creditPath = function (req, res) {
    console.log("credit=", req.body);

    if ((req.user.isBusiness == true && req.user.premium == false) ||
        (req.user.isBusiness == false && req.user.creditAllowed == false) ||
        (req.user.credPerc == 0 || req.user.credBalance == 0)) {

        req.flash('error', 'credit not allowed. For Further details please contact customer service.')
        res.redirect('/cartpage')
    }
    else {
        var code = ""
        if (req.body.offer && req.body.offer.length > 2)
            code = req.body.offer
        else
            code = ""
        cartServices.getListingForOrder(req.user.uuid, req.user, code, function (cart) {//get total and cart items
            if (cart.success == false) {
                console.log('error in getting cart list');
                req.flash('error', 'error in getting cart list')
                res.redirect('/cartpage')
            }
            else {
                codaAllow.find({}, function (err, foundThres) {
                    var cod = true
                    var credA = false;
                    var credPerc = 0;

                    if (((req.user.isBusiness == true && req.user.premium == true) ||
                        (req.user.isBusiness == false && req.user.creditAllowed == true)) &&
                        (req.user.credPerc > 0 && req.user.credBalance >= cart.total)) {
                        if (!err && foundThres.length >= 1 && cart.allowCOD == true) {
                            if (cart.total < foundThres[0].from) {
                                cod = false
                            }
                        }
                        credA = true
                        credPerc = req.user.credPerc

                        orderServices.findAddressByid(req.body.address, function (address) {//get address of user
                            if (address.success == false) {
                                console.log('error in getting address list');
                                req.flash('error', 'error in getting address list')
                                res.redirect('/cartpage')
                            }
                            else {
                                fee.findOne({ name: "convenience", active: true }, function (err, foundFee) {
                                    var extra = 0
                                    if (err || functions.isEmpty(foundFee))
                                        extra = 0
                                    else {
                                        extra = foundFee.charge
                                    }

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
                                        paymentType: 'credit',
                                        codAllowed: cod,
                                        shipmentStatus: 'processing',
                                        creditAllowed: credA,
                                        creditPercent: credPerc,
                                        tax: cart.tax
                                    }



                                    order["total"] = order["total"] + extra
                                    if (req.body.code && req.body.code.length > 0 && cart.code != null && cart.discount > 0) {
                                        order["offerUsed"] = true
                                        order["offerCode"] = req.body.offer
                                    }
                                    orderServices.createOrder(order, function (createOrder) {
                                        if (createOrder.success == false) {
                                            console.log('error in creating order');
                                            req.flash('error', 'error in creating order')
                                            res.redirect('/cartpage')
                                        }
                                        else {
                                            req.session.mode = 'credit'
                                            res.redirect('/order/' + createOrder.order.orderId + '/payment')
                                        }
                                    })


                                })
                            }
                        })

                    }
                    else {
                        req.flash('error', 'credit not allowed. For Further details please contact customer service.')
                        res.redirect('/cartpage')
                    }


                })

            }
        })
    }
}

exports.codPath = function (req, res) {
    // console.log(req.body);
    var code = ""
    if (req.body.offer && req.body.offer.length > 2)
        code = req.body.offer
    else
        code = ""
    cartServices.getListingForOrder(req.user.uuid, req.user, code, function (cart) {//get total and cart items
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
                        req.flash('error', 'cod not allowed on total less than Rs' + foundThres[0].from)
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
                                fee.findOne({ name: "convenience", active: true }, function (err, foundFee) {
                                    var extra = 0
                                    if (err || functions.isEmpty(foundFee))
                                        extra = 0
                                    else {
                                        extra = foundFee.charge
                                    }
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
                                        paymentType: 'COD',
                                        codAllowed: true,
                                        tax: cart.tax
                                    }
                                   console.log("orderDetails=",order);
                                    



                                    order["total"] = order["total"] + extra
                                    if (req.body.code && req.body.code.length > 0 && cart.code != null && cart.discount > 0) {
                                        order["offerUsed"] = true
                                        order["offerCode"] = req.body.offer
                                    }
                                    orderServices.createOrder(order, function (createOrder) {
                                        if (createOrder.success == false) {
                                            console.log('error in creating order');
                                            req.flash('error', 'error in creating order')
                                            res.redirect('/cartPage')
                                        }
                                        else {
                                            orderServices.updateStockList(createOrder.order.orderedItems, function (stocks) {
                                                console.log("stock update status:", stocks.success);
                                            })
                                            res.render('successpage', { order: createOrder.order, failure: false, failureMessage: null })
                                        }
                                    })

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
//------------------------------------------------------------------------------------------------------------

exports.saveOrder = function (req, res) {
    var code = ""
    if (req.body.offer && req.body.offer.length > 2)
        code = req.body.offer
    else
        code = ""
    cartServices.getListingForOrder(req.user.uuid, req.user, code, function (cart) {//get total and cart items
        if (cart.success == false) {
            console.log('error in getting cart list');
            req.flash('error', 'error in getting cart list')
            res.redirect('/cartpage')
        }
        else {
            codaAllow.find({}, function (err, foundThres) {
                var cod = true
                var credA = false;
                var credPerc = 0;
                if (((req.user.isBusiness == true && req.user.premium == true) ||
                    (req.user.isBusiness == false && req.user.creditAllowed == true)) &&
                    (req.user.credPerc > 0 && req.user.credBalance >= cart.total)) {
                    credA = true
                    credPerc = req.user.credPerc
                }
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
                        fee.findOne({ name: "convenience", active: true }, function (err, foundFee) {
                            var extra = 0
                            if (err || functions.isEmpty(foundFee))
                                extra = 0
                            else {
                                extra = foundFee.charge
                            }
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
                                shipmentStatus: 'saved',
                                creditAllowed: credA,
                                creditPercent: credPerc,
                                tax: cart.tax
                            }


                            order["total"] = order["total"] + extra
                            if (req.body.code && req.body.code.length > 0 && cart.code != null && cart.discount > 0) {
                                order["offerUsed"] = true
                                order["offerCode"] = req.body.offer
                            }

                            orderServices.createOrder(order, function (createOrder) {
                                if (createOrder.success == false) {
                                    console.log('error in creating order');
                                    req.flash('error', 'error in creating order')
                                    res.redirect('/cartpage')
                                }
                                else {
                                    res.redirect('/saved-orders')
                                }
                            })

                        })
                    }
                })




            })

        }
    })

}


exports.createQuotation = function (req, res) {
    var code = ""
    if (req.body.offer && req.body.offer.length > 2)
        code = req.body.offer
    else
        code = ""
    cartServices.getListingForOrder(req.user.uuid, req.user, code, function (cart) {//get total and cart items
        if (cart.success == false) {
            console.log('error in getting cart list');
            req.flash('error', 'error in getting cart list')
            res.redirect('/cartpage')
        }
        else {
            codaAllow.find({}, function (err, foundThres) {
                var cod = true
                var credA = false;
                var credPerc = 0;
                if (((req.user.isBusiness == true && req.user.premium == true) ||
                    (req.user.isBusiness == false && req.user.creditAllowed == true)) &&
                    (req.user.credPerc > 0 && req.user.credBalance >= cart.total)) {
                    credA = true
                    credPerc = req.user.credPerc
                }
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
                        fee.findOne({ name: "convenience", active: true }, function (err, foundFee) {
                            var extra = 0
                            if (err || functions.isEmpty(foundFee))
                                extra = 0
                            else {
                                extra = foundFee.charge
                            }
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
                                shipmentStatus: 'saved',
                                creditAllowed: credA,
                                creditPercent: credPerc,
                                quoteAsked: true,
                                tax: cart.tax
                            }


                            order["total"] = order["total"] + extra
                            if (req.body.code && req.body.code.length > 0 && cart.code != null && cart.discount > 0) {
                                order["offerUsed"] = true
                                order["offerCode"] = req.body.offer
                            }
                            orderServices.createOrder(order, function (createOrder) {
                                if (createOrder.success == false) {
                                    console.log('error in creating order');
                                    req.flash('error', 'error in creating order')
                                    res.redirect('/cartpage')
                                }
                                else {
                                    req.flash('success', 'Quote Requested!')
                                    res.redirect('/cartpage')
                                    var maildata = {
                                        order: createOrder,
                                        items: cart.itemArray,
                                        user: req.user
                                    }
                                    mailer.askQuote(req.body.email, maildata, function (mailed) {
                                        console.log(mailed);
                                    })
                                }
                            })

                        })
                    }
                })




            })

        }
    })

}

//------------------------------------------------------------------------------------------------------------

exports.savedToCod = function (req, res) {
    orderServices.findOrderById(req.params.orderId, req.user.uuid, function (foundCod) {
        if (foundCod.success == false) {

        }
        else {
            codaAllow.find({}, function (err, foundThres) {
                if (!err && foundThres.length >= 1 && foundCod.order.allowCOD == true) {
                    if (foundCod.order.total < foundThres[0].from) {
                        req.flash('error', 'COD not allowed')
                        res.redirect('/saved-orders')
                    }
                    else {
                        orderServices.updateOrderDoc(req.params.orderId, { paymentType: 'COD', shipmentStatus: "processing", total: parseInt(foundCod.order.total) * 1.18 }, function (updatedOrder) {
                            if (updatedOrder.success == false) {
                                req.flash('error', 'error in processing order')
                                res.redirect('/saved-orders')
                            }
                            else {
                                req.session.mode = ''
                                orderServices.updateStockList(updatedOrder.order.orderedItems, function (stocks) {
                                    console.log("stock update status:", stocks.success);
                                })
                                res.render('successpage', { order: updatedOrder.order, failure: false, failureMessage: null })
                            }
                        })
                    }
                }
                else {
                    req.flash('error', 'error in processing order')
                    res.redirect('/saved-orders')
                }

            })
        }
    })


}

exports.savedToCredit = function (req, res) {
    orderServices.findOrderById(req.params.orderId, req.user.uuid, function (foundOrder) {
        if (foundOrder.success == false) {
            req.flash('error', 'error in processing order')
            res.redirect('/saved-orders')
        }
        else {
            if (foundOrder.order.creditAllowed == false) {
                req.flash('error', 'credit not allowed')
                res.redirect('/saved-orders')
            }
            else {
                orderServices.updateOrderDoc(req.params.orderId, { paymentType: 'credit' }, function (updatedOrder) {
                    if (updatedOrder.success == false) {
                        req.flash('error', 'error in processing order')
                        res.redirect('/saved-orders')
                    }
                    else {
                        req.session.mode = 'credit'
                        res.redirect('/order/' + updatedOrder.order.orderId + '/payment')
                    }
                })
            }
        }
    })

}
exports.savedToPay = function (req, res) {
    orderServices.updateOrderDoc(req.params.orderId, { paymentType: 'online' }, function (updatedOrder) {
        if (updatedOrder.success == false) {
            req.flash('error', 'error in processing order')
            res.redirect('/saved-orders')
        }
        else {
            req.session.mode = ''
            res.redirect('/order/' + updatedOrder.order.orderId + '/payment')
        }
    })
}
//------------------------------------------------------------------------------------------------------------
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
//------------------------------------------------------------------------------------------------------------

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

exports.checkSavedUserOrder = function (req, res) {

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
                    res.render('savedUserOrder', { success: true, found: true, order: foundOrder.order, Olist: result })
                }).catch(errors => {
                    res.render('savedUserOrder', { success: false, found: true, order: foundOrder.order, Olist: errors })
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
//------------------------------------------------------------------------------------------------------------

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
        paid: true,
        status: 'authorized',
        vendorId: req.body.vendorId

    }
    orderServices.acceptOrder(req.params.orderId, d, function (order) {
        if (order.success == false) {
            req.flash('error', 'error ' + order.message)
            res.redirect('/admin/orders-filter')
        }
        else {
            req.flash('success', 'success ' + order.message)
            res.redirect('/admin/orders-filter')
        }
    })
}

exports.getAllowCred = function (req, res) {
    res.render('allowCredOrder', { orderId: req.params.orderId })
}

exports.allowCred = function (req, res) {
    orderServices.allowCredit(req.params.orderId, req.body.credPerc, req.body.days, function (order) {
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

//------------------------------------------------------------------------------------------------------------

exports.getOrderByShipStatus = function (req, res) {
    console.log(req.params.shipment);
    orderServices.getOrderByShipment(req.params.shipment, function (foundOrder) {
        if (foundOrder.success == false) {
            req.flash('error', 'error')
            res.redirect('/admin/orders-filter')
        }
        else {
            res.render('adminOrders', { orders: foundOrder.order, filterType: req.params.shipment })
        }
    })
}

exports.getOrderByPST = function (req, res) {
    console.log(req.params.payment);
    orderServices.getOrderByPST(req.params.payment, function (foundOrder) {
        if (foundOrder.success == false) {
            req.flash('error', 'error')
            res.redirect('/admin/orders-filter')
        }
        else {
            res.render('adminOrders', { orders: foundOrder.order, filterType: "" })
        }
    })
}

exports.showOrderSection = (req, res) => {
    res.render("adminOrderSection")
}

exports.getAllOrders = function (req, res) {
    orderServices.getAllOrders(function (foundOrder) {
        if (foundOrder.success == false) {
            req.flash('error', 'error')
            res.redirect('/admin/orders-filter')
        }
        else {
            res.render('adminOrders', { orders: foundOrder.order, filterType: "" })
        }
    })
}

exports.getOrderByPayment = function (req, res) {
    console.log(req.params.payment);
    var st = "online"
    var p = req.params.payment.toUpperCase()
    if (p === "online".toUpperCase())
        st = "online"
    else if (p === "cod".toUpperCase())
        st = "COD"
    else if (p === "credit".toUpperCase())
        st = "credit"
    orderServices.getOrderByPayment(st, function (foundOrder) {
        if (foundOrder.success == false) {
            req.flash('error', 'error')
            res.redirect('/admin/orders-filter')
        }
        else {
            console.log(foundOrder);
            res.render('adminOrders', { orders: foundOrder.order, filterType: req.params.payment })
        }
    })
}
//------------------------------------------------------------------------------------------------------------

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
        res.redirect('/admin/orders-filter-paymentStatus/authorized')
    })
}

exports.setShipmentStatus = function (req, res) {
    orderServices.setShipStatus(req.params.orderId, req.params.status, function (updated) {
        if (updated.success == false)
            req.flash('error', 'error')
        res.redirect('/admin/orders-filter')
    })
}
//------------------------------------------------------------------------------------------------------------

exports.showOfferSection = function (req, res) {
    res.render('adminOfferSection')
}

exports.getCreateOffer = function (req, res) {
    res.render('adminCreateOffer')
}
exports.postCreateOffer = function (req, res) {
    var data = {
        code: req.body.code,
        isPercent: req.body.percent,
        discount: req.body.discount,
        forBusiness: req.body.business,
        items: req.body.items.length > 0 ? req.body.items.split("||") : []

    }
    orderServices.createOffer(data).then(createdOffer => { res.redirect('/admin/offers') })
        .catch(err => {
            req.flash('error', 'error')
            res.redirect('/admin/offers')
        })

}
exports.getAllOffers = function (req, res) {
    orderServices.getAllOffers().then(offers => {
        res.render('offerList', { offer: offers.offer })
    }).catch(err => {
        req.flash('error', 'error')
        res.redirect('/admin/offers')
    })
}
exports.getOfferByCode = function (req, res) {
    orderServices.getOfferByCode(req.params.code, function (offers) {
        if (offers.success == false) {
            req.flash('error', 'error')
            res.redirect('/admin/offers')
        }
        else
            res.render('peekOffer', { offer: offers.offer })
    })
}
exports.getUpdateOffer = function (req, res) {
    orderServices.getOfferByCode(req.params.code, function (offers) {
        if (offers.success == false) {
            req.flash('error', 'error')
            res.redirect('/admin/offers')
        }
        else
            res.render('updateOffer', { offer: offers.offer })
    })
}
exports.postUpdateOffer = function (req, res) {
    var data = {
        code: req.body.code,
        isPercent: req.body.percent,
        discount: req.body.discount,
        forBusiness: req.body.business,
        items: req.body.items.length > 0 ? req.body.items.split("||") : []

    }
    orderServices.updateOffer(req.body.code, data, function (updated) {
        if (updated.success == false) {
            req.flash('error', 'error')
            res.redirect('/admin/filters')
        }
        else {
            req.flash('success', 'success')
            res.redirect('/admin/offers')
        }
    })
}
//---------------------------------------------------------------------------------------------
exports.getAllServiceQuotes = function (req, res) {
    orderServices.getAllQuotes().then((result) => {
        res.render('quoteList', { quotes: result })
    }).catch((err) => {
        req.flash('error', 'error')
        res.redirect('/admin')
    });
}
exports.getServiceQuoteById = function (req, res) {
    orderServices.getQuoteById().then((result) => {
        res.render('peekQuote', { quote: result })
    }).catch((err) => {
        req.flash('error', 'error')
        res.redirect('/admin')
    });
}
exports.createServiceQuote = function (req, res) {
    console.log("Req Body is", req.body)
    var data = {
        email: req.body.email,
        phone: req.body.phone,
        name: req.body.name,
        iid: req.params.iid,
        units: req.body.qty,
        measurementUnit: req.body.unit,

    }
    console.log(data)
    if (req.user) {
        data["uuid"] = req.user.uuid
    }
    orderServices.createQuote(data, function (created) {
        if (created.success == false) {
            req.flash('error', 'error in creating quote ')

        } else {
            itemServices.getItemById(req.params.iid, function (foundItem) {
                var data = {
                    user: req.user,
                    email: req.user.email,
                    name: req.user.name,
                    item: foundItem.totalDetails,

                }
                mailer.serviceQuote(req.user.email, data, function (mailed) {
                    console.log(mailed);
                })
                req.flash('success', 'Quote Requested')
            })

        }
        res.redirect('/')

    })

}
exports.getCreateServiceQuote = function (req, res) {
    itemServices.getItemById(req.params.iid, function (foundItem) {
        if (!foundItem.success) {
            req.flash('error', 'An error has occurred!');
            res.redirect('/items/' + req.params.iid)
        } else {
            res.render('createQuote', { item: foundItem.totalDetails })
        }
    })
}

exports.serviceQuoteStatus = function (req, res) {
    orderServices.markAsCompleteQuote(req.params.quoteId, function (quote) {
        if (quote.success == false)
            req.flash('error', 'error')
        else
            req.flash('success', 'success')
        res.redirect('/admin/service')
    })
}

exports.getAllSavedOrders = function (req, res) {
    orderServices.getAllSavedOrders(req.user.uuid, function (allOrders) {
        if (!allOrders.success) {
            req.flash('error', "Could not find orders for the given user");
            res.redirect("/")
        } else {
            res.render("savedOListUser", { allOrders: allOrders.order })
        }
    })
}

exports.adminAllQuotes = (req, res) => {

    orderServices.getAllOrderQuotes().then((result) => {
        res.render('orderQuotes', { quotes: result })
    }).catch((err) => {
        req.flash('error', 'error')
        res.redirect('/admin')
    });

}

exports.adminAllSaved = (req, res) => {

    orderServices.getAllOrderSaved.then((result) => {
        res.render('orderQuotes', { quotes: result })
    }).catch((err) => {
        req.flash('error', 'error')
        res.redirect('/admin')
    });

}

exports.sendInvoice = function (req, res) {
    orderServices.checkOrderDetails(req.params.orderId, function (foundOrder) {
        if (foundOrder.success == false || foundOrder.found == false) {
            req.flash('error', 'error in getting order details')
            res.redirect('/admin/orders-filter')

        }
        else {

            var promiseArr = []
            foundOrder.order.orderedItems.forEach(element => {
                promiseArr.push(orderServices.getItemForOrderList(element.iid, element.quantity))
            });
            Promise.all(promiseArr).then(result => {
                userModel.findOne({ uuid: foundOrder.order.uuid }, function (err, foundUser) {
                    if (!err) {
                        var data = {
                            user: foundUser,
                            items: result,
                            order: foundOrder.order
                        }
                        mailer.sendInvoice(foundUser.email, data, function (mailed) {
                            console.log(mailed);
                            if (mailed.success == false) {
                                req.flash('error', 'error in sending mail')
                                res.redirect('/admin/orders-filter')

                            }
                            else {
                                orderServices.confirmInvoice(foundOrder.order.orderId, function (updated) {
                                    console.log(updated);
                                })
                                req.flash('success', 'success')
                                res.redirect('/admin/orders-filter')
                            }
                        })
                    }
                    else {
                        req.flash('error', 'error in sending mail')

                        res.redirect('/admin/orders-filter')

                    }

                })
            }).catch(errors => {
                console.log(error);
                req.flash('error', 'error in sending mail')

                res.redirect('/admin/orders-filter')

            })



        }

    })
}

exports.getGeneratedInvoiceList = (req, res) => {
    orderServices.getGeneratedInvoices(function (invoiceList) {
        if (invoiceList.success == false) {
            req.flash('error', "Cannot fetch the list of generated invoices")
            res.redirect("/admin/account-invoice")
        } else {
            res.render("adminGenInvoices", { invoiceList: invoiceList.invoices })
        }
    })
}

exports.getUpdateCODAllow = function (req, res) {
    codaAllow.find({}, function (err, foundC) {
        if (err || foundC.length == 0) {
            req.flash('error', 'error in db or cod document absent.please check database')
            res.redirect('/admin')
        }
        else
            res.render('updateCODA', { cod: foundC[0] })
    })

}
exports.getUpdateFee = function (req, res) {
    fee.findOne({ name: "convenience" }, function (err, foundF) {
        if (err) {
            req.flash('error', 'error in db or Fee document absent. Please check database')
            res.redirect('/admin')
        }
        else
            res.render('updateFee', { fee: foundF })

    })
}
exports.postUpdateCODAllow = function (req, res) {
    codaAllow.findOneAndUpdate({ name: req.body.name }, { from: req.body.from }, function (err, updatedC) {
        if (err)
            req.flash('error', 'error')
        else
            req.flash('success', 'success')
        res.redirect('/admin')
    })
}
exports.postUpdateFee = function (req, res) {
    fee.findOneAndUpdate({ name: "convenience" }, { active: req.body.active, charge: req.body.charge }, function (err, updatedF) {
        if (err)
            req.flash('error', 'error')
        else
            req.flash('success', 'success')
        res.redirect('/admin')
    })
}