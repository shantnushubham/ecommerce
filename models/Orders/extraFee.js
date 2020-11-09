const mongoose = require("mongoose");
var shortid = require("shortid");

var fee = new mongoose.Schema({
    charge:{
        type:Number,
        required:true,
        default:0
    },
    
    name:{
        type:String
    },
    active:{
        type:Boolean,
        default:false
    }

})
module.exports=mongoose.model("extraFee", fee, 'extraFee');