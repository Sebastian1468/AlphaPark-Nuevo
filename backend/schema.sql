-- =========================================================
-- AlphaPark - Esquema de base de datos (igual al tuyo real)
-- Ejecuta este archivo completo si necesitas crear la base
-- de datos desde cero:
--   mysql -u root -p < schema.sql
-- Es seguro volver a ejecutarlo (usa IF NOT EXISTS / IGNORE).
-- =========================================================

CREATE DATABASE IF NOT EXISTS alphapark_db;
USE alphapark_db;

-- 1. Configuración y aforo
CREATE TABLE IF NOT EXISTS parqueo_config (
    id_config INT AUTO_INCREMENT PRIMARY KEY,
    capacidad_total INT NOT NULL DEFAULT 100,
    espacios_ocupados INT NOT NULL DEFAULT 0,
    tarifa_por_hora DECIMAL(10,2) NOT NULL DEFAULT 5.00,
    CONSTRAINT chk_aforo CHECK (espacios_ocupados <= capacidad_total AND espacios_ocupados >= 0)
) ENGINE=InnoDB;

INSERT INTO parqueo_config (capacidad_total, espacios_ocupados, tarifa_por_hora)
SELECT * FROM (SELECT 100, 0, 5.00) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM parqueo_config);

-- 2. Operadores (usuarios del sistema: Empleado o Gerente)
CREATE TABLE IF NOT EXISTS operadores (
    id_operador INT AUTO_INCREMENT PRIMARY KEY,
    nombre_usuario VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    rol ENUM('Empleado', 'Gerente') NOT NULL DEFAULT 'Empleado',
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Usuarios semilla de ejemplo (contraseñas hasheadas con scrypt, ver backend/server.js):
--   Gerente  -> usuario: gerente1  / password: gerente123
--   Empleado -> usuario: lhernandez / password: empleado123
INSERT IGNORE INTO operadores (nombre_usuario, password, rol) VALUES
    ('gerente1', '2979322d7017e7ac971b877fd3a84fa9:b8d3eff1631d2fd74620fcd51bab7dd35bde48d7c87f7b639c5f3361ab4805710d0c06030e1bd7c1e8cff9a5fc47f754bfcd738a3e6454cd095a1c86cbb2eb11', 'Gerente'),
    ('lhernandez', '59e6a4a9faabac54b0d523bd5a8638d0:6443f25f7da43c20616ee6e18a83374bd5c517939a9f465adb6d301c83a93c1d89197ecde246fbc25ef07392c2b1f9a713221794346f3a1e20e3ba65529ce4db', 'Empleado');

-- 3. Vehículos
CREATE TABLE IF NOT EXISTS vehiculos (
    placa VARCHAR(10) PRIMARY KEY,
    tipo ENUM('Auto', 'Moto', 'Camioneta') NOT NULL DEFAULT 'Auto'
) ENGINE=InnoDB;

-- 4. Tickets
CREATE TABLE IF NOT EXISTS tickets (
    id_ticket INT AUTO_INCREMENT PRIMARY KEY,
    placa_vehiculo VARCHAR(10) NOT NULL,
    id_operador INT NOT NULL,
    fecha_ingreso DATE NOT NULL,
    hora_ingreso TIME NOT NULL,
    fecha_salida DATE NULL,
    hora_salida TIME NULL,
    monto_pagado DECIMAL(10,2) NULL DEFAULT 0.00,
    estado ENUM('Activo', 'Finalizado') NOT NULL DEFAULT 'Activo',
    FOREIGN KEY (placa_vehiculo) REFERENCES vehiculos(placa)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    FOREIGN KEY (id_operador) REFERENCES operadores(id_operador)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB;
