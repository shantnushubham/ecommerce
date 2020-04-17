const mongoose = require("mongoose");
var mongooseHistory = require('mongoose-history')

// refundStatus
// 0 : pending
// 1: refunded
// 2:someError

var cancelledOrderSchema  = new mongoose.Schema({
    order_id:{
        type:mongoose.Types.ObjectId,
        required:true,
        ref: 'order'
    },
    paymentRefundStatus:{
        type:Number,
        required:true
    },
    reasonOfCancellation:{
        type: String
    }
});

cancelledOrderSchema.plugin(mongooseHistory)

module.exports = mongoose.model("cancelled_order", cancelledOrderSchema);