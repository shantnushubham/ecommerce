const mongoose = require("mongoose");
var mongooseHistory = require('mongoose-history')

var reviewSchema  = new mongoose.Schema({
    orderId:{
        type:mongoose.Schema.Types.ObjectId,
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
    },
    items:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'items'
    }],
});
reviewSchema.plugin(mongooseHistory)
module.exports = mongoose.model("review", reviewSchema);