var User = require("../../../models/User/User")

exports.getUserById = (req, res) => {
    User.findOne({_id: req.params.id})
        .select()
        .exec((err, user) => {
            if(err) res.status(400).send({err: err})
            if(!user) res.send({success:false, message: 'User not found'})
            res.send({success: true, body: user})
        })
}
