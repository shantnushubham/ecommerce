var User = require("../../models/User/User")
var UserAddress = require("../../models/User/DeliveryAddress")
// var Generator = require("../../common/Generator")
var mongoose = require('mongoose')
const bcrypt = require('bcryptjs');
const passport = require('passport');
var ObjectId = require('mongoose').Types.ObjectId;
var sendgrid = require("@sendgrid/mail");
require('dotenv').config()
const envData = process.env
sendgrid.setApiKey(envData.sendgrid_apikey);
const axios = require('axios');
const orderServices = require('../../openServices/order')
const businessReg = require('../../models/User/businessAcc')
const functions = require('../../Middlewares/common/functions')
const mailer = require('../common/Mailer')

exports.register = (req, res) => {
    const { password, password2, phone } = req.body;
    const { pincode } = req.body.address;
    let errors = [];
    if (phone.length < 10) {
        errors.push({ msg: 'Invalid phone number' });
    } else if (pincode.length !== 6) {
        errors.push({ msg: 'Invalid pincode' });
    } else if (password.length < 6) {
        errors.push({ msg: 'Password must be at least 6 characters' });
    } else if (password != password2) {
        errors.push({ msg: 'Passwords do not match' });
    }

    if (errors.length > 0) {
        req.flash('error_msg', errors[0].msg);
        res.redirect('/users/register');
    } else {
        orderServices.createVoucherCode(5, 5, true, 0.15, function (discode) {
            {

                req.body.user['username'] = req.body.email;
                req.body.user['email'] = req.body.email;
                req.body.user['phone'] = req.body.phone;
                req.body.user['active'] = true;

                req.body.address['email'] = req.body.email;
                req.body.address['phone'] = req.body.phone;
                req.body.address['isDefault'] = true;
                req.body.user["state"]=req.body.address["state"]
                if (discode.success == false)
                    req.body.user['code'] = 'invalid'
                else
                    req.body.user['code'] = discode.code
                // console.log(req.body.user, req.body.address);

                var u = new User(req.body.user);
                User.register(new User(u), req.body.password, function (err, user) {
                    if (err) {
                        console.log(err);
                        req.flash('error_msg', 'Email already exist');
                        res.redirect('/users/register');
                    }
                    req.body.address['uuid'] = user.uuid;
                    var newAddress = new UserAddress(req.body.address);
                    newAddress.save((err, addressRes) => {
                        if (err) {
                            console.log(err);
                            req.flash('error_msg', 'unable to save address');
                            res.redirect('/users/register');
                        }
                        passport.authenticate("local")(req, res, function () {
                            console.log(user)
                            mailer.Register(user.email,user.name,user.uuid,function(mailed){
                                console.log(mailed);
                            })
                        });
                    });
                })
            }
        })
    }
}

exports.login = (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
}

exports.logout = (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
}

exports.recover = (req, res) => {
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) return res.status(401).json({ message: 'The email address ' + req.body.email + ' is not associated with any account. Double-check your email address and try again.' });

            user.generatePasswordReset();
            user.save()
                .then(user => {
                    // send email
                    let link = "http://" + req.headers.host + "/reset/" + user.resetPasswordToken;
                    mailer.forgotPassword(user.email, user.resetPasswordToken, function (emailed) {
                        req.flash('success', 'check email for token')
                        res.redirect('/recover')
                    })

                })
                .catch(err => {
                    req.flash('error', 'some error occurred')
                    res.redirect('/recover')
                });
        })
        .catch(err => {
            req.flash('error', 'could not find user')
            res.redirect('/recover')
        });
};

exports.reset = (req, res, next) => {
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } })
        .then((user) => {
            if (!user) return res.status(401).json({ msg: 'Password reset token is invalid or has expired.' });

            //Redirect user to form with the email address
            return next();
        })
        .catch(err => {
            req.flash('error', 'error in getting user')
            res.redirect('/')
        });
};


