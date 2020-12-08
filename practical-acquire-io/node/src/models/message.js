const { param } = require('../routes/users');
const config = require('./../config');
const dbConn = require('./../db');
const mysqlQuery = require("./mysql-query");
const tableName = "`messages`";

var User = module.exports = {};

module.exports.search = function(params, callback){
    return searchUser(params).then(function(results){
        callback(null, results);
    }).catch((err) => {
        callback(err, null);
    })
}

const searchUser = (params) => {
    var conditions = [];
    for(var field in params){
        if(field != 'fields'){
            conditions.push(" `"+field+"` = '"+params[field]+"' ");
        }
    }
    conditions = conditions.join(" AND ");
    var fields = "*";
    if(params.fields){
        fields = params.fields.join(",")
    }

    var orderBy = " ORDER BY createdAt ASC "

    if(conditions.length > 0){
        var query = "SELECT "+fields+" FROM "+tableName+" WHERE "+conditions+orderBy;
    } else {
        var query = "SELECT "+fields+" FROM "+tableName+orderBy;
    }
    return new Promise(function(resolve, reject) {
        mysqlQuery.select(query, function(err, results){
            if(err){
                reject(err);
            } else {
                resolve(results);
            }
        });
    }).catch((err) => {
      return (err)
    });
}

module.exports.check = function(params, callback){
    return checkConversation(params).then(function(results){
        callback(null, results);
    }).catch((err) => {
        callback(err, null);
    })
}

const checkConversation = (params) => {
    var conditions = [];
    params.userIds.forEach(function(useId){
        conditions.push(" `userId` = '"+useId+"' ");
    })
    conditions = conditions.join(" OR ");
    var query = "SELECT session, COUNT(session) as `conversationCount` from "+tableName+" WHERE ("+conditions+") GROUP by session HAVING conversationCount > 1";
    return new Promise(function(resolve, reject) {
        mysqlQuery.select(query, function(err, results){
            if(err){
                reject(err);
            } else {
                resolve(results);
            }
        });
    }).catch((err) => {
      return (err)
    });
}

module.exports.createMessage = function(params, callback){
    return create(params).then(function (response) {
        callback(null, response);
    }).catch((err) => {
        callback(err, null);
    });  
}

var create = (params, callback) => {
    for(var i in params){
      if(typeof(params[i]) === "undefined" || params[i] == null){
        delete params[i];
      }
    }
    var insertParams = {params: params};
    insertParams.query = "INSERT INTO "+tableName+" SET ?";
    return new Promise(function(resolve, reject) {
        mysqlQuery.insert(insertParams, function(err, results){
            if(err){
                reject(err);
            } else {
                resolve(results);
            }
        });
    }).catch((err) => {
      return (err)
    });
}

module.exports.customUpdate = function(key, params, callback) {
  for(var i in params){
    if(params[i] === "undefined" || params[i] == null || params[i] == ''){
      params[i] = null;
    }
  }
  var where = [];
  for(var i in key){
    where.push(" `"+i+"` = '"+key[i]+"'")
  }
  where = where.join(" AND ");
  updateParams = {query: "UPDATE "+tableName+" SET ? WHERE "+where+"", params: params}
  var res = mysqlQuery.update(updateParams, function(err, succ){
    if(err){
      console.log(err);
      callback(err, null);
    } else {
      callback(null, succ);
    }
  });
}