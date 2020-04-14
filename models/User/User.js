var mongoose = require("mongoose");
var bcrypt = require('bcrypt-nodejs')

var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema  = new mongoose.Schema({
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
    verified: {
        type: Boolean,
        default: false
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

UserSchema.pre('save', function (next) {
    var user = this
    if (this.isModified('password') || this.isNew) {
        bcrypt.genSalt(10, function (err, salt) {
            if (err) {
                return next(err)
            }
            bcrypt.hash(user.password, salt, null, function (err, hash) {
                if (err) {
                    return next(err)
                }
                user.password = hash
                next()
            })
        })
    } else {
        return next()
    }
})

UserSchema.methods.comparePassword = function (pass, callback) {
    bcrypt.compare(pass, this.password, function (err, isMatch) {
        if (err)
            return callback(err)
        callback(null, isMatch)
    })
}


UserSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", UserSchema);
