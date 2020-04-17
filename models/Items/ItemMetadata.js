const mongoose = require("mongoose");
var mongooseHistory = require('mongoose-history')

var itemsMetaSchema  = new mongoose.Schema({
    iid:{
        type: String,
        required: true,
        default:mongoose.Types.ObjectId
    },
    content:{
        type:String,
        required:true
    },
    weight:{
        type:String,
        required:true
    },
    color:{
        type:String,
    }
});
itemsMetaSchema.plugin(mongooseHistory)
module.exports = mongoose.model("items_metadata", itemsMetaSchema,"itemsMeta");