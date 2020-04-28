const mongoose = require("mongoose");
var shortid = require("shortid");
var mongooseHistory = require('mongoose-history')

// status
// 0: pending
// 1. approved
// 2: dispatched
// 3: placed
// 4:cancelled

var orderSchema  = new mongoose.Schema({
    uid:{
        type:String
    },
    iid:{
        type: String,
        required: true,
        default:shortid.generate
    },
    quantity:{
        type:Number,
        required:true
    },
    deliveryAddress:{
        type:mongoose.Types.ObjectId,
        ref: 'delivery_address',
        required: true
    },
    purchaseTime:{
        type: Date,
        required: true,
        default: Date.now
    },
    status:{
        type: Number,
        required: true
    },
    estimatedDeliveryDate:{
        type: Date,
    },
    deliveredDate:{
        type: Date,
    },
    approvedDate:{
        type: Date,
    },
    isPaymentOnline: {
        type: Boolean,
        required: true
    },
    isPaymentOffline: {
        type: Boolean,
        required: true
    },
    isOnlinePaymentSuccessful : {
        type: Boolean,
        required: true,
        default: false,
    },
    transaction_id:{
        type: String
    }
});

orderSchema.plugin(mongooseHistory)
module.exports = mongoose.model("order", orderSchema);