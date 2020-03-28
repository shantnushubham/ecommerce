var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var userSchema  = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    defaultDeliveryAddress:{
        type: mongoose.Types.ObjectId,
        ref: 'delivery_address'
    },
    deliveryAddress:[{
        type: mongoose.Types.ObjectId,
        ref: 'delivery_address'
    }],
    orders:[{
        type: mongoose.Types.ObjectId,
        ref: 'order'
    }],
    cancelledOrder:[{
        type: mongoose.Types.ObjectId,
        ref: 'cancelled_order'
    }],
    googleUserId: {
        type: String
    },
    facebookId: {
        type: String
    },
    dateCreated: {
        type: Date,
        required: true,
        default: Date.now
    },
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpires: {
        type: String
    },
});

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", userSchema);
