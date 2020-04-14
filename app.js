var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cors = require('cors')
var mongoose = require('mongoose');
var mongooseMorgan = require('mongoose-morgan');

const flash = require("connect-flash");
const compression = require("compression");
const session=require("express-session")
var MongoStore  = require('connect-mongo')(session)
require('dotenv').config()

var routes = require('./routes/routes')
var cartRoutes=require('./routes/cart')
var User = require('./models/User/User');
// const OAuthCredentials = require('./config/auth');
mongoose.Promise = require('bluebird');

var app = express();

// mongoose setup

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
// app.use(express.static(__dirname + "/public"));
app.set("views", __dirname+"/views");

mongoose.connect('mongodb://localhost:27017/foxmula', { useUnifiedTopology: true, useNewUrlParser: true });

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
        maxAge: 1000 * 60 * 60 * 24 * 7 * 3 // two weeks
    }
}));
app.use(cors());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'DELETE, PUT');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


app.get('/', function(req, res) {
  res.render('index');
});

app.get('/register', function(req, res) {
  res.render('register');
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

app.use('/', routes);
app.use(cartRoutes)

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
