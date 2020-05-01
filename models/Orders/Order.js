const mongoose = require("mongoose");
var shortid = require("shortid");
var mongooseHistory = require('mongoose-history')

// status
// 0: pending
// 1. approved
// 2: dispatched
// 3: placed
// 4: cancelled

var orderSchema  = new mongoose.Schema({
    uid:{
        type:String
    },

    orderId: {
        type: String,
        default: shortid.generate
    },

    orderedItems: [
        {
            quantity: Number,
            items: { 
                type : String, 
            },
        }
    ],

    deliveryAddress:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'delivery_address',
        required:true
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
    // estimatedDeliveryDate:{
    //     type: Date,
    // },
    // deliveredDate:{
    //     type: Date,
    // },
    // approvedDate:{
    //     type: Date,
    // },
    transaction_id:{
        type: String
    },
    user: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    cancelled_order: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'cancelled_order'
    }],
    review: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'review'
    }]
});

orderSchema.plugin(mongooseHistory)
module.exports = mongoose.model("order", orderSchema);