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
    uuid:{
        type:String,
        required:true
    },

    orderId: {
        type: String,
        required:true,
        default: shortid.generate
    },

    orderedItems: [
        {
            iid:{type:String},
            quantity:{type: Number},
        }
    ],
    
    total:{
        type:Number,
        required:true,
    },

    fullAddress:{
        type:String
    }, 
    city: {
        type:String,
        required: true
    },
    state: {
        type:String,
        required: true
    },
    pincode: {
        type:Number,
        required: true
    },
    purchaseTime:{
        type: Date,
        required: true,
        default: Date.now
    },
    country: {
        type:String,
        required: true
    },
    status:{
        type: String,
        default:'initialised'
    },
    instaPaymentRequestId:{
        type:String,
        default:''
    },
    instaPaymenturl:{
        type:String,
        default:''
    },
    instaPaymentId:{
        type:String,
        default:''
    },
    paid:{
        type:Boolean,
        required:true,
        default:false
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