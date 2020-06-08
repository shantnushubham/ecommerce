const mongoose = require("mongoose");
const shortid = require("shortid");
var mongooseHistory = require('mongoose-history')

var codeSchema  = new mongoose.Schema({
    isReferral:{
        type:Boolean,
        required:true,
        default:true
    },
    code:{
        type:String,
        required:true,
    },
    discount:{
        type:Number,
        required:true,
        default:0
    }


});

codeSchema.plugin(mongooseHistory)

module.exports = mongoose.model("codes", codeSchema,"codes");