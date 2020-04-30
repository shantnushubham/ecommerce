var itemMetaModel = require("../models/Items/ItemMetadata")
var itemmodel = require('../models/Items/Items')
var cartmodel = require('../models/cart/cart')
var ordermodel= require('../models/Orders/Order')
var functions = require('../Middlewares/common/functions')

var mongoose = require("mongoose")
class order
{
    constructor() {
        
    }

    createOrder(cartlist,total,uuid,callback)
    {
        ordermodel.create({uuid:uuid,total:total,orderedItems:cartlist,deliveryAddress:address},function(err,createdOrder){
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




    
}

module.exports=new order()