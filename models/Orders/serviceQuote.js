const mongoose = require("mongoose");
const shortid = require("shortid");
// var mongooseHistory = require('mongoose-history')

var quoteSchema = new mongoose.Schema({
    quoteId: {
        type: String,
        default: shortid.generate

    },
    uuid: {
        type: String
    },
    businessName: {
        type: String,
        default:undefined
    },
    businessCity: {
        type: String,
        default:undefined
    },
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true

    },
    email: {
        type: String,
        required: true

    },
    dateCreated:{
        type:Date,
        default:Date.now
    },
    iid:{
        type:String,
        required:true
    },
    units:{
        type:Number,
        required:true
    },
    measurementUnit:{
        type:String,
        default:"units"
    },
    serviced:{
        type:Boolean,
        default:false
    }

});

// codeSchema.plugin(mongooseHistory)

module.exports = mongoose.model("serviceQuotes", quoteSchema, "serviceQuotes");