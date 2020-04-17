const mongoose = require("mongoose");
const shortid = require("shortid");

var cartSchema  = new mongoose.Schema({
    uid:{
        type:String
    },
    iid:{
        type: String,
        required: true,
        default:shortid.generate
    },
    name:{
        type:String,
        required:true
    },
    image:{
        type:String
    },
    dateCreated: {
        type: Date,
        required: true,
        default: Date.now
    },

});

module.exports = mongoose.model("carts", cartSchema,"items");