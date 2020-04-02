var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cors = require('cors')
var mongoose = require('mongoose');
const flash = require("connect-flash");
const passport = require("passport");
const GoogleStrategy = require('passport-google-oauth20');
const FacebookStrategy = require('passport-facebook');
const LocalStrategy = require("passport-local").Strategy;
const compression = require("compression");

const session = require('express-session');
const redis = require('redis');
const redisClient = redis.createClient();
const redisStore = require('connect-redis')(session);


var routes = require('./routes/routes')
var User = require('./models/User/User');
const OAuthCredentials = require('./config/auth');

var app = express();

// mongoose setup
mongoose.Promise = require('bluebird');
var dbHost = process.env.DB_HOST || 'localhost';
var dbName = process.env.DB_NAME;
var dbUser = process.env.DB_USERNAME;
var dbPass = process.env.DB_PASSWORD;
var dbPort = process.env.DB_PORT || "27017";
mongoose
  .connect("mongodb://" + dbUser + ":" + dbPass + "@" + dbHost + ":" + dbPort + "/" + dbName, { useUnifiedTopology: true, useCreateIndex: true, promiseLibrary: require("bluebird"), useNewUrlParser: true })
  .then(() => console.log("connection succesful"))
  .catch(err => console.error(err));

// reddis setup
redisClient.on('error', (err) => {
    console.log('Redis error: ', err);
});

app.use(session({
    secret: 'RedisSessionStorage',
    name: '_redisPractice',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Note that the cookie-parser module is no longer needed
    store: new redisStore({ host: 'localhost', port: 6379, client: redisClient, ttl: 86400 }),
}));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
if (process.env.REACT_APP_SERVER_ENVIORNMENT !== 'dev') {
  app.use(favicon(path.join(__dirname, 'build/favicon.ico')));
}
app.use(express.static(path.join(__dirname, 'build')));
app.use(compression());
app.use(require("cookie-parser")());
app.use(flash());
app.use(require("express-session")({
    secret: 'Bingo',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 6000000
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
                              newUser.phone = 0;
                              // save the user

                              User.create(new User(newUser), function(err) {
                                  if (err)
                                      throw err;
                                  // Email.sendSignupEmail(profile.emails[0].value, function(rspp){
                                      console.log(rspp);
                                      return done(null, newUser);
                                  // });
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
              newUser.phone = 0;
              // save the user

              User.create(new User(newUser), function(err) {
                  if (err)
                      throw err;


                  // Email.sendSignupEmail(profile['_json']['email'], function(rspp){
                      console.log(rspp);
                      return done(null, newUser);
                  // });

              });
          }
      });
  }
));

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



app.get("/static/*.js", function(req, res, next) {
  req.url = req.url + ".gz";
  res.set("Content-Encoding", "gzip");
  res.set("Content-Type", "text/javascript");
  next();
});

app.use('/', routes);

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

module.exports = app;
