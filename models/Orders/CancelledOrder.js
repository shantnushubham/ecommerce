const mongoose = require("mongoose");
var mongooseHistory = require('mongoose-history')
var shortid=require('shortid')

// refundStatus
// 0 : pending
// 1: refunded
// 2:someError

var cancelledOrderSchema = new mongoose.Schema({
    order_id: {
        type: String,
        required:true
    },
    paymentRefundStatus: {
        type: String,
        default:'pending'
    },
    cancellationStatus:{
        type:String,
        default:"cancellation processing",
        enum:['cancelled','cancellation processing']
    },
    uuid: {
        type:String,
        required:true

    },
    cancellationId:{
        type:String,
        default:shortid.generate
    },
    transaction_id: {
        type:String,
    },
    dateCreated:{
        type:Date,
        default:Date.now()
    }
});
cancelledOrderSchema.plugin(mongooseHistory)
module.exports = mongoose.model("cancelledOrders", cancelledOrderSchema, 'cancelledOrders');