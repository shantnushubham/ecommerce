var User = require("../../models/User/User")
var UserAddress = require("../../models/User/DeliveryAddress")
// var Generator = require("../../common/Generator")
var mailer = require("../common/Mailer")
var mongoose=require('mongoose')
const bcrypt = require('bcryptjs');
const passport = require('passport');
var ObjectId = require('mongoose').Types.ObjectId;
var sendgrid = require("@sendgrid/mail");
require('dotenv').config()
const envData=process.env
sendgrid.setApiKey(envData.sendgrid_apikey);
const axios = require('axios');
const orderServices=require('../../openServices/order')

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
      orderServices.createVoucherCode(5,5,true,0.15,function(discode){
        {
          
          req.body.user['username'] = req.body.email;
          req.body.user['email'] = req.body.email;
          req.body.user['phone'] = req.body.phone;
          req.body.user['active'] = true;
    
          req.body.address['email'] = req.body.email;
          req.body.address['phone'] = req.body.phone;
          req.body.address['isDefault'] = true;
          if(discode.success==false)
          req.body.user['code']='invalid'
          else
          req.body.user['code']=discode.code
          // console.log(req.body.user, req.body.address);
          
          var u = new User(req.body.user);
          User.register(new User(u), req.body.password, function(err, user){
              if(err){
                  console.log(err);
                  req.flash('error_msg', 'Email already exist');
                  res.redirect('/users/register');
              }
              req.body.address['uuid'] = user.uuid;
              var newAddress = new UserAddress(req.body.address);
              newAddress.save( (err, addressRes) => {
                if(err) {
                  console.log(err);
                  return req.flash('error_msg', 'unable to save address');
                }
                passport.authenticate("local")(req, res, function(){
                  console.log(user)
                  const mailOptions = {
                      to: user.email,
                      from: 'support@inversion.co.in',
                      subject: "successfully registered",
                      text: `Hi ${user.name} \n 
                        You have been successfully registered.`
                  };
                  sendgrid.send(mailOptions, (error, result) => {
                      if (error) {
                        console.log(error)
                        return res.status(500).json({message: error.message});
                      }
                      console.log('f')
                      res.redirect('/');
                  });
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
    User.findOne({email: req.body.email})
        .then(user => {
            if (!user) return res.status(401).json({message: 'The email address ' + req.body.email + ' is not associated with any account. Double-check your email address and try again.'});

            user.generatePasswordReset();
            user.save()
                .then(user => {
                    // send email
                    let link = "http://" + req.headers.host + "/reset/" + user.resetPasswordToken;
                    const mailOptions = {
                        to: user.email,
                        from: 'support@inversion.co.in',
                        subject: "Password change request",
                        text: `Hi ${user.username} \n 
                    Please click on the following link ${link} to reset your password. \n\n 
                    If you did not request this, please ignore this email and your password will remain unchanged.\n`,
                    };
                    sendgrid.send(mailOptions, (error, result) => {
                        if (error) {
                          console.log(error)
                          return res.status(500).json({message: error.message});
                        }
                        req.flash(
                          'success_msg',
                          'A reset email has been sent to ' + user.email + '.' 
                        );
                        res.redirect('/recover');
                    });
                })
                .catch(err => res.status(500).json({message: err.message}));
        })
        .catch(err => res.status(500).json({message: err.message}));
};

exports.reset = (req, res, next) => {
    User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}})
        .then((user) => {
            if (!user) return res.status(401).json({msg: 'Password reset token is invalid or has expired.'});

            //Redirect user to form with the email address
            return next();
        })
        .catch(err => {
          console.log(err)
          return res.status(500).json({msg: err.message})});
};


exports.resetPassword = (req, res) => {
    if(req && req.body && req.body.password && req.body.password2){
      if(req.body.password === req.body.password2){
        User.findOne({resetPasswordToken: req.body.token, resetPasswordExpires: {$gt: Date.now()}})
        .then((user) => {
            if (!user) return res.status(401).json({msg: 'Password reset token is invalid or has expired.'});
            
            user.setPassword(req.body.password, function(err) {
              user.resetPasswordToken = undefined;
              user.resetPasswordExpires = undefined;

              user.save(function(err) {
                  if (err) return res.status(500).json({msg: err.message});
                  const mailOptions = {
                      to: user.email,
                      from: 'support@inversion.co.in',
                      subject: "Your password has been changed",
                      text: `Hi ${user.username} \n 
                      This is a confirmation that the password for your account ${user.email} has just been changed.\n`
                  };

                  sendgrid.send(mailOptions, (error, result) => {
                      if (error) return res.status(500).json({msg: error.message});

                      req.flash('success_msg', 'password changed successfully');
                      res.redirect('/users/login');
                  });
              });
          })
        });
      }
      else return res.status(200).json({success: false, msg: 'Pasword doesn\'t matched'});
    }
};

exports.getUserById = (req, res) => {
    User.findOne({uuid:req.params.uuid},function(err,foundUser)
    {
      if(err)
      {
        req.flash('error','could not fetch')
        res.redirect('/admin/users')
      }
      else
      {
        res.render('userPeek',{user:foundUser})
      }
    })
}

exports.getAllUsers=function(req,res)
{
  User.find({},function(err,foundUser)
    {
      if(err)
      {
        req.flash('error','could not fetch')
        res.redirect('/admin/users')
      }
      else
      {
        res.render('userPeek',{user:foundUser})
      }
    })
}

exports.deleteUserById = (req, res) => {
    User.findOneAndRemove({uuid: req.user.uuid}, err => {
        if(err) return res.status(400).send({error:err})
        return res.send({success: true, message: 'Account Deleted'})
    })
}

exports.updateUserData = (req, res) => {
    if(req && req.user && req.body){
        const updatedData = req.body
        User.findOneAndUpdate({uuid: req.user.uuid}, updatedData, {new: true} )
            .then( (data) => {
                return res.send({success: true, message: 'Data Updated', body: data})
            })
    }
    else return res.send({success: false, message: "data insufficient"})
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
  const {phone, pincode} = req.body.address
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
          if(err) return res.status(400).send({error:err})
          else if(!result) {
                  req.flash('error_msg', 'Unable to add address');
                  res.redirect('/');
          }
          var updateData = {
            defaultDeliveryAddress: result._id,
            active: true
          }
          User.update(
              { uuid: req.user.uuid}, 
              updateData,
              {new: true}
          )
          .exec(err => {
            if(err){
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
    const {phone, pincode} = req.body.address
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
      UserAddress.create(req.body.address, function(err, result)  {
          if(err) {
              req.flash('error_msg', 'Unable to add address');
              res.redirect('/address');
          }
          else{ 
            if(!result) {
                  req.flash('error_msg', 'Unable to add address');
                  res.redirect('/address');
          }
          else
          {
            req.flash('success_msg','succesfully added address')
            res.redirect('/');
          }
        }
            
            
          })
      }
}

exports.updateUserAddress = (req, res) => {
  if(req && req.query && req.body){
    const updatedData = req.body;
    UserAddress.findByIdAndUpdate({_id: req.query.id}, updatedData, {new: true} )
      .select('locality email landmark state district pincode contact country')
        .then( (data) => {
          return res.send({success: true, message: 'Address Updated', body: data})
        }
    )
  }
    else return res.send({success: false, message: "data insufficient"})
}

exports.getUserAddress = (req, res) => {
  UserAddress.find( {uuid: req.user.uuid}).exec(function(err,result){
        if(err){
            console.log(err);
            req.flash('error','error in fetching cart')
            res.redirect('/address')
        }
        else{
        console.log(result)
        req.flash('success_msg','result fetched check in console')
        res.redirect('/address')
     }
    })
}

exports.deleteAddress = (req, res) => {
  console.log(req.user)
  console.log(req.body)
  if(req && req.body && req.body.addressId){
    const addressId = new Object(req.body.addressId);
    if(addressId === req.user.defaultDeliveryAddress){
        return res.json({ success: false, message: "Default Address Can't be deleted. You can update it or set other addressas default address and delete it" });
    }
    else {
      UserAddress.findOneAndRemove({_id: addressId}, err => {
          if (err) {
            console.log(err)
            return res.status(400).send({ success: false, message: 'wrong address id' });
          }
          User.findOneAndUpdate({ uuid: req.user.uuid}, { $pull: { deliveryAddress: addressId }})
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
    else { return res.send({success: false, message: "data insufficient"}) }
}

exports.makeAdressToDefaultAddress = (req, res) => {
    if(req && req.body && req.body.addressId){
      const addressId = req.body.addressId;
      UserAddress.findOneAndUpdate({uuid: req.user.uuid, isDefault: true}, {isDefault: false})
      .then(err => {
        if(err) return console.log('hellp', err)
        UserAddress.findOneAndUpdate({_id: addressId}, {isDefault: true})
        .then( err => {
          if(err) return console.log('error', err)
          else return console.log('success')
        })
      })
    }
    else return res.send({success: false, message: "data insufficient"})
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
        req.flash('success_msg','OTP is' + result.message)
        res.redirect('/');
    })
    .catch( err => {
      console.log(err);
      req.flash('error','Unable to validate otp')
      res.redirect('/')
    });
}