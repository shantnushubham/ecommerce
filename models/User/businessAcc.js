const mongoose = require("mongoose");
const shortid = require("shortid");

var businessSchema = new mongoose.Schema({
    uuid: {
        type: String,
        required: true
    },
    businessName: {
        type: String,
        required: true
    },
    businessCity: {
        type: String,
        required: true
    },
    businessState: {
        type: String,
        required: true
    },
    businessPin: {
        type: String,
        required: true
    },
    bid:{
        type:String,
        default:shortid.generate
    },
    isAccepted:{
        type:Boolean,
        default:false
    }
});
module.exports = mongoose.model("businessAcc", businessSchema, "businessAcc");
