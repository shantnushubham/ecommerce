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
const { CLIENT_RENEG_LIMIT } = require('tls');
require('./config/passport')(passport);
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



app.use(session({
    secret: 'my-secret',
    resave: false,
    saveUninitialized: false,
    // store: new MongoStore({ mongooseConnection: mongoose.connection }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 ,
         // two weeks
         _expires: (1000 * 60 * 60 * 24 ) 
    }
}));

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'DELETE, PUT');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


// Connect flash
app.use(flash());

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Global variables
app.use(function (req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});
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


app.listen(3000, process.env.IP, function () {
    console.log("Server is up and running! Go ahead make your move.");
});
