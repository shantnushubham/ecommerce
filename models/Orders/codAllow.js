const mongoose = require("mongoose");
var shortid = require("shortid");

var orderSchema = new mongoose.Schema({
    from:{
        type:Number,
        required:true,
        default:0
    },
    

})