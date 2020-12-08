const config = require('./../config');
User = require('../models/user');
const jwt = require('jsonwebtoken');


module.exports.ensureAuthenticated = function(req, res, next){
	const token = req.headers['authorization'];
  //console.log("token checking....")
	if (token) {
    jwt.verify(token, config.secret, function(err, decoded) {
      if (err) {
        if(err.name == "TokenExpiredError"){
          return res.status(200).json({"status": "error", "message": 'Error: Unauthorized access.', tokenExpired: true });
        } else {
          console.log(err)
          return res.status(200).json({"status": "error", "message": 'Error: Unauthorized access.' });
        }
      }
      req.decoded = decoded;
      User.search({id: decoded.id}, function(err, user){
      	if(err){
          console.log("User not found ...", err);
          return res.status(200).json({"status": "error", "message": 'Unauthorized access.' });
      	}else{
          user = user.rows[0];
      		var currentUser = {
      			id: user.id,
      			nickName: user.nickName,
      			socketId: user.socketId,
      			isOnline: user.isOnline
      		}
      		req.user = currentUser;
      		next();
      	}
      });
    });
  }else{
    console.log("Failing here no token");
    res.status(200).send({"status": "error", "message": 'Unauthorized access.(no token)' });
  }
}


module.exports.optionallyAuthenticated = function(req, res, next){
  const token = req.headers['authorization'];
  if (token) {
    jwt.verify(token, config.secret, function(err, decoded) {
      if (err) {
        next();
      }else{
        req.decoded = decoded;
        if(req.decoded){
          User.search({id: decoded.id}, function(err, user){
            if(err){
              next();
            }else{
              var currentUser = {
                id: user.id,
                name: user.name,
                email: user.email,
                phoneNumber: user.phoneNumber
              }
              req.user = currentUser;
              next();
            }
          });
        }else{
          next();
        }
      }
    });
  }else{
    next();
  }
}
