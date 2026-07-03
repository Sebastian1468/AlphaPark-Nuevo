const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors()); 
app.use(express.json());

// 1. ENDPOINT: Obtener el aforo en tiempo real para Angular
app.get('/api/parqueo/estado', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT capacidad_total, espacios_ocupados FROM parqueo_config WHERE id_config = 1');
        if (rows.length === 0) return res.status(404).json({ message: "Configuración no encontrada" });
        
        const { capacidad_total, espacios_ocupados } = rows[0];
        res.json({
            capacidad_total,
            espacios_ocupados,
            disponibles: capacidad_total - espacios_ocupados,
            estaLleno: espacios_ocupados >= capacidad_total
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. ENDPOINT: Recibir datos de Angular y registrar el ticket en MySQL
app.post('/api/tickets/ingreso', async (req, res) => {
    const { placa_vehiculo, id_operador } = req.body;

    // Validación de campos requeridos obligatorios por la BD
    if (!placa_vehiculo || !id_operador) {
        return res.status(400).json({ message: "Placa y ID de operador son requeridos." });
    }

    try {
        // Regla de negocio: Validar aforo máximo
        const [config] = await db.query('SELECT capacidad_total, espacios_ocupados FROM parqueo_config WHERE id_config = 1');
        if (config[0].espacios_ocupados >= config[0].capacidad_total) {
            return res.status(400).json({ message: "Ingreso denegado: Parqueo LLENO." });
        }

        // Registrar el vehículo de forma automática si es su primera vez (INSERT IGNORE)
        await db.query('INSERT IGNORE INTO vehiculos (placa, tipo) VALUES (?, "Auto")', [placa_vehiculo.toUpperCase()]);

        // Capturar marcas de tiempo del sistema
        const fechaActual = new Date().toISOString().slice(0, 10);
        const horaActual = new Date().toTimeString().slice(0, 8);

        // Insertar el ticket vinculando la FK del operador que mandó Angular
        const [ticketResult] = await db.query(
            'INSERT INTO tickets (placa_vehiculo, id_operador, fecha_ingreso, hora_ingreso, estado) VALUES (?, ?, ?, ?, "Activo")',
            [placa_vehiculo.toUpperCase(), id_operador, fechaActual, horaActual]
        );

        // Incrementar el contador dinámico en la tabla de configuración
        await db.query('UPDATE parqueo_config SET espacios_ocupados = espacios_ocupados + 1 WHERE id_config = 1');

        // Respuesta exitosa devuelta al frontend
        res.status(201).json({
            message: "Ticket generado con éxito",
            id_ticket: ticketResult.insertId,
            placa: placa_vehiculo.toUpperCase(),
            id_operador: id_operador,
            fecha: fechaActual,
            hora: horaActual
        });

    } catch (error) {
        // Captura errores de base de datos (Ej: si el id_operador no existe en la tabla operadores)
        res.status(500).json({ error: error.message });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor de AlphaPark sincronizado y corriendo en http://localhost:${PORT}`);
});