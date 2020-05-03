var itemMetaModel = require("../models/Items/ItemMetadata")
var itemmodel = require('../models/Items/Items')
var cartmodel = require('../models/cart/cart')
var UserAddress = require('../models/User/DeliveryAddress')
var ordermodel= require('../models/Orders/Order')
var functions = require('../Middlewares/common/functions')

var mongoose = require("mongoose")
class order
{
    constructor() {
        
    }

    createOrder(order,callback)
    {
        ordermodel.create(order,function(err,createdOrder){
            if(err)
            {
                callback({success:false})
            }
            else
            {
                if(functions.isEmpty(createOrder))callback({success:false})
                else
                callback({success:true,order:createdOrder})
            }
        })
    }

    findOrderById(orderId,uuid,callback){
        ordermodel.findOne({orderId:orderId,uuid:uuid},function(err,foundOrder){
            if(err){
                console.log(err);
                callback({success:false})
            }
            else
            {
                if(functions.isEmpty(foundOrder)){
                    callback({success:true,found:false})
                }
                else
                {
                    callback({success:true,found:true,order:foundOrder})
                }
            }
            
        })
    }

    getOrdersForadmin(callback){
        ordermodel.find({},function(err,foundOrder){
            if(err){
                console.log(err);
                callback({success:false})
            }
            else
            {
                if(functions.isEmpty(foundOrder)){
                    callback({success:true,found:false})
                }
                else
                {
                    callback({success:true,found:true,order:foundOrder})
                }
            }
            
        })
    }

    getUserOrder(uuid,callback){
        ordermodel.findOne({uuid:uuid},function(err,foundOrder){
            if(err){
                console.log(err);
                callback({success:false})
            }
            else
            {
                if(functions.isEmpty(foundOrder)){
                    callback({success:true,found:false})
                }
                else
                {
                    callback({success:true,found:true,order:foundOrder})
                }
            }
            
        })
    }

    addInstaMojoDetails(orderId,url,reqId,callback){
        ordermodel.findOneAndUpdate({orderId:orderId},{'$set':{instaPaymentRequestId:reqId,instaPaymenturl:url}},function(err,updatedOrder){
            if(err){
                console.log(err);
                callback({success:false,message:'error in payment'})
            }
            else
            {
                callback({success:true,order:updatedOrder})
            }
        })
    }


    addInstaMojoId(paymentId,reqId,callback){
        ordermodel.findOneAndUpdate({instaPaymentRequestId:reqId},{'$set':{instaPaymentId:paymentId,paid:true}},function(err,updatedOrder){
            if(err){
                console.log(err);
                callback({success:false})
            }
            else
            {
                callback({success:true,order:updatedOrder})
            }
        })
    }

    getUserAddress(uuid,callback)
    {
        UserAddress.find( {uuid:uuid}).exec(function(err,result){
            if(err){
                console.log(err);
                callback({success:false})
            }
            else{
            callback({success:true,address:result})
         }
        })
    }

    findAddressByid(id,callback){
        UserAddress.findOne({_id:id},function(err,address){
            if(err)
            {
                callback({success:false})

            }
            else{
                if(functions.isEmpty(address))
                {
                    callback({success:false})
                }
                else
                {
                    callback({success:true,address:address})
                }
            }
        })
    }


    
}

module.exports=new order()