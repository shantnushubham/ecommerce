const mongoose = require("mongoose");
var mongooseHistory = require('mongoose-history')
var shortid=require('shortid')

// refundStatus
// 0 : pending
// 1: refunded
// 2:someError

var cancelledOrderSchema = new mongoose.Schema({
    order_id: {
        type: String
    },
    paymentRefundStatus: {
        type: String
    },
    cancellationStatus:{
        type:String,
        default:"cancellation processing",
        enum:['cancelled','cancellation processing']
    },
    uuid: {
        type:String
    },
    cancellationId:{
        type:String,
        default:shortid.generate
    }
});
cancelledOrderSchema.plugin(mongooseHistory)
module.exports = mongoose.model("cancelledOrders", cancelledOrderSchema, 'cancelledOrders');