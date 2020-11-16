const express = require('express');
// const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
const bodyParser = require('body-parser')
const path = require('path')
const mongooseMorgan = require('mongoose-morgan')
const compression = require('compression')
const app = express();
var logger = require('morgan');
var MongoStore = require('connect-mongo')(session)
const cors = require("cors");
const axios = require('axios')
const cartModel = require('./models/cart/cart')
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20');
const FacebookStrategy = require('passport-facebook');
const Mailer = require('./controllers/common/Mailer')

// // Load User model
// const User = require('./models/User/User');


require('dotenv').config()
const envData = process.env

var routes = require('./routes/routes')
var cartRoutes = require('./routes/cart')
var adminroutes = require('./routes/admin')
var orderroutes = require('./routes/orders')
var itemRoutes = require('./routes/items')
var User = require('./models/User/User');
var listRoutes = require('./routes/lists')
var packageRoutes = require('./routes/packages')
var vendorRoutes = require('./routes/vendors');
// const { CLIENT_RENEG_LIMIT } = require('tls');
// require('./config/passport')(passport);
// const OAuthCredentials = require('./config/auth');



app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.set("views", path.join(__dirname, 'views'));
app.use(cors());


mongoose.connect(envData.DB, { useUnifiedTopology: true, useNewUrlParser: true });

app.use(mongooseMorgan({
    collection: 'Log',
    connectionString: envData.DB,
},
    {
        skip: function (req, res) {
            return res.statusCode < 400;
        }
    },
    'dev'
));

app.use(logger('dev'));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({extended: true}));

app.use(compression());

app.use(flash());


app.use(session({
    secret: 'Bingo',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 6000000
    }
}));

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'DELETE, PUT');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


// Connect flash

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());
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
                                newUser.save(function(err,user){
                                    console.log(err);
                                    if (err)
                                    return done(err);
                                    Mailer.Register({ email: profile.emails[0].value, name: profile.displayName }, function (rspp) {
                                        console.log(rspp);
                                        return done(null, newUser);
                                    });
                                })
                                
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

passport.serializeUser(function(user, cb) {
    cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
    cb(null, obj);
});
// Global variables

app.use(function (req, res, next) {
    if (req.isAuthenticated()) {
        res.locals.currentUser = req.user;
        res.locals.success = req.flash('success');
        res.locals.error = req.flash('error');
    } else {
        res.locals.currentUser = "";
        res.locals.success = req.flash('success');
        res.locals.error = req.flash('error');
    }
    next();
});

app.use(function (req, res, next) {
    if (req.isAuthenticated()) {
        cartModel.countDocuments({ uuid: req.user.uuid }, function (err, count) {
            if (!err) {
                res.locals.cartCount = count
                next();
                // console.log(res.locals);
            } else {
                res.locals.cartCount = 0
                next();
                // console.log(res.locals);
            }
        })
    } else {
        res.locals.cartCount = 0
        next();
    }

});


// app.use('/', require('./routes/routes'));
app.use(cartRoutes)
app.use(adminroutes)
app.use(itemRoutes)
app.use(orderroutes)
app.use(listRoutes)
app.use(packageRoutes)
app.use(vendorRoutes)


app.get('/auth/google', passport.authenticate('google', {
    scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
    ]
}));

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    function (req, res) {
        res.redirect('/');
    }
);

app.get('/auth/facebook',
  passport.authenticate('facebook', {
    scope: 'email'
  }),function(req,res){
    console.log("fb");
  });

app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
        successRedirect: '/',
        failureRedirect: '/'
    })
);


app.use('/', require('./routes/routes'));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error("Not Found");
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render("error", { error: err });
});


app.listen(3010, process.env.IP, function(){
    console.log("Server is up and running! Go ahead make your move.");
});
