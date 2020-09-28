var itemMetaModel = require("../models/Items/ItemMetadata")
var itemmodel = require('../models/Items/Items')
var cartmodel = require('../models/cart/cart')
var UserAddress = require('../models/User/DeliveryAddress')
var ordermodel = require('../models/Orders/Order')
var cancelOrderModel = require('../models/Orders/CancelledOrder')
var codemodel = require('../models/offer/codes')

var functions = require('../Middlewares/common/functions')

var mongoose = require("mongoose")
class order {
    constructor() {

    }

    createOrder(order, callback) {
        ordermodel.create(order, function (err, createdOrder) {
            if (err) {
                console.log(err);
                callback({ success: false })
            }
            else {
                if (functions.isEmpty(createdOrder)) {
                    console.log('empty order');
                    callback({ success: false })
                }
                else
                    callback({ success: true, order: createdOrder })
            }
        })
    }

    findOrderById(orderId, uuid, callback) {
        ordermodel.findOne({ orderId: orderId, uuid: uuid }, function (err, foundOrder) {
            if (err) {
                console.log(err);
                callback({ success: false })
            }
            else {
                if (functions.isEmpty(foundOrder)) {
                    callback({ success: true, found: false })
                }
                else {
                    callback({ success: true, found: true, order: foundOrder })
                }
            }

        })
    }
    checkOrderDetails(orderId, callback) {

        ordermodel.findOne({ orderId: orderId }, function (err, foundOrder) {
            if (err) {
                console.log(err);
                callback({ success: false })
            }
            else {
                if (functions.isEmpty(foundOrder)) {
                    callback({ success: true, found: false })
                }
                else {
                    callback({ success: true, found: true, order: foundOrder })
                }
            }

        })
    }

    getItemForOrderList(iid, qty) {
        return new Promise((resolve, reject) => {
            itemmodel.findOne({ iid: iid }, function (err, foundItem) {
                if (err)
                    reject({ success: false, item: {} })
                else {
                    resolve({ success: true, item: foundItem, quantity: qty })
                }
            })
        })
    }

    getOrdersForadmin(callback) {
        ordermodel.find({}, function (err, foundOrder) {
            if (err) {
                console.log(err);
                callback({ success: false })
            }
            else {
                if (functions.isEmpty(foundOrder)) {
                    callback({ success: true, found: false })
                }
                else {
                    callback({ success: true, found: true, order: foundOrder })
                }
            }

        })
    }

    getUserOrder(uuid, callback) {
        ordermodel.findOne({ uuid: uuid }, function (err, foundOrder) {
            if (err) {
                console.log(err);
                callback({ success: false })
            }
            else {
                if (functions.isEmpty(foundOrder)) {
                    callback({ success: true, found: false })
                }
                else {
                    callback({ success: true, found: true, order: foundOrder })
                }
            }

        })
    }

    addInstaMojoDetails(orderId, url, reqId, callback) {
        ordermodel.findOneAndUpdate({ orderId: orderId }, { '$set': { instaPaymentRequestId: reqId, instaPaymenturl: url } }, function (err, updatedOrder) {
            if (err) {
                console.log(err);
                callback({ success: false, message: 'error in payment' })
            }
            else {
                callback({ success: true, order: updatedOrder })
            }
        })
    }


    addInstaMojoId(paymentId, reqId, callback) {
        ordermodel.findOneAndUpdate({ instaPaymentRequestId: reqId }, { '$set': { instaPaymentId: paymentId, paid: true, status: 'authorized', transaction_id: paymentId } }, function (err, updatedOrder) {
            if (err) {
                console.log(err);
                callback({ success: false })
            }
            else {
                callback({ success: true, order: updatedOrder })
            }
        })
    }

    getUserAddress(uuid, callback) {
        UserAddress.find({ uuid: uuid }).exec(function (err, result) {
            if (err) {
                console.log(err);
                callback({ success: false })
            }
            else {
                callback({ success: true, address: result })
            }
        })
    }

    findAddressByid(id, callback) {
        UserAddress.findOne({ _id: id }, function (err, address) {
            if (err) {
                console.log(err);
                callback({ success: false })

            }
            else {
                if (functions.isEmpty(address)) {
                    callback({ success: false })
                }
                else {
                    callback({ success: true, address: address })
                }
            }
        })
    }


    createVoucherCode(alphabets = 4, numbers = 4, isRef, discount, callback) {

        codemodel.find({ isReferral: isRef }, function (err, codelist) {
            console.log("*");
            console.log(codelist);

            var list = codelist.map((curr) => curr.code)
            let s = ""
            var c = 0;
            while (true) {
                s = ""

                for (var i = 0; i < alphabets; i++)
                    s += String.fromCharCode(parseInt(Math.random() * (90 - 65)) + 65);
                s += "@"
                for (var i = 0; i < numbers; i++)
                    s += String.fromCharCode(parseInt(Math.random() * (57 - 48)) + 48);
                c++;
                if (list.includes(s) == false || c == 10) break;
            }
            if (s.length == 0 || c == 10)
                callback({ success: false })
            else {
                if (isRef == false) {
                    codemodel.create({ isReferral: false, code: s, discount: discount }, function (err, updatedCode) {
                        if (err) {
                            callback({ success: false })
                            console.log(err);
                        }
                        else
                            callback({ success: true, code: updatedCode })
                    })
                }
                else {
                    codemodel.create({ isReferral: true, code: s, discount: 0.15 }, function (err, updatedCode) {
                        if (err) {
                            callback({ success: false })
                            console.log(err);
                        }
                        else
                            callback({ success: true, code: updatedCode })
                    })
                }

            }

        })



    }

