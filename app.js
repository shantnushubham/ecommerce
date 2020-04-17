var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cors = require('cors')
var mongoose = require('mongoose');
var mongooseMorgan = require('mongoose-morgan');
var path =require('path')

const flash = require("connect-flash");
const passport = require("passport");
const GoogleStrategy = require('passport-google-oauth20');
const FacebookStrategy = require('passport-facebook');
const LocalStrategy = require("passport-local").Strategy;
const compression = require("compression");
const session=require("express-session")
var MongoStore  = require('connect-mongo')(session)
require('dotenv').config()

var routes = require('./routes/routes')
var cartRoutes=require('./routes/cart')
var adminroutes=require('./routes/admin')
var User = require('./models/User/User');
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


mongoose.connect('mongodb://localhost:27017/foxmula', { useUnifiedTopology: true, useNewUrlParser: true });

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
if (process.env.REACT_APP_SERVER_ENVIORNMENT !== 'dev') {
  app.use(favicon(path.join(__dirname, 'build/favicon.ico')));
}

app.use(compression());
// app.use(require("cookie-parser")());
app.use(flash());
app.use(session({
    secret: 'my-secret',
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7 * 3 ,// two weeks
        secure:true
    }
}));
app.use(cors());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'DELETE, PUT');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

// passport.use(
//   new GoogleStrategy({
//       clientID:OAuthCredentials.googleAuth.clientID,
//       clientSecret:OAuthCredentials.googleAuth.clientSecret,
//       callbackURL:OAuthCredentials.googleAuth.callbackURL
//   },(accessToken, refreshToken, profile, done)=>{
//       process.nextTick(function() {
//           User.findOne({"email": profile.emails[0].value}, function(err, founduser){
//               if (err) {
//                   return done(err);
//               } else {
//                   if (founduser) {
//                       return done(null, founduser);
//                   } else {
//                       User.findOne({ 'googleUserId' : profile.id }, function(err, user) {
//                           if (err)
//                               return done(err);
//                           if (user) {
//                               // if a user is found, log them in
//                               return done(null, user);
//                           } else {
//                               // if the user isnt in our database, create a new user
//                               var newUser = new User();
//                               // set all of the relevant information
//                               newUser.googleUserId    = profile.id;
//                               newUser.name  = profile.displayName;
//                               newUser.email = profile.emails[0].value; // pull the first email
//                               newUser.username = profile.emails[0].value;
//                               newUser.phone = 0;
//                               // save the user

//                               User.create(new User(newUser), function(err) {
//                                   if (err)
//                                       throw err;
//                                   // Email.sendSignupEmail(profile.emails[0].value, function(rspp){
//                                       console.log(rspp);
//                                       return done(null, newUser);
//                                   // });
//                               });
//                           }
//                       });
//                   }
//               }
//           });
//           // try to find the user based on their google id
//       });
//   })
// );

// passport.use(new FacebookStrategy({
//       clientID: OAuthCredentials.facebookAuth.clientID,
//       clientSecret: OAuthCredentials.facebookAuth.clientSecret,
//       callbackURL: OAuthCredentials.facebookAuth.callbackURL,
//       profileFields: ['id', 'displayName', 'email']
//   },
//   function(accessToken, refreshToken, profile, done) {
//       User.findOne({ 'facebookId' : profile.id }, function(err, user) {
//           if (err)
//               return done(err);
//           if (user) {
//               // if a user is found, log them in
//               return done(null, user);
//           } else {
//               // if the user isnt in our database, create a new user

//               var newUser = new User();
//               // set all of the relevant information
//               newUser.facebookId    = profile.id;
//               newUser.name  = profile.displayName;
//               newUser.email = profile['_json']['email']; // pull the first email
//               newUser.username = profile['_json']['email'];
//               newUser.phone = 0;
//               // save the user

//               User.create(new User(newUser), function(err) {
//                   if (err)
//                       throw err;


//                   // Email.sendSignupEmail(profile['_json']['email'], function(rspp){
//                       console.log(rspp);
//                       return done(null, newUser);
//                   // });

//               });
//           }
//       });
//   }
// ));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
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

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

app.get('/testingpage',function(req,res){
    res.render('test')
})


app.get("/static/*.js", function(req, res, next) {
  req.url = req.url + ".gz";
  res.set("Content-Encoding", "gzip");
  res.set("Content-Type", "text/javascript");
  next();
});

// app.use('/', routes);
app.use(cartRoutes)
app.use(adminroutes)

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

// const cron = require("node-cron");
// cron.schedule("*/2 * * * * *", function() {
    
//     console.log("Running Cron Job");
// })

 

app.listen(3000, process.env.IP, function(){
    console.log("Server is up and running! Go ahead make your move.");
});
