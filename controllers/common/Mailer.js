var nodemailer = require('nodemailer');

var clientId = process.env.CLIENTID
var clientSecret = process.env.CLIENTSECRET
var refreshToken = process.env.REFRESHTOKEN
var userMailID = process.env.USERMAILID

exports.Register = function (user) {
    if (user && user.email && user.name && user.otp) {
        var transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            auth: {
                type: "OAuth2",
                user: userMailID,
                clientId: clientId,
                clientSecret: clientSecret,
                refreshToken: refreshToken
            }
        });
        var mailOptions = {
            from: userMailID,
            to: user.email,
            subject: "OTP verifivation",
            html: `
            <html>
                <head>
                    <META http-equiv="Content-Type" content="text/html; charset=utf-8">
                </head>
                <body>
                    <div style="font-family:Avenir,Helvetica,sans-serif;color:#74787e;height:100%;line-height:1.4;margin:0;width:100%!important">
                        Dear ${user.name},
                        Your account's verification OTP is ${user.otp}.
                        Regards,
                    </div>
            </body>
        </html>`
        };
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log(info)
            }
            transporter.close();
        });
    } else {
        return null;
    }
};


exports.Verified = function (user) {
    if (user && user.email && user.name) {
        var transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            auth: {
                type: "OAuth2",
                user: userMailID,
                clientId: clientId,
                clientSecret: clientSecret,
                refreshToken: refreshToken
            }
        });
        var mailOptions = {
            from: userMailID,
            to: user.email,
            subject: "Email verified",
            html: `
            <html>
                <head>
                    <META http-equiv="Content-Type" content="text/html; charset=utf-8">
                </head>
                <body>
                <div>
                  Dear ${user.name}, Your account has been successfully verified. 
                  <br/> <br/>
                This is a self generated mail. Please don't reply to this mail.
                
                  Thanks
                </div>
            </body>
        </html>`
        }
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log(info)
            }
            transporter.close();
        });
    } else {
        return null
    }
};

exports.ResetPassword = function (user) {
    if (user && user.email && user.password && user.name) {
        var transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            auth: {
                type: "OAuth2",
                user: userMailID,
                clientId: clientId,
                clientSecret: clientSecret,
                refreshToken: refreshToken
            }
        });
        var mailOptions = {
            from: userMailID,
            to: user.email,
            subject: "Reset of password",
            html: `
            <html>
                <head>
                    <META http-equiv="Content-Type" content="text/html; charset=utf-8">
                </head>
                <body>
                    <div style="font-family:Avenir,Helvetica,sans-serif;color:#74787e;height:100%;line-height:1.4;margin:0;width:100%!important">
                Dear ${user.name},
                Your temporary password is <i><b>${user.password}<b></i>. Use this to reset your password.
                <br/> <br/>
                This is a self generated mail. Please don't reply to this mail.
                <br/> <br/>
                
                </div>
            </body>
        </html>`
        }
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log(info)
            }
            transporter.close();
        });
    } else {
        return null
    }
};