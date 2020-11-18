var itemMetaModel = require("../models/Items/ItemMetadata")
var itemmodel = require('../models/Items/Items')
var cartmodel = require('../models/cart/cart')
var UserAddress = require('../models/User/DeliveryAddress')
var userModel = require('../models/User/User')
var ordermodel = require('../models/Orders/Order')
var vendorModel = require('../models/Items/vendor')
var cancelOrderModel = require('../models/Orders/CancelledOrder')
var codemodel = require('../models/offer/codes')
var shiprocket = require('../models/Orders/shiprocket')
var itemServices = require('../openServices/items')
var offersModel = require('../models/offer/offer')
var quoteModel = require('../models/Orders/serviceQuote')
var functions = require('../Middlewares/common/functions')
var axios = require('axios')
var mongoose = require("mongoose")
require('dotenv').config()
const envData = process.env
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
    getOrdersByDateRangePayment(from, to, payment, callback) {
        var t = new Date(to)
        var f = new Date(from)
        console.log(!(f instanceof Date) || !(t instanceof Date));
        if (!(f instanceof Date) || !(t instanceof Date))
            callback({ success: false })
        else {
            var filter={}
            if(payment==="all")
            filter={ $match: { purchaseTime: { $gte: f, $lte: t },  invoiceSent: true }}
            else
            filter={ $match: { purchaseTime: { $gte: f, $lte: t },status:payment,  invoiceSent: true }}
            ordermodel.aggregate([
                 filter,

            ]).exec((err, foundOrder) => {
                console.log(err);
                console.log(f,t,payment);
                if (err) callback({ success: false })
                else callback({ success: true, data: foundOrder })

            })
        }

    }

    getOrdersByDateRangeShipment(from, to, shipment, callback) {
        var t = new Date(to)
        var f = new Date(from)
        console.log(!(f instanceof Date) || !(t instanceof Date));
        if (!(f instanceof Date) || !(t instanceof Date))
            callback({ success: false })
        else {
            var filter={}
            if(shipment==="all")
            filter={ $match: { purchaseTime: { $gte: f, $lte: t }, invoiceSent: true } }
            else
            filter={ $match: { purchaseTime: { $gte: f, $lte: t },shipmentStatus: shipment, invoiceSent: true } }
            ordermodel.aggregate([
                filter,

            ]).exec((err, foundOrder) => {
                console.log(err);
                if (err) callback({ success: false })
                else callback({ success: true, data: foundOrder })

            })
        }

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

    addTransactionId(orderId, transactionId, callback) {
        ordermodel.findOneAndUpdate({ orderId: orderId }, { '$set': { transaction_id: transactionId } }, function (err, updatedOrder) {
            if (err) {
                console.log(err);
                callback({ success: false })
            }
            else {
                callback({ success: true, order: updatedOrder })
            }
        })
    }

    updatePaymentByTransactionId(transaction_id, status, callback) {
        var st = status === "success" ? "authorized" : "initiated"
        ordermodel.findOneAndUpdate({ transaction_id: transaction_id }, { '$set': { status: st,shipmentStatus:"processing" } }, (err, updatedOrder) => {
            if (err) {
                console.log(err);
                callback({ success: false })
            }
            else {
                if (updatedOrder.paymentType === "credit"&&st==="authorized") {
                    userModel.findOne({ uuid: updatedOrder.uuid }, function (err, foundUser) {
                        if (err)
                            console.log(err);
                        else {
                            userModel.findOneAndUpdate({ uuid: updatedOrder.uuid }, { credBalance: foundUser.credBalance - updatedOrder.total }, function (err, updatedOrder) {
                                console.log(err);
                            })
                        }

                    })
                }

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
            console.log(err);
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
                        if (err||functions.isEmpty(updatedOrder))
                            callback({ success: false })
                        else{
                            userModel.findOne({uuid:updatedOrder.uuid},function(err,user){
                                if(err)
                                callback({success:false})
                                else
                                callback({ success: true,order:updatedOrder,cancelRequest:cancelReq,user:user })

                            })
                        
                        }
                        })
                }
            })
    }

    checkShiprocketCode(callback) {
        shiprocket.findOne({ name: "code" }, function (err, foundCode) {
            if (err || functions.isEmpty(foundCode))
                callback({ success: false })
            else {
                var today = new Date()
                var creation = new Date(foundCode.from)
                console.log("days to expiry=", (today.getTime() - creation.getTime()) / (1000 * 60 * 60 * 24));
                if ((today.getTime() - creation.getTime()) / (1000 * 60 * 60 * 24) >= 5) {
                    var data = JSON.stringify({ "email": envData.ship_email, "password": envData.ship_password });

                    var config = {
                        method: 'post',
                        url: 'https://apiv2.shiprocket.in/v1/external/auth/login',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        data: data
                    };

                    axios(config)
                        .then(function (response) {
                            console.log(JSON.stringify(response.data));
                            shiprocket.findOneAndUpdate({ name: "code" }, { data: response.data.token, from: new Date() }, function (err, upsr) {
                                if (err)
                                    callback({ success: false })
                                else
                                    callback({ success: true, code: response.data.token })
                            })

                        })
                        .catch(function (error) {
                            console.log(error);
                            callback({ success: false })
                        });
                }
                else
                    callback({ success: true, code: foundCode.data })

            }
        })
    }

    acceptOrder(orderId, data, callback) {
        console.log(data);
        ordermodel.findOne({ orderId: orderId, }, (err, foundOrder) => {
            if (err || functions.isEmpty(foundOrder)) {
                callback({ success: false, message: "db error" })
            }
            else {
                vendorModel.findOne({ vendorId: data.vendorId }, (err, foundVendor) => {
                    if (err) {
                        callback({ success: false, message: "db error" })
                    }
                    else {
                        if (data.length == '' || data.weight == '' || data.height == '' || data.breadth == '' || data.vendorId == '') {
                            ordermodel.findOneAndUpdate({ orderId: foundOrder.orderId }, data, function (err, updatedOrder) {
                                console.log("order update error=", err);
                                if (err)
                                    callback({ success: false, message: "error in updating order" })
                                else
                                    callback({ success: true, message: "shiprocket request not made!!" })
                            })
                        }
                        else {
                            userModel.findOne({ uuid: foundOrder.uuid }, (err, foundUser) => {
                                if (err)
                                    callback({ success: false, message: "db error" })
                                else {
                                    var orderitems = []
                                    for (var i = 0; i < foundOrder.orderedItems.length; i++) {
                                        orderitems.push({
                                            selling_price: foundOrder.orderedItems[i].selling_price,
                                            name: foundOrder.orderedItems[i].name,
                                            units: foundOrder.orderedItems[i].quantity,
                                            sku: foundOrder.orderedItems[i].sku,
                                        })
                                    }

                                    var shipment = {
                                        "order_id": foundOrder.orderId,
                                        "order_date": foundOrder.purchaseTime,
                                        "pickup_location": foundVendor.pickup_location,
                                        "billing_customer_name": foundUser.name,
                                        "billing_last_name": "",
                                        "billing_address": foundOrder.fullAddress,
                                        "billing_city": foundOrder.city,
                                        "billing_pincode": foundOrder.pincode,
                                        "billing_state": foundOrder.state,
                                        "billing_country": "India",
                                        "billing_email": foundUser.email,
                                        "billing_phone": foundUser.phone,
                                        "shipping_is_billing": true,
                                        "order_items": orderitems,
                                        "payment_method": "Prepaid",
                                        "sub_total": foundOrder.total,
                                        "length": data.length, "breadth": data.breadth, "height": data.height, "weight": data.weight
                                    }

                                    console.log(shipment);
                                    var d = JSON.stringify(shipment)



                                    this.checkShiprocketCode((srcode) => {
                                        if (srcode.success == false)
                                            callback({ success: false, message: 'could not fetch auth codes for shiprocket' })
                                        else {
                                            var config = {
                                                method: 'post',
                                                url: 'https://apiv2.shiprocket.in/v1/external/orders/create/adhoc',
                                                headers: {
                                                    'Content-Type': 'application/json',
                                                    'Authorization': 'Bearer ' + srcode.code
                                                },
                                                data: d
                                            };
                                            axios(config)
                                                .then(function (response) {
                                                    console.log(JSON.stringify(response.data));
                                                    if (response.data.status_code == 1) {
                                                        data.shiprocket_shipment_id = response.data["shipment_id"]
                                                        data.shiprocket_order_id = response.data["order_id"]
                                                        ordermodel.findOneAndUpdate({ orderId: orderId }, data, function (err, updatedOrder) {
                                                            if (err)
                                                                callback({ success: false, message: "error in updating order" })
                                                            else
                                                                callback({ success: true, message: "shiprocket request made!" })
                                                        })
                                                    }
                                                    else
                                                    {
                                                        callback({ success: false, message: "error in updating order,please check shiprocket dashboard" })
                                                    }
                                                })
                                                .catch(function (error) {
                                                    console.log(error);
                                                    callback({ success: false, message: "error in placing order. Please check logs" })

                                                });

                                        }

                                    })

                                }
                            })
                        }
                    }
                })
            }
        })


    }

    getOrderByShipment(status, callback) {
        ordermodel.aggregate([
            {$match:{ shipmentStatus: status }},
            { $lookup: { from: 'users', localField: 'uuid', foreignField: 'uuid', as: 'user' } },
            {
                $project: {
                    "orderId": "$orderId",
                    "paymentType": "$paymentType",
                    "shipmentStatus": "$shipmentStatus",
                    "fullAddress" : "$fullAddress",
                    "status": "$status",
                    "purchaseTime": "$purchaseTime",
                    "total": "$total",
                    "uuid":"$uuid",
                    "user": { "$arrayElemAt": ["$user", 0]},
                }
            }]).exec(function (err, order) {
                console.log(order);
            if (err) callback({ success: false })
            else callback({ success: true, order: order })
        })
    }

    getOrderByPST(status, callback) {
        ordermodel.aggregate([
            {$match:{ status: status }},
            { $lookup: { from: 'users', localField: 'uuid', foreignField: 'uuid', as: 'user' } },
            {
                $project: {
                    "orderId": "$orderId",
                    "paymentType": "$paymentType",
                    "shipmentStatus": "$shipmentStatus",
                    "fullAddress" : "$fullAddress",
                    "status": "$status",
                    "purchaseTime": "$purchaseTime",
                    "total": "$total",
                    "uuid":"$uuid",
                    "user": { "$arrayElemAt": ["$user", 0]},
                }
            }
        ]).exec(function (err, order) {
            console.log(order);
            if (err) callback({ success: false })
            else callback({ success: true, order: order })
        })
    }
    getAllOrders(callback) {
        ordermodel.aggregate([
            {$match:{}},
            { $lookup: { from: 'users', localField: 'uuid', foreignField: 'uuid', as: 'user' } },
            {
                $project: {
                    "orderId": "$orderId",
                    "paymentType": "$paymentType",
                    "shipmentStatus": "$shipmentStatus",
                    "fullAddress" : "$fullAddress",
                    "status": "$status",
                    "purchaseTime": "$purchaseTime",
                    "total": "$total",
                    "uuid":"$uuid",
                    "user": { "$arrayElemAt": ["$user", 0]},
                }
            }
        ]).exec(function (err, order) {
            if (err) callback({ success: false })
            else callback({ success: true, order: order })
        })
    }
    getOrderByPayment(status, callback) {
        ordermodel.aggregate([
            {$match:{ paymentType: status }},
            { $lookup: { from: 'users', localField: 'uuid', foreignField: 'uuid', as: 'user' } },
            {
                $project: {
                    "orderId": "$orderId",
                    "paymentType": "$paymentType",
                    "shipmentStatus": "$shipmentStatus",
                    "fullAddress" : "$fullAddress",
                    "status": "$status",
                    "purchaseTime": "$purchaseTime",
                    "total": "$total",
                    "uuid":"$uuid",
                    "user": { "$arrayElemAt": ["$user", 0]},
                }
            }]).exec(function (err, order) {
                console.log(order);
            if (err) callback({ success: false })
            else callback({ success: true, order: order })
        })
    }

    getOrderByUUID(uuid, callback) {
        ordermodel.find({ uuid: uuid, shipmentStatus: { $ne: 'saved' } }, function (err, order) {
            if (err) callback({ success: false })
            else callback({ success: true, order: order })
        })
    }

    getAllSavedOrders(uuid, callback) {
        ordermodel.find({ uuid: uuid, shipmentStatus: "saved" }, function (err, order) {
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

    allowCredit(orderId, percent, days, callback) {
        ordermodel.findOneAndUpdate({ orderId: orderId, },
            { creditAllowed: true, creditPercent: percent, paymentType: 'credit', daysToRemind: days },
            function (err, updatedOrder) {
                if (err || functions.isEmpty(updatedOrder)) callback({ success: false })
                else
                    callback({ success: true, order: updatedOrder })
            })
    }

    updateOrderDoc(orderId, data, callback) {
        ordermodel.findOneAndUpdate({ orderId: orderId, }, data, function (err, updatedOrder) {
            console.log("order",updatedOrder);
            console.log("error:",err);
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
    createOffer(data) {
        return new Promise((resolve, reject) => {
            offersModel.create(data, function (err, createdOffer) {
                if (err) reject({ offer: null, message: "error" })
                else
                    resolve({ offer: createdOffer })
            })
        })
    }
    getAllOffers() {
        return new Promise((resolve, reject) => {
            offersModel.find({}, function (err, createdOffer) {
                if (err) reject({ offer: [], message: "error" })
                else
                    resolve({ offer: createdOffer })
            })
        })
    }
    getOffersByfilter(filter, callback) {
        offersModel.find(filter, function (err, createdOffer) {
            if (err) callback({ offer: [], message: "error" })
            else
                callback({ offer: createdOffer })
        })
    }
    getOfferByCode(code, callback) {
        offersModel.findOne({ code: code }, function (err, createdOffer) {
            if (err) callback({ success: false, offer: [], message: "error" })
            else
                callback({ success: true, offer: createdOffer })
        })
    }
    updateOffer(code, data, callback) {
        offersModel.findOneAndUpdate({ code: code }, data, function (err, createdOffer) {
            console.log(err)
            if (err) callback({ offer: [], message: "error" })
            else
                callback({ offer: createdOffer })
        })
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
                            if (offer.items.includes(cartList[i].iid) == false) {
                                valid = false
                                break;
                            }
                        }

                    }
                    if (valid == false) {
                        callback({ success: false, message: 'there are items in your cart on which this code is not applicable' })
                    }
                    else {
                        if (offer.isPercent)
                            total = total * (1 - (parseInt(offer.discount) / 100))
                        else
                            total = total - offer.discount
                        offersModel.findOneAndUpdate({ code: code, active: true, discount: { $gt: 0 } },
                            { $push: { used: uuid } }, function (err, updatedOffer) {
                                if (err)
                                    console.log("issue in noting user data to code");
                                else
                                    console.log(uuid, " used code", code);

                            })
                        callback({ success: true, total: total })
                    }
                }


            }

        })



    }

    createQuote(data, callback) {
        quoteModel.create(data, function (err, quote) {
            console.log(err)
            if (err) {
                callback({ success: false })
            }
            else
                callback({ success: true, quote })
        })
    }
    markAsCompleteQuote(quoteId, callback) {
        quoteModel.findOneAndUpdate({ quoteId: quoteId }, { serviced: true }, function (err, quote) {
            if (err)
                callback({ success: false })
            else
                callback({ success: true, quote })
        })
    }
    getAllQuotes() {
        return new Promise((resolve, reject) => {
            quoteModel.find({}, function (err, quote) {
                if (err)
                    reject(err)
                else
                    resolve(quote)
            })
        })

    }
    getAllOrderQuotes() {
        return new Promise((resolve, reject) => {
            ordermodel.find({ quoteAsked: true }, function (err, quote) {
                if (err)
                    reject(err)
                else
                    resolve(quote)
            })
        })
    }

    getAllOrderSaved() {
        return new Promise((resolve, reject) => {
            ordermodel.find({ shipmentStatus: "saved" }, function (err, quote) {
                if (err)
                    reject(err)
                else
                    resolve(quote)
            })
        })
    }
    getQuoteById(quoteId) {
        return new Promise((resolve, reject) => {
            quoteModel.aggregate([
                { $match: { quoteId: quoteId } },
                { $lookup: { from: 'items', localField: 'iid', foreignField: 'iid', as: 'item' } },
                {
                    $project: {
                        "item": { "$arrayElemAt": ["$item", 0] },
                        "quoteId": "$quoteId",
                        "uuid": "$uuid",
                        "businessName": "$businessName",
                        "businessCity": "$businessCity",
                        "name": "$name",
                        "phone": "$phone",
                        "email": "$email",
                        "unit": "$unit",
                        "measurementUnit": "$item.measurementUnit",
                        "dateCreated": "$dateCreated",




                    }
                }
            ]).exec(function (err, found) {
                if (err) {
                    reject(err)
                }
                else {
                    resolve(found)
                }
            })
        })
    }

    getOrderQuoteById(orderId, callback) {
        ordermodel.findOne({ orderId: orderId }, function (err, foundItem) {
            if (err)
                callback({ success: false })
            else
                callback({ success: true, order: foundItem })
        })
    }

    confirmInvoice(orderId, callback) {
        ordermodel.findOneAndUpdate({ orderId: orderId }, { invoiceSent: true }, function (err, order) {
            if (err)
                callback({ success: false })
            else
                callback({ success: true, order })
        })
    }

    getGeneratedInvoices(callback) {
        ordermodel.find({ invoiceSent: true }, function (err, foundInvoiceList) {
            if (err) {
                callback({ success: false })
            } else {
                callback({ success: true, invoices: foundInvoiceList })
            }
        })
    }
    addTrack(orderId,link,callback)
    {
        ordermodel.findOneAndUpdate({ orderId: orderId },{trackingLink:link}, function (err, foundInvoiceList) {
            if (err) {
                callback({ success: false })
            } else {
                callback({ success: true, })
            }
        })
    }


}

module.exports = new order()