    getDiscountForCode(code, callback) {
        codemodel.findOne({ code: code }, function (err, disc) {
            if (err)
                callback({ success: false, discount: 0, code: '' })
            else {
                if (functions.isEmpty(disc))
                    callback({ success: true, discount: 0, code: '' })
                else
                    callback({ success: true, discount: disc.discount, code: disc.code })

            }
        })
    }

    checkIfCodeUsed(code, uuid, callback) {
        ordermodel.findOne({ uuid: uuid, code: code, status: 'authorized' }, function (err, foundOrder) {
            if (err)
                callback({ success: false })
            else {
                if (functions.isEmpty(foundOrder))
                    callback({ success: true, allow: true })
                else
                    callback({ success: false, allow: false })
            }
        })
    }

    getDiscountListing(callback) {
        codemodel.find({ isReferral: false }, function (err, foundCodes) {
            if (err)
                callback({ success: false })
            else
                callback({ success: true, codelist: foundCodes })
        })
    }

    cancelOrder(orderId, callback) {

        ordermodel.findOneAndUpdate({ orderId: orderId, shipmentStatus: { $ne: ['cancelled', 'completed', 'cancellation processing'] } }, { shipmentStatus: 'cancellation processing' }, function (err, updatedOrder) {
            if (err || functions.isEmpty(updatedOrder))
                callback({ success: false })
            else {
                cancelOrderModel.create({ orderId: orderId, uuid: updatedOrder.uuid }, function (err, createdCancel) {
                    if (err || functions.isEmpty(createdCancel))
                        callback({ success: false })
                    else
                        callback({ success: true, cancelReq: createdCancel })
                })
            }
        })
    }

    getCancellationsForUser(uuid, callback) {
        cancelOrderModel.find({ uuid: uuid }, function (err, foundCancelReq) {
            if (err) callback({ success: false })
            else
                callback({ success: true, cancelReq: foundCancelReq })
        })
    }

    getCancellationById(cancellationId, callback) {
        cancelOrderModel.findOne({ cancellationId: cancellationId }, function (err, foundCancelReq) {
            if (err) callback({ success: false })
            else
                callback({ success: true, cancelReq: foundCancelReq })
        })
    }

    getAllCancellations(callback) {
        cancelOrderModel.find({}, function (err, foundCancelReq) {
            if (err) callback({ success: false })
            else
                callback({ success: true, cancelReq: foundCancelReq })
        })
    }

    getCancellationByStatus(status, callback) {
        cancelOrderModel.find({ cancellationStatus: status }, function (err, foundCancelReq) {
            if (err) callback({ success: false })
            else
                callback({ success: true, cancelReq: foundCancelReq })
        })
    }

    acceptCancellation(cancellationId, transaction_id, callback) {
        cancelOrderModel.findOneAndUpdate({ cancellationId: cancellationId },
            { cancellationStatus: 'cancelled', paymentRefundStatus: 'completed' }
            , function (err, cancelReq) {
                if (err)
                    callback({ success: false })
                else {
                    ordermodel.findOneAndUpdate({ orderId: cancelReq.orderId }, { shipmentStatus: 'cancelled', transaction_id: transaction_id }, function (err, updatedOrder) {
                        if (err)
                            callback({ success: false })
                        else
                            callback({ success: true })
                    })
                }
            })
    }

    acceptOrder(orderId, data, callback) {
        ordermodel.findOneAndUpdate({ order_id: orderId }, data, function (err, order) {
            if (err) callback({ success: false })
            else callback({ success: true })
        })
    }

    getOrderByShipment(status, callback) {
        ordermodel.find({ shipmentStatus: status }, function (err, order) {
            if (err || functions.isEmpty(order)) callback({ success: false })
            else callback({ success: true, order: order })
        })
    }
    allOrders(callback) {
        ordermodel.find({}, function (err, order) {
            if (err || functions.isEmpty(order)) callback({ success: false })
            else callback({ success: true, order: order })
        })
    }
    getOrderByPayment(status, callback) {
        ordermodel.find({ status: status }, function (err, order) {
            if (err || functions.isEmpty(order)) callback({ success: false })
            else callback({ success: true, order: order })
        })
    }

    getOrderByUUID(uuid, callback) {
        ordermodel.find({ uuid: uuid }, function (err, order) {
            if (err || functions.isEmpty(order)) callback({ success: false })
            else callback({ success: true, order: order })
        })
    }



}

module.exports = new order()