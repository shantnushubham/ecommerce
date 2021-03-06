const mongoose = require("mongoose");
var mongooseHistory = require('mongoose-history')

var deliveryAddressSchema  = new mongoose.Schema({
    uuid:{
        type: String,
        required: true
    },
    locality:{
        type:String,
    },
    fullAddress:{
        type:String
    },
    email:{
        type:String,
        required: true
    },
    landmark: {
        type:String,
    },
    isDefault: {
        type: Boolean,
        default: false
    },
    district: {
        type:String,
    },
    state: {
        type:String,
        required: true
    },
    pincode: {
        type:Number,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    addressType: {
        type: String
    },
    country: {
        type:String,
        required: true
    },
    city:{
        type:String,
        required:true
    },
});
deliveryAddressSchema.plugin(mongooseHistory)
module.exports = mongoose.model("delivery_address", deliveryAddressSchema);