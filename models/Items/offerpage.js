const mongoose = require("mongoose");
// var mongooseHistory = require('mongoose-history')

var offerSchma  = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    cover:[String],
    data:{
        type:String
    }
});
// categorySchema.plugin(mongooseHistory)
module.exports = mongoose.model("offerpage", offerSchma,"offerpage");