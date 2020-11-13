const mongoose = require("mongoose");
const shortid = require("shortid");
// var mongooseHistory = require('mongoose-history')

var codeSchema  = new mongoose.Schema({
    isPercent:{
        type:Boolean,
        required:true,
        default:true
    },
    code:{
        type:String,
        required:true,
        unique:true
    },
    discount:{
        type:Number,
        required:true,
        default:0
    },
    items:{
        type:[String],
        default:[]
    },
    active:{
        type:Boolean,
        default:true
    },
    forBusiness:{
        type:Boolean,
        default:false
    },
    used:{
        type:[String],
        default:[]
    }



});

// codeSchema.plugin(mongooseHistory)

module.exports = mongoose.model("offers", codeSchema,"offers");