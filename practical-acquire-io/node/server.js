// Load the AWS SDK for Node.js
/*
var AWS = require('aws-sdk');
var credentials = new AWS.SharedIniFileCredentials({profile: 'default'});
AWS.config.credentials = credentials;
AWS.config.update({region: 'ap-south-1'});

// Create the IAM service object
var iam = new AWS.IAM({apiVersion: '2010-05-08'});

iam.listServerCertificates({}, function(err, data) {
  if (err) {
    console.log("Error", err);
  } else {
    console.log("Success", data);
  }
});
*/

var fs = require('fs');
var https = require('https');
var http = require('http');
const port = process.env.port || 3000 ;
const app = require('./src/app');
// var options = {
//     key: fs.readFileSync('/etc/letsencrypt/live/api.chandanpanistainless.com/privkey.pem'),
//     cert: fs.readFileSync('/etc/letsencrypt/live/api.chandanpanistainless.com/cert.pem'),
//     ca: fs.readFileSync('/etc/letsencrypt/live/api.chandanpanistainless.com/chain.pem')
// };
    
//const server = https.createServer(options, app);

const server = http.createServer(app);

server.listen(port, () => {
  console.log("https://localhost:" + port);
});
