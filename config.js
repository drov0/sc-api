var mysql      = require('mysql');
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'root',
    database : 'sc-api',
    charset: 'utf8mb4'
});

connection.connect();

const admins = ["patrice"];

module.exports =  {db:connection, admins:admins};