exports.resetPassword = (req, res) => {
    if (req && req.body && req.body.password && req.body.password2) {
        if (req.body.password === req.body.password2) {
            User.findOne({ resetPasswordToken: req.body.token, resetPasswordExpires: { $gt: Date.now() } })
                .then((user) => {
                    if (!user) {
                        req.flash('error', 'Password reset token is invalid or has expired.')
                        res.redirect('/')
                    }

                    user.setPassword(req.body.password, function (err) {
                        user.resetPasswordToken = undefined;
                        user.resetPasswordExpires = undefined;

                        user.save(function (err) {
                            if (err) {
                                req.flash('error', 'some error occured')
                                res.redirect('/')
                            }
                            else {
                                mailer.changedPassword(user.email, function (sentmail) {
                                    if (sentmail.success == false)
                                        req.flash('error', 'error in updating')
                                    else
                                        req.flash('success', 'success')
                                    res.redirect('/')
                                })
                            }

                        });
                    })
                });
        }
        else {
            req.flash('error', 'Password doesn\'t match')
            res.redirect('/')
        }
    }
};

exports.showUserSection = (req, res) => {
    res.render("adminUserSection");
}

exports.getUserById = (req, res) => {
    User.findOne({ uuid: req.params.uuid }, function (err, foundUser) {
        if (err) {
            req.flash('error', 'could not fetch')
            res.redirect('/admin/users')
        }
        else {
            res.render('userDetailsAdmin', { user: foundUser })
        }
    })
}

exports.getAllUsers = function (req, res) {
    User.find({}, function (err, foundUser) {
        if (err) {
            req.flash('error', 'could not fetch')
            res.redirect('/admin/userNotFound')
        }
        else {
            res.render('userPeek', { user: foundUser })
        }
    })
}

exports.getAllIndividual=function(req,res)
{
    User.find({isBusiness:false,isPremium:false}, function (err, foundUser) {
        if (err) {
            req.flash('error', 'could not fetch')
            res.redirect('/admin/userNotFound')
        }
        else {
            res.render('userPeek', { user: foundUser })
        }
    })
}
exports.deleteUserById = (req, res) => {
    User.findOneAndRemove({ uuid: req.user.uuid }, err => {
        if (err) return res.status(400).send({ error: err })
        return res.send({ success: true, message: 'Account Deleted' })
    })
}

exports.getUpdateProfile = (req, res) => {
    res.render('updateProfile')
}

exports.updateUserData = (req, res) => {
    if (req && req.user && req.body) {
        const updatedData = {
            name: req.body.name,
            phone: req.body.phone
        }
        User.findOneAndUpdate({ uuid: req.user.uuid }, updatedData, { new: true })
            .then((data) => {
                req.flash('success', 'Profile updated')
                res.redirect('/users/update-profile')
            })
    } else {
        req.flash('error', 'Profile not updated')
        res.redirect('/users/update-profile')
    }
}

// exports.addUserAddress = (req, res) => {
//     if(req && req.user && req.body){
//       var address = new UserAddress(req.body)
//       address.save((err, result) => {
//           if(err) res.status(400).send({error:err})
//           else if(!result) res.json({success: false, message: 'Unable to save'});

//           User.findOneAndUpdate({ uuid: req.user.uuid}, { $addToSet: { deliveryAddress: result._id }, defaultDeliveryAddress: result._id }, {new: true})
//           .select('name email phone username')
//           .populate('defaultDeliveryAddress deliveryAddress', 'locality landmark state district pincode contact')
//               .then((err, data) => {
//                 if(err) return res.status(400).send({ success: false, errors: "unable to add User address"})
//                 return res.send({success: true, message: 'Address Added', body: data})
//               })
//       })
//     }
//     else return res.send({success: false, message: "data insufficient"})
// }

