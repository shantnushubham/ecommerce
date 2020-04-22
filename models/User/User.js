var mongoose = require("mongoose");
var bcrypt = require('bcrypt-nodejs')
const shortid = require("shortid");
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
    }
});

UserSchema.pre('save', (next) => {
    var user = this
        bcrypt.genSalt(10, function (err, salt) {
            if (err) {
                return next(err)
            }
            bcrypt.hash(user.password, salt, null, function (err, hash) {
                if (err) {
                    return next(err)
                }
                console.log(hash)
                user.password = hash
                next()
            })
        })
   
})

UserSchema.methods.comparePassword =  (pass, callback) => {
    bcrypt.compare(pass, this.password, (err, isMatch) => {
        if (err)
            return callback(err)
        callback(null, isMatch)
    })
}

UserSchema.methods.generatePasswordReset = function() {
    this.resetPasswordToken = crypto.randomBytes(20).toString('hex');
    this.resetPasswordExpires = Date.now() + 3600000; //expires in an hour
};

UserSchema.plugin(mongooseHistory)

module.exports = mongoose.model("User", UserSchema);
