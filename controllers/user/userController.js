var User = require("../../models/User/User")
var UserAddress = require("../../models/User/DeliveryAddress")
// var Generator = require("../../common/Generator")
// var mailer = require("../../common/Mailer")

const bcrypt = require('bcryptjs');
const passport = require('passport');
var ObjectId = require('mongoose').Types.ObjectId;

exports.register = (req, res) => {
    const { name, email, password, password2 } = req.body;
    let errors = [];
  
    if (!name || !email || !password || !password2) {
      errors.push({ msg: 'Please enter all fields' });
    }
  
    if (password != password2) {
      errors.push({ msg: 'Passwords do not match' });
    }
  
    if (password.length < 6) {
      errors.push({ msg: 'Password must be at least 6 characters' });
    }
  
    if (errors.length > 0) {
      res.render('register', {
        errors,
        name,
        email,
        password,
        password2
      });
    } else {
      User.findOne({ email: email }).then(user => {
        if (user) {
          errors.push({ msg: 'Email already exists' });
          res.render('register', {
            errors,
            name,
            email,
            password,
            password2
          });
        } else {
          const newUser = new User({
            name,
            email,
            password
          });
  
          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              if (err) throw err;
              newUser.password = hash;
              newUser
                .save()
                .then(user => {
                  req.flash(
                    'success_msg',
                    'You are now registered and can log in'
                  );
                  res.redirect('/users/login');
                })
                .catch(err => console.log(err));
            });
          });
        }
      });
    }
  }

exports.login = (req, res, next) => {
  console.log('hello')  
  passport.authenticate('local', {
      successRedirect: '/',
      failureRedirect: '/users/login',
      failureFlash: true
    })(req, res, next);
}

exports.logout = (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
  }

exports.getUserById = (req, res) => {
    if(req && req.user){
      User.findOne({uuid: req.user.uuid})
        .select('name email phone username')
        // .populate('defaultDeliveryAddress deliveryAddress', 'locality landmark state district pincode contact')
        // .populate('orders', 'itemId quantity')
        .exec((err, user) => {
            if(err) return res.status(400).send({err: err})
            else if(!user) return res.send({success:false, message: 'User not found'})
            return res.send({success: true, body: user})
        })
    }
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

exports.addUserAddress = (req, res) => {
  if(req && req.user && req.body){
    var address = new UserAddress(req.body)
    address.save((err, result) => {
        if(err) return res.status(400).send({error:err})
        else if(!result) return res.json({success: false, message: 'Unable to save'});

        User.findOneAndUpdate({ uuid: req.user.uuid}, { $addToSet: { deliveryAddress: {_id: result._id} }, defaultDeliveryAddress: result._id }, {new: true})
        .select('name email phone username')
        .populate('defaultDeliveryAddress deliveryAddress', 'locality landmark state district pincode contact')
            .then(data => res.send({success: true, message: 'Address Added', body: data})
            )
    })
  }
  else res.send({success: false, message: "data insufficient"})
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
      User.findByIdAndUpdate({uuid: req.user.uuid}, { defaultDeliveryAddress: addressId }, {new: true} )
        .select('name email phone username')
          .populate('defaultDeliveryAddress', 'locality landmark state district pincode contact')
          .then(data => 
            res.send({success: true, message: 'Updated default address.', body: data})
          )
    }
    else return res.send({success: false, message: "data insufficient"})
}

