const mongoose = require("mongoose");
const shortid = require('shortid');

var vendorSchema = new mongoose.Schema({
    vendorId: {
        type: String,
        default: shortid.generate
    },
    vendorName: {
        type: String,
        required: true
    }, address: {
        type: String,

    }, city: {
        type: String,
        required: true
    }, state: {
        type: String,
        required: true
    }, phone: {
        type: String,

    }, email: {
        type: String,

    },
    pickup_location:{
        type:String,
        required:true
    }

})
module.exports = mongoose.model("vendors", vendorSchema, "vendors");