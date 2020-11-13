const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20');
const FacebookStrategy = require('passport-facebook');
const Mailer = require('./../controllers/common/Mailer')
require('dotenv').config()
const envData = process.env

// // Load User model
const User = require('../models/User/User');

module.exports = function (passport) {
    passport.use(new LocalStrategy({ usernameField: 'email', passwordField: 'password' }, User.authenticate()));

    passport.use(
        new GoogleStrategy({
            clientID: envData.gAuth_client_id,
            clientSecret: envData.gAuth_client_Secret,
            callbackURL: envData.gAuth_client_callBackURL
        }, (accessToken, refreshToken, profile, done) => {
            process.nextTick(function () {
                User.findOne({ "email": profile.emails[0].value }, function (err, founduser) {
                    if (err) {
                        return done(err);
                    } else {
                        if (founduser) {
                            return done(null, founduser);
                        } else {
                            User.findOne({ 'googleUserId': profile.id }, function (err, user) {
                                if (err)
                                    return done(err);
                                if (user) {
                                    // if a user is found, log them in
                                    return done(null, user);
                                } else {
                                    // if the user isnt in our database, create a new user
                                    var newUser = new User();
                                    // set all of the relevant information
                                    newUser.googleUserId = profile.id;
                                    // var nm=profile.name.split(" ")
                                    newUser.name = profile.displayName;
                                    // newUser.lastname=nm.length>1?nm[1]:"User"
                                    newUser.email = profile.emails[0].value; // pull the first email
                                    newUser.username = profile.emails[0].value;
                                    newUser.phone = 0;
                                    // save the user

                                    User.create(new User(newUser), function (err) {
                                        console.log(err);
                                        if (err)
                                        return done(err);
                                        Mailer.Register({ email: profile.emails[0].value, name: profile.displayName }, function (rspp) {
                                            console.log(rspp);
                                            return done(null, newUser);
                                        });
                                    });
                                }
                            });
                        }
                    }
                });
                // try to find the user based on their google id
            });
        })
    );

    passport.use(new FacebookStrategy({
        clientID: envData.fbAuth_client_id,
        clientSecret: envData.fbAuth_client_Secret,
        callbackURL: envData.fbAuth_client_callBackURL,
        profileFields: ['id', 'displayName', 'email']
    },
        function (accessToken, refreshToken, profile, done) {
            User.findOne({ 'facebookId': profile.id }, function (err, user) {
                if (err)
                    return done(err);
                if (user) {
                    // if a user is found, log them in
                    return done(null, user);
                } else {
                    //                 // if the user isnt in our database, create a new user

                    var newUser = new User();
                    // set all of the relevant information
                    newUser.facebookId = profile.id;
                    // var nm=profile.displayName.split(" ")
                    newUser.name = profile.displayName;
                    // newUser.lastname=nm.length>1?nm[1]:"User"
                    newUser.email = profile['_json']['email']; // pull the first email
                    newUser.username = profile['_json']['email'];
                    newUser.phone = 0;
                    // save the user

                    User.create(new User(newUser), function (err) {
                        if (err)
                        return done(err);


                        Mailer.Register({ email: profile['_json']['email'], name: profile.displayName }, function (rspp) {
                            console.log(rspp);
                            return done(null, newUser);
                        });

                    });
                }
            });
        }
    ));

    passport.serializeUser(User.serializeUser());

    passport.deserializeUser(User.deserializeUser());
};
