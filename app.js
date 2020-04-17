const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');

const app = express();
var MongoStore  = require('connect-mongo')(session)

// Passport Config
require('./config/passport')(passport);

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/foxmula', { useUnifiedTopology: true, useNewUrlParser: true });

// EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');

// Express body parser
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'my-secret',
  resave: false,
  saveUninitialized: true,
  store: new MongoStore({ mongooseConnection: mongoose.connection }),
  cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7 * 3 // two weeks
  }
}));

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
