const config = require('./../config');
var mysql = require('mysql');
var mysqlPool = require("./../db.js");

module.exports.insert = (params, callback) => {
    mysqlPool.getConnection(function(err,connection){
        if (err) {
            console.log(err);
            connection.release();
            callback(err, null)
        }   
        console.log(params)
        connection.query(params.query, params.params, function(err,rows){
            connection.release();
            if(!err) {
                callback(null, {rows: rows});
            }           
        });
        connection.on('error', function(err) {      
            callback(err, null)   
        });
    });
}

module.exports.update = (params, callback) => {
    mysqlPool.getConnection(function(err,connection){
        if (err) {
            console.log(err);
            connection.release();
            callback(err, null)
        }   
        connection.query(params.query, params.params, function(err,rows){
            connection.release();
            if(!err) {
                callback(null, {rows: rows});
            }           
        });
        connection.on('error', function(err) {      
            callback(err, null)   
        });
    });
}

module.exports.select = (query, callback) => {
    mysqlPool.getConnection(function(err,connection){
        if (err) {
            console.log(err);
            connection.release();
            callback(err, null)
        } else {
            connection.query(query,function(err,rows){
                connection.release();
                if(!err) {
                    callback(null, {rows: rows});
                }           
            });
            connection.on('error', function(err) {      
                callback(err, null)
            });
        } 
    });
}