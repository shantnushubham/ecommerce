var nodemailer = require('nodemailer');

var clientId = process.env.CLIENTID
var clientSecret = process.env.CLIENTSECRET
var refreshToken = process.env.REFRESHTOKEN
var userMailID = process.env.USERMAILID

exports.Register = function (user, callback) {
    if (user && user.email && user.name) {
        var transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'support@inversion.co.in',
                pass: "1429inversion.co.in"
            }
        });
        var mailOptions = {
            rom: 'support@inversion.co.in',
            to: user.email,
            subject: "Welcome",
            html: `
            <html>
                <head>
                    <META http-equiv="Content-Type" content="text/html; charset=utf-8">
                </head>
                <body>
                    <div style="font-family:Avenir,Helvetica,sans-serif;color:#74787e;height:100%;line-height:1.4;margin:0;width:100%!important">
                        Dear ${user.name},
                        Regards,
                    </div>
            </body>
        </html>`
        };
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                transporter.close();
                callback({success: true})
            }
        });
    } else {
        return null;
    }
};
