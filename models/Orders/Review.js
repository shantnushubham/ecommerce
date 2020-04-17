const mongoose = require("mongoose");

var reviewSchema  = new mongoose.Schema({
    orderId:{
        type:mongoose.Types.ObjectId,
        ref: 'order'
    },
    ratingScore:{
        type:Number,
        required:true
    },
    commentTitle:{
        type: String
    },
    comment:{
        type: String
    }
});

module.exports = mongoose.model("review", reviewSchema);