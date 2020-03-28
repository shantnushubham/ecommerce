const mongoose = require("mongoose");

// const shortid = require("shortid");

var itemsSchema  = new mongoose.Schema({
    iid:{
        type: String,
        required: true,
        default:mongoose.Types.ObjectId
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
        type:String,
        required:true,
    },
    category:{
        type:mongoose.Types.ObjectId,
        required:true,
        ref: 'category',
    },
    stockCount:{
        type:Number,
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
    }]
});

module.exports = mongoose.model("item", itemsSchema);