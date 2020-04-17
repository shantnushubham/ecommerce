const mongoose = require("mongoose");
var mongooseHistory = require('mongoose-history')

var categorySchema  = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    type:{
        type:String,
        required:true
    }
});
categorySchema.plugin(mongooseHistory)
module.exports = mongoose.model("category", categorySchema,"categories");