exports.addDefaultUserAddress = (req, res) => {
    const { phone, pincode } = req.body.address
    let errors = [];

    if (phone.length < 10) {
        errors.push({ msg: 'Invalid phone number' });
    }
    else if (pincode.length !== 6) {
        errors.push({ msg: 'Invalid pincode' });
    }

    if (errors.length > 0) {
        // console.log(errors)
        req.flash('error_msg', errors[0].msg);
        res.redirect('/address');
    }
    else {
        req.body.address['uuid'] = req.user.uuid;
        req.body.address['isDefault'] = true;

        var address = new UserAddress(req.body.address)
        address.save((err, result) => {
            if (err) return res.status(400).send({ error: err })
            else if (!result) {
                req.flash('error_msg', 'Unable to add address');
                res.redirect('/');
            }
            var updateData = {
                defaultDeliveryAddress: result._id,
                active: true
            }
            User.update(
                { uuid: req.user.uuid },
                updateData,
                { new: true }
            )
                .exec(err => {
                    if (err) {
                        req.flash('error_msg', 'Unable to add address');
                        res.redirect('/address');
                    }
                    else
                        res.redirect('/')
                })
        })
    }
}

exports.addUserAddress = (req, res) => {
    const { phone, pincode } = req.body.address
    let errors = [];

    if (phone.length < 10) {
        errors.push({ msg: 'Invalid phone number' });
    }
    else if (pincode.length !== 6) {
        errors.push({ msg: 'Invalid pincode' });
    }

    if (errors.length > 0) {
        // console.log(errors)
        req.flash('error_msg', errors[0].msg);
        res.redirect('/address');
    }
    else {
        req.body.address['uuid'] = req.user.uuid
        UserAddress.create(req.body.address, function (err, result) {
            if (err) {
                req.flash('error_msg', 'Unable to add address');
                res.redirect('/address');
            }
            else {
                if (!result) {
                    req.flash('error_msg', 'Unable to add address');
                    res.redirect('/address');
                }
                else {
                    User.findOneAndUpdate({ uuid: req.user.uuid }, { active: true }, function (err, updated) {
                        if (err) {
                            req.flash('success_msg', 'error in updating user')
                            res.redirect('/');
                        }
                        else {
                            req.flash('success_msg', 'succesfully added address')
                            res.redirect('/');
                        }
                    })

                }
            }


        })
    }
}

exports.updateUserAddress = (req, res) => {
    if (req && req.query && req.body) {
        const updatedData = req.body;
        UserAddress.findByIdAndUpdate({ _id: req.query.id }, updatedData, { new: true })
            .select('locality email landmark state district pincode contact country')
            .then((data) => {
                return res.send({ success: true, message: 'Address Updated', body: data })
            }
            )
    }
    else return res.send({ success: false, message: "data insufficient" })
}

exports.getUserAddress = (req, res) => {
    UserAddress.find({ uuid: req.user.uuid }).exec(function (err, result) {
        if (err) {
            console.log(err);
            req.flash('error', 'error in fetching cart')
            res.redirect('/address')
        }
        else {
            console.log(result)
            req.flash('success_msg', 'result fetched check in console')
            res.redirect('/address')
        }
    })
}

