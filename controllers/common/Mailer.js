
require('dotenv').config()
const envData = process.env
const axios = require('axios')
// var clientId = process.env.CLIENTID
// var clientSecret = process.env.CLIENTSECRET
// var refreshToken = process.env.REFRESHTOKEN
// var userMailID = process.env.USERMAILID

exports.Register = function (to,name,uuid,callback) {
    const options = {
        method: 'POST',
        url: 'https://api.sendinblue.com/v3/smtp/email',
        headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            'api-key': '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'
        },
        data: {
            sender: { name: 'inversion', email: 'support@112cart.com' },
            to: [{ email: 'prakharshriv@gmail.com', name: 'Prakhar Shrivastava' }],
            params: { newKey: 'New Value' },
            tags: ['abc'],
            templateId: 1
        },

    };
    axios(options).then((result) => {
        
        console.log(result)
    }).catch((err) => {
        console.log(err)
    });
};

exports.forgotPassword=function(to,token,callback)
{
    const options = {
        method: 'POST',
        url: 'https://api.sendinblue.com/v3/smtp/email',
        headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            'api-key': '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'
        },
        data: {
            sender: { name: 'inversion', email: 'support@112cart.com' },
            to: [{ email: to, }],
            params: { token: token },
            tags: ['password reset'],
            templateId: 1
        },

    };
    axios(options).then((result) => {
        callback({success:true})
    }).catch((err) => {
        callback({success:false,error:err})
    });
}

exports.changedPassword=function(to,callback)
{
    const options = {
        method: 'POST',
        url: 'https://api.sendinblue.com/v3/smtp/email',
        headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            'api-key': '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'
        },
        data: {
            sender: { name: 'inversion', email: 'support@112cart.com' },
            to: [{ email: to, }],
            params: { mail:to},
            tags: ['password reset'],
            templateId: 1
        },

    };
    axios(options).then((result) => {
        callback({success:true})
    }).catch((err) => {
        callback({success:false,error:err})
    });
}
