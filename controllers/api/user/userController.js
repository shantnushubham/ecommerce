var User = require("../../../models/User/User")
var UserAddress = require("../../../models/User/DeliveryAddress")
// var Generator = require("../../common/Generator")
// var mailer = require("../../common/Mailer")

const bcrypt = require('bcryptjs');
const passport = require('passport');

exports.register = (req, res) => {
    const { name, email, phone, password, password2 } = req.body;
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
            phone,
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

