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
    prefix:{
        type:Boolean,
        default:true
    },
    username: {
        type: String,
    },
    isAdmin : {
        type: Boolean,
        default: false
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
        
    },
    password: {
        type: String
    },
    code:{
        type:String,
        required:true,
        default:'invalid'
    },
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
    },
    isBusiness:{
        type:Boolean,
        default:false
    },
    premium:{
        type:Boolean,
        default:false
    },
    creditAllowed:{
        type:Boolean,
        default:false
    },
    credPerc:{
        type:Number,
        default:0
    },
    credBalance:{
        type:Number,
        default:0
    },
    /**
     * 112-admin
     * 1- base user (no authority)
     * 2-ops,
     * 3,4,5
     * 
     */
    level:{
        type:Number,
        default:1
    },
    state:{
        type:String,
        required:true,
        default:"jharkand"
    },
    daysToRemind:{
        type:Number,
        default:0
    }
});

UserSchema.methods.generatePasswordReset = function() {
    this.resetPasswordToken = crypto.randomBytes(20).toString('hex');
    this.resetPasswordExpires = Date.now() + 3600000; //expires in an hour
};

UserSchema.plugin(mongooseHistory)
UserSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", UserSchema);
