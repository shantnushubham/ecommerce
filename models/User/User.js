var mongoose = require("mongoose");
var bcrypt = require('bcrypt-nodejs')

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
    console.log(pass, this.password, 'df')
    bcrypt.compare(pass, this.password, (err, isMatch) => {
        if (err)
            return callback(err)
        callback(null, isMatch)
    })
}


module.exports = mongoose.model("User", UserSchema);
