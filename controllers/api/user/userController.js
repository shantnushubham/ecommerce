var User = require("../../../models/User/User")
var UserAddress = require("../../../models/User/DeliveryAddress")
var Generator = require("../../common/Generator")
var mailer = require("../../common/Mailer")

exports.register = function (req, res) {
    if (req.body && req.body.email && req.body.name && req.body.password) {
        if(req.body.password === req.body.confirmPassword){
            if (req.body.name) {
                req.body.name = req.body.name.trim()
            }
            if (req.body.email) {
                req.body.email = req.body.email.toLowerCase()
                req.body.email = req.body.email.trim()
            }
            var otp = Generator.generateOTP()
            var data = {
                name: req.body.name,
                email: req.body.email,
                phone: req.body.phone || null,
                password: req.body.password,
                otp: otp
            }
            var newUser = User(data)
            console.log(newUser)
            newUser.save(function (err, user) {
                // console.log(user,"save parameter")
                if (err) {
                    console.log(err)
                    return res.status(400).json({ success: false, message: 'Email already exists', already: true })
                } else if (!user) {
                    return res.json({ success: false, message: 'Unable to save' })
                } else {
                    mailer.Register({
                        name: user.name,
                        email: user.email,
                        otp: otp
                    });
                    res.json({ success: true, message: 'Successfully Registered!!' })
                }
            })
        }
        else return res.json({success: false, message: 'Password doesn\'t match'})
    }
}

exports.login = (req, res) => {
    if (req.body) {
        if (req.body.email) {
            req.body.email = req.body.email.toLowerCase()
            req.body.email = req.body.email.trim()
        }
        if (req.body.email && req.body.password) {
            User.findOne({email: req.body.email})
                .select('email verified name username phone password')
                .exec(function (err, user) {
                    if (err) return res.status(400).send({ success: false, message: 'Authentication failed. Error.' })
                    if (!user) {
                        return res.status(400).send({ success: false, message: 'No user found with this email.', notExists: true })
                    } else {
                        user.comparePassword(req.body.password, (err, isMatch)  => {
                            console.log(isMatch)
                            console.log(err)
                            if (isMatch && !err) {
                                if (user.verified) return res.json({ success: true, message: 'Successfully Authenticated', body: body, verified: true })
                                else return res.json({ success: false, message: 'Email Not Verified', verified: false })
                            } 
                            else return res.json({ success: false, message: 'Wrong password.' })
                        })
                    }
                })
        } else return res.status(400).send({ success: false, message: 'Invalid Data' })
    } else return res.status(400).send({ success: false, message: 'Invalid Data' })
}

exports.getUserById = (req, res) => {
    User.findOne({_id: req.params.id})
        .select()
        .exec((err, user) => {
            if(err) res.status(400).send({err: err})
            else if(!user) res.send({success:false, message: 'User not found'})
            res.send({success: true, body: user})
        })
}

exports.deleteUserById = (req, res) => {
    User.findOneAndRemove({_id: req.params.id}, err => {
        if(err) res.status(400).send({error:err})
        res.send({success: true, message: 'Account Deleted'})
    })
}

exports.updateUserData = (req, res) => {
    const updatedData = req.body.data;
    User.findByIdAndUpdate({_id: req.params.id}, updatedData, {new: true} )
        .then((err, data) => {
        if(err) res.status(400).send({error:err})
        res.send({success: true, message: 'Data Updated', body: data})
    })
}

exports.addUserAddress = (req, res) => {
    var address = new UserAddress(res.data.body)
    address.save((err, result) => {
        if(err) res.status(400).send({error:err})
        else if(!result) res.json({success: false, message: 'Unable to save'});

        User.findOneAndUpdate({ _id: req.params._id}, { $addToSet: { deliveryAddress: result._id }, defaultDeliveryAddress: result._id }, {new: true})
            .then((err, data) => {
                if(err) res.status(400).send({success: false, error:err})
                res.send({success: true, message: 'Address Added', body: data})
            })
    })
}

exports.updateUserAddress = (req, res) => {
    const updatedData = req.body.data;
    UserAddress.findByIdAndUpdate({_id: req.params.id}, updatedData, {new: true} )
        .then((err, data) => {
        if(err) res.status(400).send({error:err})
        res.send({success: true, message: 'Address Updated', body: data})
    })
}

exports.deleteAddress = (req, res) => {
    const addressId = req.body.addressId;
    UserAddress.findOneAndRemove({_id: addressId}, err => {
        if(err) res.status(400).send({error:err})
        User.findOne({ _id: user.defaultDeliveryAddress })
            .select('defaultDeliveryAddress')
            .exec( (err, results) => {
                if (err) return res.state(400).send({ success: false, message: 'unable to remove participant' });

                if (results && results._id === req.params._id) return res.json({ success: false, message: "Default Address Can't be deleted. You can update it." });

                else {

                    User.findOneAndUpdate({ email: results.email}, { $pull: { deliveryAddress: addressId } }, (err) => {
                        if (err) return res.state(400).send({ success: false, message: 'unable to remove participant' });
                        res.json({ success: true, message: 'event removes from participant' });
                    });
                }
            })
    })
}

exports.makeAdressToDefaultAddress = (req, res) => {
    const addressId = req.body.addressId;

    User.findByIdAndUpdate({_id: req.params.id}, { defaultDeliveryAddress: addressId }, {new: true} )
        .then((err, data) => {
        if(err) res.status(400).send({error:err})
        res.send({success: true, message: 'Updated default address.', body: data})
    })
}

