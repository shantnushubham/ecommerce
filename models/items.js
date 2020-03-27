const mongoose = require("mongoose");
const Schema = mongoose.Schema;
var itemsSchema  = new mongoose.Schema({
    
    active: {
        type: Boolean,
        required: true,
        default: true
    },
    price:{
        type:String,
        required:true,
    },
    name:{
        type:String,
        required:true
    },
    category_id:{
        type:ObjectId,
        required:true,

    },


});

module.exports = mongoose.model("items", itemsSchema,"items");