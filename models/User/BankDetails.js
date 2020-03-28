const mongoose = require("mongoose");

var bankDetailsSchema  = new mongoose.Schema({
    accountHolderName:{
        type:String,
        required:true
    },
    cardNo:{
        type:String,
        required:true
    },
    expiryDate:{
        type:String,
        required:true
    },
    addedAt:{
        type:Date,
        default: Date.now
    }
});

module.exports = mongoose.model("bank_details", bankDetailsSchema);