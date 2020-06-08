var itemMetaModel = require("../models/Items/ItemMetadata")
var itemmodel = require('../models/Items/Items')
var cartmodel = require('../models/cart/cart')
var UserAddress = require('../models/User/DeliveryAddress')
var ordermodel = require('../models/Orders/Order')
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


    createVoucherCode(alphabets = 4, numbers = 4, isRef,discount,callback) {
        
            codemodel.find({ isReferral: isRef }, function (err, codelist) {
                console.log("*");
                console.log(codelist);

                var list = codelist.map((curr)=>curr.code)
                let s=""
                var c=0;
                while(true){
                 s = ""

                for (var i = 0; i < alphabets; i++)
                    s +=String.fromCharCode(parseInt( Math.random() * (90 - 65) )+ 65);
                s += "@"
                for (var i = 0; i < numbers; i++)
                    s +=String.fromCharCode( parseInt(Math.random() * (57 - 48)) + 48);
                    c++;
                if(list.includes(s)==false||c==10)break;
                }
                if(s.length==0||c==10)
                callback({success:false})
                else
                {
                    if(isRef==false)
                    {
                        codemodel.create({isReferral:false,code:s,discount:discount},function(err,updatedCode){
                            if(err)
                            {callback({success:false})
                        console.log(err);}
                            else
                            callback({success:true,code:updatedCode})
                        })
                    }
                    else
                    {
                        codemodel.create({isReferral:true,code:s,discount:0.15},function(err,updatedCode){
                            if(err)
                            {callback({success:false})
                        console.log(err);}
                            else
                            callback({success:true,code:updatedCode})
                        })
                    }

                }
                
            })
        
       

    }

    getDiscountForCode(code,callback)
    {
        codemodel.findOne({code:code},function(err,disc){
            if(err)
            callback({success:false,discount:0,code:''})
            else
            {
                if(functions.isEmpty(disc))
                callback({success:true,discount:0,code:''})
                else
                callback({success:true,discount:disc.discount,code:disc.code})
            
        }
        })
    }

    checkIfCodeUsed(code,uuid,callback)
    {
        ordermodel.findOne({uuid:uuid,code:code,status:'authorized'},function(err,foundOrder){
            if(err)
            callback({success:false})
            else
            {
                if(functions.isEmpty(foundOrder))
                callback({success:true,allow:true})
                else
                callback({success:false,allow:false})
            }
        })
    }



}

module.exports = new order()