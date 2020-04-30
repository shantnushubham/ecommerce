const mongoose = require("mongoose");
const shortid = require("shortid");

var cartSchema  = new mongoose.Schema({
    uuid:{
        type:String
    },
    iid:{
        type: String,
        required: true,
        default:shortid.generate
    },
    
    quantity:{
        type:Number,
        required:true
    },
    dateCreated: {
        type: Date,
        required: true,
        default: Date.now
    },

});

module.exports = mongoose.model("carts", cartSchema,"cart");