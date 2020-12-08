const config = require('./config');
var mysql      = require('mysql');

var pool = mysql.createPool({
    connectionLimit : 10,
    host     : config.mysql.host,
    user     : config.mysql.username,
    password : config.mysql.password,
    database : config.mysql.database,
    port     : 8889,
    debug    : false
});

module.exports = pool;