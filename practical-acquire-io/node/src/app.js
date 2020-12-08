const config = require('./config');
var express = require("express");
var bodyParser = require('body-parser');
var cors = require('cors')
var app = express();
app.use(cors())
app.use(bodyParser.json());

var fileUpload = require('express-fileupload');
app.use(fileUpload({
  limits: { fileSize: config.awsFileUploadLimit * 1024 * 1024 },
}));

app.use(function(req, res, next){
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-access-token');
  res.header('Access-Control-Expose-Headers', 'x-access-token, Authorization');
  if(req.method === "OPTIONS"){
    res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
    return res.status(200).json({});
  }
  next();
});

 var users = require('./routes/users');
 app.use('/user', users);

 var messages = require('./routes/messages');
 app.use('/message', messages);

module.exports = app;