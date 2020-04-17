var User = require("../../models/User/User")
var UserAddress = require("../../models/User/DeliveryAddress")

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
                if (err) return res.state(400).send({ success: false, msg: 'unable to remove participant' });

                if (results && results._id === req.params._id) return res.json({ success: false, msg: "Default Address Can't be deleted. You can update it." });

                else {

                    User.findOneAndUpdate({ email: results.email}, { $pull: { deliveryAddress: addressId } }, (err) => {
                        if (err) return res.state(400).send({ success: false, msg: 'unable to remove participant' });
                        res.json({ success: true, msg: 'event removes from participant' });
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

