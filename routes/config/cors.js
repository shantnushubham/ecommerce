// Whitelist

 var whitelist = ['https://localhost:3000'];

if (process.env.REACT_APP_SERVER_ENVIORNMENT === 'dev') {
  whitelist = ['http://localhost:'+process.env.PORT, 'https://localhost:'+process.env.PORT, 'http://localhost:'+process.env.REACT_APP_SERVER_PORT, 'https://localhost:'+process.env.REACT_APP_SERVER_PORT, 'http://localhost:80'];
}
var corsOptions = function (req, callback) {
  var corsOptions1;
  if (whitelist.indexOf(req.header('Origin')) !== -1) {
    corsOptions1 = { origin: true } 
  }else{
    corsOptions1 = { origin: false } 
  }
  callback(null, corsOptions1) 
}

module.exports = corsOptions;
