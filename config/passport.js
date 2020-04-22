const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const GoogleStrategy          = require('passport-google-oauth20');
const FacebookStrategy        = require('passport-facebook');
const Mailer = require('./../controllers/common/Mailer')
const OAuthCredentials = require('./auth');

// Load User model
const User = require('../models/User/User');

module.exports = function(passport) {
  passport.use(
    new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
      // Match user
      User.findOne({
        email: email
      }).then(user => {
        if (!user) {
          return done(null, false, { message: 'That email is not registered' });
        }

        // Match password
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) throw err;
          if (isMatch) {
            return done(null, user);
          } else {
            return done(null, false, { message: 'Password incorrect' });
          }
        });
      });
    })
  );

  passport.use(
    new GoogleStrategy({
        clientID:OAuthCredentials.googleAuth.clientID,
        clientSecret:OAuthCredentials.googleAuth.clientSecret,
        callbackURL:OAuthCredentials.googleAuth.callbackURL
    },(accessToken, refreshToken, profile, done)=>{
        process.nextTick(function() {
            User.findOne({"email": profile.emails[0].value}, function(err, founduser){
                if (err) {
                    return done(err);
                } else {
                    if (founduser) {
                        return done(null, founduser);
                    } else {
                        User.findOne({ 'googleUserId' : profile.id }, function(err, user) {
                            if (err)
                                return done(err);
                            if (user) {
                                // if a user is found, log them in
                                return done(null, user);
                            } else {
                                // if the user isnt in our database, create a new user
                                var newUser = new User();
                                // set all of the relevant information
                                newUser.googleUserId    = profile.id;
                                newUser.name  = profile.displayName;
                                newUser.email = profile.emails[0].value; // pull the first email
                                newUser.username = profile.emails[0].value;
                                newUser.state = "none";
                                newUser.phone = 0;
                                // save the user

                                User.create(new User(newUser), function(err) {
                                    if (err)
                                        throw err;
                                    Mailer.Register({ email: profile.emails[0].value, name: profile.displayName} , function(rspp){
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
        clientID: OAuthCredentials.facebookAuth.clientID,
        clientSecret: OAuthCredentials.facebookAuth.clientSecret,
        callbackURL: OAuthCredentials.facebookAuth.callbackURL,
        profileFields: ['id', 'displayName', 'email']
    },
    function(accessToken, refreshToken, profile, done) {
        User.findOne({ 'facebookId' : profile.id }, function(err, user) {
            if (err)
                return done(err);
            if (user) {
                // if a user is found, log them in
                return done(null, user);
            } else {
                // if the user isnt in our database, create a new user

                var newUser = new User();
                // set all of the relevant information
                newUser.facebookId    = profile.id;
                newUser.name  = profile.displayName;
                newUser.email = profile['_json']['email']; // pull the first email
                newUser.username = profile['_json']['email'];
                newUser.state = "none";
                newUser.phone = 0;
                // save the user

                User.create(new User(newUser), function(err) {
                    if (err)
                        throw err;


                        Mailer.Register({ email: profile['_json']['email'], name: profile.displayName} , function(rspp){
                          console.log(rspp);
                          return done(null, newUser);
                      });

                });
            }
        });
    }
  ));

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });
};
