require('dotenv').config();
const mysql = require('mysql2');

// Crear el pool de conexiones a MySQL Workbench / XAMPP
// Las credenciales ahora se leen de variables de entorno (.env) para no
// exponer contraseñas dentro del código fuente. Si no existe un .env,
// se usan los mismos valores por defecto que tenías antes.
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root1234',
    database: process.env.DB_NAME || 'alphapark_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool.promise();