exports.deleteAddress = (req, res) => {
    console.log(req.user)
    console.log(req.body)
    if (req && req.body && req.body.addressId) {
        const addressId = new Object(req.body.addressId);
        if (addressId === req.user.defaultDeliveryAddress) {
            return res.json({ success: false, message: "Default Address Can't be deleted. You can update it or set other addressas default address and delete it" });
        }
        else {
            UserAddress.findOneAndRemove({ _id: addressId }, err => {
                if (err) {
                    console.log(err)
                    return res.status(400).send({ success: false, message: 'wrong address id' });
                }
                User.findOneAndUpdate({ uuid: req.user.uuid }, { $pull: { deliveryAddress: addressId } })
                    .then((err, data) => {
                        if (err) {
                            console.log(err)
                            return res.status(400).send({ success: false, message: 'unable to address id', error: err });
                        }
                        return res.json({ success: true, body: data, message: 'address removed from user' });
                    });
            })
        }
        // UserAddress.findOneAndRemove({_id: addressId}, err => {
        //     if(err) res.status(400).send({error:err})
        //     User.findOne({ _id: req.user._id })
        //         .select('defaultDeliveryAddress')
        //         .exec( (err, results) => {
        //           console.log('hell')
        //             if (err) return res.state(400).send({ success: false, message: 'unable to remove participant' });

        //             if (results && results._id === req.user._id) return res.json({ success: false, message: "Default Address Can't be deleted. You can update it." });

        //             else {
        //               console.log('hell', results)

        //                 User.findOneAndUpdate({ email: results.email}, { $pull: { deliveryAddress: addressId } }, (err) => {
        //                     if (err) return res.state(400).send({ success: false, message: 'unable to remove participant' });
        //                     res.json({ success: true, message: 'event removes from participant' });
        //                 });
        //             }
        //         })
        // })
    }
    else { return res.send({ success: false, message: "data insufficient" }) }
}

exports.makeAdressToDefaultAddress = (req, res) => {
    if (req && req.body && req.body.addressId) {
        const addressId = req.body.addressId;
        UserAddress.findOneAndUpdate({ uuid: req.user.uuid, isDefault: true }, { isDefault: false })
            .then(err => {
                if (err) return console.log('hellp', err)
                UserAddress.findOneAndUpdate({ _id: addressId }, { isDefault: true })
                    .then(err => {
                        if (err) return console.log('error', err)
                        else return console.log('success')
                    })
            })
    }
    else return res.send({ success: false, message: "data insufficient" })
}


