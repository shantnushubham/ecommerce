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
        type:String
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

    deliveryAddress:{
        type: String,
        required: true
    },

    purchaseTime:{
        type: Date,
        required: true,
        default: Date.now
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
    }

    
});

orderSchema.plugin(mongooseHistory)
module.exports = mongoose.model("order", orderSchema);