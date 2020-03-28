const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const shortid = require("shortid");
var itemsSchema  = new mongoose.Schema({
    
    iid:{
        type: String,
        required: true,
        default:mongoose.Types.ObjectId
    },
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
    category:{
        type:String,
        required:true,
        default:"spice"
    },
    image:{
        type:String
    },
    discount:{
        type:Number,
        default:0
    },
    sale:{
        type:Boolean,
        default:false
    },
    dateCreated: {
        type: Date,
        required: true,
        default: Date.now
    },

});

module.exports = mongoose.model("items", itemsSchema,"items");