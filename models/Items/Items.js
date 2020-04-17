const mongoose = require("mongoose");
const shortid = require("shortid");
var mongooseHistory = require('mongoose-history')

var itemsSchema  = new mongoose.Schema({
    iid:{
        type: String,
        required: true,
        default:shortid.generate
    },
    name:{
        type:String,
        required:true
    },
    active: {
        type: Boolean,
        required: true,
        default: true
    },
    price:{
        type:Number,
        required:true,
    },
    category:{
        type:mongoose.Types.ObjectId,
        required:true,
        ref: 'category',
    },
    image:{
        type:String
    },
    metadata:{
        type: mongoose.Types.ObjectId,
        ref: 'items_metadata'
    },
    discount:{
        type:Number,
        default:0
    },
    sale:{
        type:Boolean,
        default:false
    },
    reviews:[{
        type: mongoose.Types.ObjectId,
        ref: 'review'
    }],
    dateCreated: {
        type: Date,
        required: true,
        default: Date.now
    },

});

itemsSchema.plugin(mongooseHistory)

module.exports = mongoose.model("item", itemsSchema);