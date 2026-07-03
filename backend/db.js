const mysql = require('mysql2');

// Crear el pool de conexiones a MySQL Workbench / XAMPP
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',          
    password: 'admin123',          
    database: 'alphapark_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool.promise();