const mongoose = require("mongoose");

var deliveryAddressSchema  = new mongoose.Schema({
    locality:{
        type:String,
    },
    email:{
        type:String,
        required: true
    },
    landmark: {
        type:String,
    },
    district: {
        type:String,
        required: true
    },
    state: {
        type:String,
        required: true
    },
    pinCode: {
        type:Number,
        required: true
    },
    contact: {
        type: String,
        required: true
    },
    country: {
        type:String,
        required: true
    }
});

module.exports = mongoose.model("delivery_address", deliveryAddressSchema);