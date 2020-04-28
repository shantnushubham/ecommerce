var sendgrid = require("@sendgrid/mail");
require('dotenv').config()
const envData=process.env
sendgrid.setApiKey(envData.sendgrid_apikey);
// var clientId = process.env.CLIENTID
// var clientSecret = process.env.CLIENTSECRET
// var refreshToken = process.env.REFRESHTOKEN
// var userMailID = process.env.USERMAILID

exports.Register = function (user, callback) {
    if (user && user.email && user.name) {
        var mailOptions = {
            from: 'Foxmula<support@foxmula.com>',
            to: user.email,
            subject: "Welcome",
            html: `
            <html>
                <head>
                    <META http-equiv="Content-Type" content="text/html; charset=utf-8">
                </head>
                <body>
                    <div style="font-family:Avenir,Helvetica,sans-serif;color:#74787e;height:100%;line-height:1.4;margin:0;width:100%!important">
                        Dear ${user.name}, you have succesfully registered for spice.
                    </div>
            </body>
        </html>`
        };
        sendgrid.send(mailOptions, (err, response) => {
            if (err) {
                console.log(err);
            }
            callback({success: true});
        });
    } else {
        return null;
    }
};
