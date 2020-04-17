const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');

const app = express();
var MongoStore  = require('connect-mongo')(session)
<<<<<<< HEAD
require('dotenv').config()

var routes = require('./routes/routes')
var cartRoutes=require('./routes/cart')
var adminroutes=require('./routes/admin')
var User = require('./models/User/User');
// Passport Config
require('./config/passport')(passport);
// const OAuthCredentials = require('./config/auth');

var app = express();

// mongoose setup
mongoose.Promise = require('bluebird');
var dbHost = process.env.DB_HOST || 'localhost';
var dbName = process.env.DB_NAME;
var dbUser = process.env.DB_USERNAME;
var dbPass = process.env.DB_PASSWORD;
var dbPort = process.env.DB_PORT || "27017";

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.set("views",path.join(__dirname, 'views'));
console.log(path.join(__dirname, 'views'));


mongoose.connect('mongodb://localhost:27017/newSpice', { useUnifiedTopology: true, useNewUrlParser: true });

app.use(mongooseMorgan({
    collection: 'Log',
    connectionString: 'mongodb://localhost:27017/foxmula',
  },
  {
    skip: function (req, res) {
        return res.statusCode < 400;
    }
  },
  'dev'
));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
// if (process.env.REACT_APP_SERVER_ENVIORNMENT !== 'dev') {
//   app.use(favicon(path.join(__dirname, 'build/favicon.ico')));
// }

app.use(compression());
app.use(express.urlencoded({ extended: true }));
// app.use(require("cookie-parser")());
app.use(flash());
app.use(session({
  secret: 'my-secret',
  resave: false,
  saveUninitialized: true,
  store: new MongoStore({ mongooseConnection: mongoose.connection }),
  cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7 * 3 // two weeks
  }
}));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'DELETE, PUT');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

app.use('/', require('./routes/routes'));
app.use(require('./routes/cart'))

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});


app.listen(3000, process.env.IP, function(){
    console.log("Server is up and running! Go ahead make your move.");
});
