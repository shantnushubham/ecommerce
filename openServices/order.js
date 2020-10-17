var itemMetaModel = require("../models/Items/ItemMetadata")
var itemmodel = require('../models/Items/Items')
var cartmodel = require('../models/cart/cart')
var UserAddress = require('../models/User/DeliveryAddress')
var ordermodel = require('../models/Orders/Order')
var cancelOrderModel = require('../models/Orders/CancelledOrder')
var codemodel = require('../models/offer/codes')
var itemServices = require('../openServices/items')
var offersModel = require('../models/offer/offer')

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
    getOrdersByDateRange(from, to, callback) {
        if (!(from instanceof Date) || !(to instanceof Date))
            callback({ success: false })
        ordermodel.aggregate([
            { $match: { purchaseTime: { $gte: from, $lte: to } } },
            {
                $project: {
                    uuid: 1,
                    total: 1,
                    purchaseTime: 1,
                    shipmentStatus: 1,
                    status: 1,

                }
            }
        ]).exec((err, foundOrder) => {
            if (err) callback({ success: false })
            else callback({ success: true, data: foundOrder })

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

        ordermodel.findOneAndUpdate({ orderId: orderId, shipmentStatus: { $nin: ['cancelled', 'completed', 'cancellation-processing'] } }, { shipmentStatus: 'cancellation-processing' }, function (err, updatedOrder) {
            if (err || functions.isEmpty(updatedOrder))
                callback({ success: false })
            else {
                cancelOrderModel.create({ orderId: orderId, uuid: updatedOrder.uuid }, function (err, createdCancel) {
                    console.log(err, createdCancel);
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
        ordermodel.findOneAndUpdate({ orderId: orderId }, data, function (err, order) {
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
    getAllOrders(callback) {
        ordermodel.find({}, function (err, order) {
            if (err || functions.isEmpty(order)) callback({ success: false })
            else callback({ success: true, order: order })
        })
    }
    getOrderByPayment(status, callback) {
        ordermodel.find({ status: status }, function (err, order) {
            if (err) callback({ success: false })
            else callback({ success: true, order: order })
        })
    }

    getOrderByUUID(uuid, callback) {
        ordermodel.find({ uuid: uuid }, function (err, order) {
            if (err) callback({ success: false })
            else callback({ success: true, order: order })
        })
    }

    authorizeOrder(orderId, callback) {
        ordermodel.findOneAndUpdate({ orderId: orderId }, { status: "authorized" }, function (err, updatedOrder) {
            if (err || functions.isEmpty(updatedOrder)) callback({ success: false })
            else
                callback({ success: true })
        })
    }
    setShipStatus(orderId, status, callback) {
        ordermodel.findOneAndUpdate({ orderId: orderId }, { shipmentStatus: status }, function (err, updatedOrder) {
            if (err || functions.isEmpty(updatedOrder)) callback({ success: false })
            else
                callback({ success: true })
        })
    }

    creditOrderUpdate(orderId, uuid, callback) {
        ordermodel.findOneAndUpdate({ orderId: orderId, uuid: uuid }, { paymentType: 'credit' }, function (err, updatedOrder) {
            if (err || functions.isEmpty(updatedOrder)) callback({ success: false })
            else
                callback({ success: true, order: updatedOrder })
        })
    }

    allowCredit(orderId, percent, callback) {
        ordermodel.findOneAndUpdate({ orderId: orderId, },
            { creditAllowed: true, creditPercent: percent, paymentType: 'credit', shipmentStatus: 'processing' },
            function (err, updatedOrder) {
                if (err || functions.isEmpty(updatedOrder)) callback({ success: false })
                else
                    callback({ success: true, order: updatedOrder })
            })
    }

    updateOrderDoc(orderId, data, callback) {
        ordermodel.findOneAndUpdate({ orderId: orderId, }, data, function (err, updatedOrder) {
            if (err || functions.isEmpty(updatedOrder)) callback({ success: false })
            else
                callback({ success: true, order: updatedOrder })
        })
    }

    updateStockList(arr, callback) {
        if (arr.length == 0) callback({ success: false, message: "array empty for orders" })
        else {
            var promisarr = []
            arr.forEach(element => {
                arr.push(itemServices.updateStock(element.iid, element.quantity))
            });

            Promise.all(promisarr).then((result) => {
                callback({ success: true })
            }).catch((err) => {
                callback({ success: false })
            });
        }
    }

    returnOfferPrice(code, cartList, uuid, total, callback) {
        offersModel.findOne({ code: code, active: true, discount: { $gt: 0 } }, function (err, offer) {
            if (err) {
                callback({ success: false, message: 'error in fetching code' })
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
                            if (foundOffer.offer.items.includes(cartList[i].iid) == false) {
                                valid = false
                                break;
                            }
                        }

                    }
                    if (valid == false) {
                        callback({ success: false, message: 'there are items in your cart on which this code is not applicable' })
                    }
                    else {
                        if (offer.isPercentage)
                            total = total * (1 - (parseInt(offer.discount) / 100))
                        else
                            total = total - offer.discount
                        callback({success:true,total:total})
                    }
                }


            }

        })








    }
}

module.exports = new order()