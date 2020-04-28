var mongoose = require("mongoose");
var bcrypt = require('bcrypt-nodejs')
const shortid = require("shortid");    
var passportLocalMongoose=require("passport-local-mongoose");
var mongooseHistory = require('mongoose-history')
const crypto = require('crypto');

var UserSchema  = new mongoose.Schema({
    uuid:{
        type: String,
        required: true,
        default:shortid.generate
    },
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
    },
    active:{
        type: Boolean,
        default: false
    },
    phone: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String
    },
    defaultDeliveryAddress:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'delivery_address'
    },
    deliveryAddress:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'delivery_address'
    }],
    orders:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'order'
    }],
    cancelledOrder:[{
        type: mongoose.Schema.Types.ObjectId,
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
    }
});

UserSchema.methods.generatePasswordReset = function() {
    this.resetPasswordToken = crypto.randomBytes(20).toString('hex');
    this.resetPasswordExpires = Date.now() + 3600000; //expires in an hour
};

UserSchema.plugin(mongooseHistory)
UserSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", UserSchema);
