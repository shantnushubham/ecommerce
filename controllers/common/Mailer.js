
require('dotenv').config()
const envData = process.env
const axios = require('axios')
// axios.defaults.withCredentials=true
const orderServices = require('../../openServices/order')
// var clientId = process.env.CLIENTID
// var clientSecret = process.env.CLIENTSECRET
// var refreshToken = process.env.REFRESHTOKEN
// var userMailID = process.env.USERMAILID

exports.Register = function (to, name, uuid, callback) {
    const options = {
        method: 'POST',
        url: 'https://api.sendinblue.com/v3/smtp/email',
        headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            'api-key': envData.sendinblue
        },
        data: {
            sender: { name: '112Cart', email: 'support@112cart.com' },
            to: [{ email: to, }],
            params: { name:name,uuid:uuid  },
            tags: ['signup'],
            templateId: 1
        },

    };
    axios(options).then((result) => {
        callback({success:true})
        // console.log(result)
    }).catch((err) => {
        console.log("sendinblue error",err)
        callback({success:false})
        
    });
    
};

exports.forgotPassword = function (to, token, callback) {
    const options = {
        method: 'POST',
        url: 'https://api.sendinblue.com/v3/smtp/email',
        headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            'api-key': envData.sendinblue
        },
        data: {
            sender: { name: '112Cart', email: 'support@112cart.com' },
            to: [{ email: to, }],
            params: { token: token },
            tags: ['password reset'],
            templateId: 7
        },

    };
    axios(options).then((result) => {
        callback({ success: true })
    }).catch((err) => {
        callback({ success: false, error: err })
    });
}

exports.changedPassword = function (to, callback) {
    const options = {
        method: 'POST',
        url: 'https://api.sendinblue.com/v3/smtp/email',
        headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            'api-key': envData.sendinblue
        },
        data: {
            sender: { name: '112Cart', email: 'support@112cart.com' },
            to: [{ email: to, }],
            params: { mail: to },
            tags: ['password reset'],
            templateId: 1
        },

    };
    axios(options).then((result) => {
        callback({ success: true })
    }).catch((err) => {
        callback({ success: false, error: err })
    });
}

exports.askQuote = function (email, data, callback) {


    var d = {
        mail: email,
        name: data.user.name,
        order: data.order,
        items: data.items,
        user: data.user
    }
    console.log("maildata",d);
    const options = {
        method: 'POST',
        url: 'https://api.sendinblue.com/v3/smtp/email',
        headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            'api-key': envData.sendinblue
        },
        data: {
            sender: { name: '112Cart', email: 'support@112cart.com' },
            to: [{ email: d.mail, }],
            params: d,
            tags: ['Quotation'],
            templateId: 5,
            "bcc":[{"email":"support@112cart.com","name":"112Cart"}]

        },

    };
    axios(options).then((mailed) => {
        console.log("request completed")
    }).catch((err) => {
        console.log(err)
    });

    callback({ success: true })
}

exports.orderReceived=function(email,data,callback)
{
    var d = {
        mail: email,
        name: data.user.name,
        order: data.order,
        items: data.items,
        user: data.user
    }
    const options = {
        method: 'POST',
        url: 'https://api.sendinblue.com/v3/smtp/email',
        headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            'api-key': envData.sendinblue
        },
        data: {
            sender: { name: '112Cart', email: 'support@112cart.com' },
            to: [{ email: d.mail, }],
            params: d,
            tags: ['Quotation'],
            templateId: 6,
            "bcc":[{"email":"support@112cart.com","name":"112Cart"}]

        },

    };
    axios(options).then((mailed) => {
        console.log("request completed")
    }).catch((err) => {
        console.log(err)
    });

    callback({ success: true })
}

exports.sendPerforma=function(email,data,callback)
{
    var d = {
        mail: email,
        name: data.user.name,
        order: data.order,
        items: data.items,
        user: data.user,
        sgst: data.order.state.toLowerCase() === "jharkhand" ? data.order.tax/2 : 0,
        cgst: data.order.state.toLowerCase() === "jharkhand" ? data.order.tax/2 : 0,
        igst: data.order.state.toLowerCase() != "jharkhand" ? data.order.tax : 0,
    }
    // console.log(d);
    const options = {
        method: 'POST',
        url: 'https://api.sendinblue.com/v3/smtp/email',
        headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            'api-key': envData.sendinblue
        },
        data: {
            sender: { name: '112Cart', email: 'support@112cart.com' },
            to: [{ email: d.mail, }],
            params: d,
            tags: ['Quotation'],
            templateId: 4,
            "bcc":[{"email":"support@112cart.com","name":"112Cart"}]

        },

    };
    axios(options).then((mailed) => {
        console.log("request completed")
    }).catch((err) => {
        console.log(err)
    });

    callback({ success: true })
}

exports.sendInvoice=function(email,data,callback)
{
    var d = {
        mail: email,
        name: data.user.name,
        order: data.order,
        items: data.items,
        user: data.user,
        sgst: data.order.state.toLowerCase() === "jharkhand" ? data.order.tax/2 : 0,
        cgst: data.order.state.toLowerCase() === "jharkhand" ? data.order.tax/2 : 0,
        igst: data.order.state.toLowerCase() != "jharkhand" ? data.order.tax : 0,
    }
    console.log("invoice data",d)
    const options = {
        method: 'POST',
        url: 'https://api.sendinblue.com/v3/smtp/email',
        headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            'api-key': envData.sendinblue
        },
        data: {
            sender: { name: '112Cart', email: 'support@112cart.com' },
            to: [{ email: d.mail, }],
            params: d,
            tags: ['Quotation'],
            templateId: 2,
            "bcc":[{"email":"support@112cart.com","name":"112Cart"}]

        },

    };
    axios(options).then((mailed) => {
        console.log("request completed")
    }).catch((err) => {
        console.log(err)
    });

    callback({ success: true })
}


exports.serviceQuote=function(email,data,callback)
{
    var d = {
        mail: email,
        name: data.user.name,
       
        item: data.item,
        user: data.user,
        sgst: data.user.state.toLowerCase() === "jharkhand" ? data.item.tax/2 : 0,
        cgst: data.user.state.toLowerCase() === "jharkhand" ? data.item.tax/2 : 0,
        igst: data.user.state.toLowerCase() != "jharkhand" ? data.item.tax : 0,
    }
    console.log(d)
    const options = {
        method: 'POST',
        url: 'https://api.sendinblue.com/v3/smtp/email',
        headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            'api-key': envData.sendinblue
        },
        data: {
            sender: { name: '112Cart', email: 'support@112cart.com' },
            to: [{ email: d.mail, }],
            params: d,
            tags: ['Quotation'],
            templateId: 2,
            "bcc":[{"email":"support@112cart.com","name":"112Cart"}]
        },

    };
    axios(options).then((mailed) => {
        console.log("request completed")
    }).catch((err) => {
        console.log(err)
    });

    callback({ success: true })
}

exports.cancelled=function(email,data,callback){
    const options = {
        method: 'POST',
        url: 'https://api.sendinblue.com/v3/smtp/email',
        headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            'api-key': envData.sendinblue
        },
        data: {
            sender: { name: '112Cart', email: 'support@112cart.com' },
            to: [{ email: email,  }],
            params: { name:data.name,orderId:data.orderId  },
            tags: ['Order-Cancellation'],
            templateId: 9
        },

    };
    axios(options).then((result) => {
        callback({success:true})
        // console.log(result)
    }).catch((err) => {
        console.log("sendinblue error",err)
        callback({success:false})
        
    });
}