// check pincode valid
exports.checkPinCodeValid = (req, res) => {
    const { pincode } = req.body;
    // change it when available
    const token = ''
    axios({
        method: 'get',
        url: 'https://track.delhivery.com/c/api/pin-codes/output/?token=&filter_codes=',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`
        }
    })
        .then(function (result) {
            console.log(result);
            req.flash('success_msg', 'OTP is' + result.message)
            res.redirect('/');
        })
        .catch(err => {
            console.log(err);
            req.flash('error', 'Unable to validate otp')
            res.redirect('/')
        });
}

exports.getBusinessAccountReg = function (req, res) {
    businessReg.findOne({ uuid: req.user.uuid }, function (err, foundB) {
        if (err) {
            req.flash('error', 'error in Servers.Try later')
            res.redirect('/')
        }
        else {
            if (functions.isEmpty(foundB))
                res.render('businessAccountReg')
            else {
                req.flash('error', 'request has already been sent')
                res.redirect('/')
            }
        }
    })
}
exports.postBusinessAccReg = function (req, res) {
    console.log(req.body)
    var data = {
        uuid: req.user.uuid,
        businessPhone: req.body.businessPhone,
        businessEmail: req.body.businessEmail,
        businessAddress: req.body.businessAddress,
        businessName: req.body.businessName,
        businessCity: req.body.businessCity,
        businessState: req.body.businessState,
        businessPin: req.body.businessPin,
        gstNumber: req.body.gstNumber,
        panNumber: req.body.panNumber,
        authorizedSignatoryName: req.body.authorizedSignatoryName

    }
    businessReg.create(data, function (err, createdB) {
        if (err) {
            console.log(err);
            req.flash('error', 'error in creating request')

        }
        else
            req.flash('success', 'request sent')
        res.redirect('/')
    })
}

exports.getAllBizReq = function (req, res) {
    businessReg.find({}, function (err, foundB) {
        if (err) {
            console.log(err)
            req.flash('error', 'error could not find in db')
            res.redirect('/admin')
        } else
            res.render('adminBizReq', { list: foundB })

    })
}

exports.acceptedBusinessAccounts = function (req, res) {
    businessReg.aggregate([
        { $match: { isAccepted: true } },
        { $lookup: { from: 'User', localField: 'uuid', foreignField: 'uuid', as: 'user' } },
        {
            $project: {
                "uuid":"$uuid",
                "businessName":"$businessName",
                "gstNumber":"$gstNumber",
                "panNumber":"$panNumber",
                "authorizedSignatoryName":"$authorizedSignatoryName",
                "businessPhone":"$businessPhone",
                "businessAddress":"$businessAddress",
                "user": { "$arrayElemAt": ["$user", 0] }
            }
        }]).exec(function (err, foundB) {
            console.log(foundB);
            if (err) {
                console.log(err)
                req.flash('error', 'error could not find in db')
                res.redirect('/admin')
            } else
                res.render('bizAccList', { list: foundB })

        })
}

exports.getAdminPA = function (req, res) {
    res.render('premiumAccount', { uuid: req.params.uuid })
}

exports.postAdminPA = function (req, res) {
    var credPerc = req.body.credPerc, credBalance = req.body.credBalance
    if (credPerc == 0 || credBalance == 0)
        res.redirect('/users/business-accounts/accepted')
    else {
        User.findOneAndUpdate({ uuid: req.params.uuid }, { credPerc: credPerc, credBalance: credBalance, premium: true, isBusiness: true }, function (err, updatedUser) {
            if (err) {
                req.flash('error', 'error in db')
                res.redirect('/users/business-accounts/accepted')
            }
            else {
                req.flash('success', 'success')
                res.redirect('/users/business-accounts/accepted')
            }
        })

    }
}

exports.getAllPA = function (req, res) {
    User.find({ isBusiness: true, premium: true }, function (err, foundB) {
        if (err) {
            console.log(err)
            req.flash('error', 'error could not find in db')
            res.redirect('/admin')
        } else
            res.render('adminBizReq', { list: foundB })

    })
}

exports.acceptBizReq = function (req, res) {
    businessReg.findOneAndUpdate({ bid: req.params.bid }, { isAccepted: true }, function (err, updatedB) {
        if (err) {
            req.flash('error', 'request could not be processed')
            res.redirect('/users/business-account')
        }
        else {
            User.findOneAndUpdate({ uuid: updatedB.uuid }, { isBusiness: true }, function (err, updatedU) {
                if (err) {
                    req.flash('error', 'request could not be processed.user not updated')
                    res.redirect('/users/business-account')
                }
                else {
                    req.flash('success', 'success')
                    res.redirect('/users/business-account')
                }
            })
        }
    })
}
exports.revokeBizAcc = function (req, res) {
    businessReg.findOneAndUpdate({ bid: req.params.bid }, { isAccepted: false }, function (err, updatedB) {
        if (err) {
            req.flash('error', 'request could not be processed')
            res.redirect('/users/business-account')
        }
        else {
            User.findOneAndUpdate({ uuid: updatedB.uuid }, { isBusiness: false }, function (err, updatedU) {
                if (err) {
                    req.flash('error', 'request could not be processed.user not updated')
                    res.redirect('/users/business-account')
                }
                else {
                    req.flash('success', 'success')
                    res.redirect('/users/business-account')
                }
            })
        }
    })
}

exports.getBizReqByStatus = function (req, res) {
    var st = req.params.status == 'true' ? true : false;
    businessReg.find({ isAccepted: st }, function (err, foundB) {
        if (err) {
            req.flash('error', 'error could not find in db')
            res.redirect('/admin')
        } else
            res.render('adminBizReq', { list: foundB })

    })
}

exports.allowCredit = function (req, res) {
    User.findOne({ uuid: req.params.uuid, isBusiness: true }, function (err, foundBiz) {
        if (err || functions.isEmpty(foundBiz)) {
            req.flash('error', 'error in fetching user')
            res.redirect('/admin')
        }
        else {
            User.findOneAndUpdate({ uuid: req.params.uuid }, { creditAllowed: true }, function (err, updated) {
                if (err) { req.flash('error', 'error in updating') }
                else
                    req.flash('success', 'success')
                res.redirect('/admin')
            })
        }

    })
}
