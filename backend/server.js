const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// =========================================================
// AUTENTICACIÓN: hash de contraseñas con scrypt (nativo de
// Node, sin dependencias externas). Se guarda como "salt:hash".
// =========================================================
function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
}

function verificarPassword(password, almacenado) {
    const [salt, hash] = (almacenado || '').split(':');
    if (!salt || !hash) return false;
    const hashBuffer = Buffer.from(hash, 'hex');
    const hashIntento = crypto.scryptSync(password, salt, 64);
    if (hashBuffer.length !== hashIntento.length) return false;
    return crypto.timingSafeEqual(hashBuffer, hashIntento);
}

// Calcula el cobro con la tarifa configurable de parqueo_config.
// Regla: se cobra el equivalente a 1 hora como mínimo, luego se
// prorratea por minuto según la tarifa por hora configurada.
function calcularCobro(minutos, tarifaPorHora) {
    const horas = minutos / 60;
    const cobro = Math.max(tarifaPorHora, horas * tarifaPorHora);
    return Math.round(cobro * 100) / 100;
}

function calcularMinutos(fechaIngreso, horaIngreso, fechaRef, horaRef) {
    const fechaIngresoStr = fechaIngreso instanceof Date ? fechaIngreso.toISOString().slice(0, 10) : fechaIngreso;
    const fechaRefStr = fechaRef instanceof Date ? fechaRef.toISOString().slice(0, 10) : fechaRef;
    const ingreso = new Date(`${fechaIngresoStr}T${horaIngreso}`);
    const referencia = new Date(`${fechaRefStr}T${horaRef}`);
    return Math.max(0, Math.floor((referencia - ingreso) / 60000));
}

// 1. ENDPOINT: Obtener el aforo y la tarifa vigente en tiempo real
app.get('/api/parqueo/estado', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id_config, capacidad_total, espacios_ocupados, tarifa_por_hora FROM parqueo_config LIMIT 1');
        if (rows.length === 0) return res.status(404).json({ message: "Configuración no encontrada" });

        const { capacidad_total, espacios_ocupados, tarifa_por_hora } = rows[0];
        res.json({
            capacidad_total,
            espacios_ocupados,
            disponibles: capacidad_total - espacios_ocupados,
            estaLleno: espacios_ocupados >= capacidad_total,
            tarifa_por_hora: Number(tarifa_por_hora)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// =========================================================
// AUTENTICACIÓN: registro y login de usuarios (Empleado / Gerente)
// =========================================================

// ENDPOINT: Registrar un nuevo usuario (empleado o gerente)
app.post('/api/auth/registro', async (req, res) => {
    const { nombre_usuario, password, rol } = req.body;

    if (!nombre_usuario || !password || !rol) {
        return res.status(400).json({ message: "Usuario, contraseña y rol son requeridos." });
    }
    if (!['Empleado', 'Gerente'].includes(rol)) {
        return res.status(400).json({ message: "El rol debe ser 'Empleado' o 'Gerente'." });
    }
    if (password.length < 6) {
        return res.status(400).json({ message: "La contraseña debe tener al menos 6 caracteres." });
    }

    try {
        const [existentes] = await db.query('SELECT id_operador FROM operadores WHERE nombre_usuario = ?', [nombre_usuario]);
        if (existentes.length > 0) {
            return res.status(409).json({ message: "Ese nombre de usuario ya está en uso." });
        }

        const passwordHasheado = hashPassword(password);
        const [resultado] = await db.query(
            'INSERT INTO operadores (nombre_usuario, password, rol) VALUES (?, ?, ?)',
            [nombre_usuario, passwordHasheado, rol]
        );

        res.status(201).json({
            message: "Cuenta creada con éxito",
            id_operador: resultado.insertId,
            nombre_usuario,
            rol
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ENDPOINT: Iniciar sesión
app.post('/api/auth/login', async (req, res) => {
    const { nombre_usuario, password } = req.body;

    if (!nombre_usuario || !password) {
        return res.status(400).json({ message: "Usuario y contraseña son requeridos." });
    }

    try {
        const [rows] = await db.query('SELECT * FROM operadores WHERE nombre_usuario = ?', [nombre_usuario]);
        if (rows.length === 0) {
            return res.status(401).json({ message: "Usuario o contraseña incorrectos." });
        }

        const usuario = rows[0];
        const passwordValido = verificarPassword(password, usuario.password);
        if (!passwordValido) {
            return res.status(401).json({ message: "Usuario o contraseña incorrectos." });
        }

        res.json({
            message: "Inicio de sesión exitoso",
            id_operador: usuario.id_operador,
            nombre_usuario: usuario.nombre_usuario,
            rol: usuario.rol
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. ENDPOINT: Recibir datos de Angular y registrar el ticket en MySQL
app.post('/api/tickets/ingreso', async (req, res) => {
    const { placa_vehiculo, id_operador } = req.body;

    if (!placa_vehiculo || !id_operador) {
        return res.status(400).json({ message: "Placa y ID de operador son requeridos." });
    }

    try {
        const [config] = await db.query('SELECT id_config, capacidad_total, espacios_ocupados FROM parqueo_config LIMIT 1');
        if (config.length === 0) {
            return res.status(404).json({ message: "Configuración de parqueo no encontrada." });
        }
        const { id_config, capacidad_total, espacios_ocupados } = config[0];
        if (espacios_ocupados >= capacidad_total) {
            return res.status(400).json({ message: "Ingreso denegado: Parqueo LLENO." });
        }

        // Registrar el vehículo de forma automática si es su primera vez
        await db.query('INSERT IGNORE INTO vehiculos (placa, tipo) VALUES (?, "Auto")', [placa_vehiculo.toUpperCase()]);

        const fechaActual = new Date().toISOString().slice(0, 10);
        const horaActual = new Date().toTimeString().slice(0, 8);

        const [ticketResult] = await db.query(
            'INSERT INTO tickets (placa_vehiculo, id_operador, fecha_ingreso, hora_ingreso, estado) VALUES (?, ?, ?, ?, "Activo")',
            [placa_vehiculo.toUpperCase(), id_operador, fechaActual, horaActual]
        );

        await db.query('UPDATE parqueo_config SET espacios_ocupados = espacios_ocupados + 1 WHERE id_config = ?', [id_config]);

        res.status(201).json({
            message: "Ticket generado con éxito",
            id_ticket: ticketResult.insertId,
            placa: placa_vehiculo.toUpperCase(),
            id_operador: id_operador,
            fecha: fechaActual,
            hora: horaActual
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. ENDPOINT: Listar vehículos activos con tiempo transcurrido y cobro estimado
app.get('/api/tickets/activos', async (req, res) => {
    try {
        const [config] = await db.query('SELECT tarifa_por_hora FROM parqueo_config LIMIT 1');
        const tarifa = config.length > 0 ? Number(config[0].tarifa_por_hora) : 5.00;

        const [rows] = await db.query(
            `SELECT id_ticket, placa_vehiculo, fecha_ingreso, hora_ingreso
             FROM tickets WHERE estado = 'Activo' ORDER BY id_ticket DESC`
        );

        const ahora = new Date();
        const hoyStr = ahora.toISOString().slice(0, 10);
        const horaStr = ahora.toTimeString().slice(0, 8);

        const activos = rows.map(t => {
            const minutos = calcularMinutos(t.fecha_ingreso, t.hora_ingreso, hoyStr, horaStr);
            return {
                id_ticket: t.id_ticket,
                placa_vehiculo: t.placa_vehiculo,
                fecha_ingreso: t.fecha_ingreso,
                hora_ingreso: t.hora_ingreso,
                minutos_transcurridos: minutos,
                horas_texto: `${Math.floor(minutos / 60)}h ${minutos % 60}m`,
                cobro_estimado: calcularCobro(minutos, tarifa)
            };
        });

        res.json(activos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 4. ENDPOINT: Registrar la salida de un vehículo: calcula el cobro final,
// marca el ticket como finalizado y libera un espacio en el aforo.
app.put('/api/tickets/:id/salida', async (req, res) => {
    const { id } = req.params;

    try {
        const [tickets] = await db.query('SELECT * FROM tickets WHERE id_ticket = ?', [id]);
        if (tickets.length === 0) {
            return res.status(404).json({ message: "Ticket no encontrado." });
        }
        if (tickets[0].estado !== 'Activo') {
            return res.status(400).json({ message: "Este ticket ya fue cerrado anteriormente." });
        }

        const [config] = await db.query('SELECT id_config, tarifa_por_hora FROM parqueo_config LIMIT 1');
        if (config.length === 0) {
            return res.status(404).json({ message: "Configuración de parqueo no encontrada." });
        }
        const { id_config, tarifa_por_hora } = config[0];

        const ticket = tickets[0];
        const ahora = new Date();
        const fechaSalida = ahora.toISOString().slice(0, 10);
        const horaSalida = ahora.toTimeString().slice(0, 8);

        const minutos = calcularMinutos(ticket.fecha_ingreso, ticket.hora_ingreso, fechaSalida, horaSalida);
        const monto = calcularCobro(minutos, Number(tarifa_por_hora));

        await db.query(
            `UPDATE tickets
             SET estado = 'Finalizado', fecha_salida = ?, hora_salida = ?, monto_pagado = ?
             WHERE id_ticket = ?`,
            [fechaSalida, horaSalida, monto, id]
        );

        // Liberar el espacio (el CHECK de la tabla ya impide bajar de 0,
        // pero GREATEST agrega una capa extra de seguridad)
        await db.query(
            `UPDATE parqueo_config SET espacios_ocupados = GREATEST(espacios_ocupados - 1, 0) WHERE id_config = ?`,
            [id_config]
        );

        res.json({
            message: "Salida registrada con éxito",
            id_ticket: Number(id),
            placa: ticket.placa_vehiculo,
            duracion_minutos: minutos,
            monto
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 5. ENDPOINT: Historial de vehículos que ya salieron + KPIs para el dashboard.
// La duración no se guarda en una columna propia, se calcula al vuelo
// a partir de fecha/hora de ingreso y salida.
app.get('/api/tickets/historial', async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT id_ticket, placa_vehiculo, fecha_ingreso, hora_ingreso, fecha_salida, hora_salida, monto_pagado
             FROM tickets WHERE estado = 'Finalizado' ORDER BY id_ticket DESC`
        );

        const registros = rows.map(r => ({
            ...r,
            duracion_minutos: calcularMinutos(r.fecha_ingreso, r.hora_ingreso, r.fecha_salida, r.hora_salida)
        }));

        const hoy = new Date().toISOString().slice(0, 10);
        const totalRegistros = registros.length;
        const salidasHoy = registros.filter(r => {
            const fs = r.fecha_salida instanceof Date ? r.fecha_salida.toISOString().slice(0, 10) : r.fecha_salida;
            return fs === hoy;
        }).length;
        const ingresosTotales = registros.reduce((sum, r) => sum + Number(r.monto_pagado || 0), 0);
        const duracionPromedioMin = totalRegistros > 0
            ? registros.reduce((sum, r) => sum + r.duracion_minutos, 0) / totalRegistros
            : 0;

        res.json({
            kpis: {
                total_registros: totalRegistros,
                salidas_hoy: salidasHoy,
                ingresos_totales: Math.round(ingresosTotales * 100) / 100,
                duracion_promedio_horas: Math.round((duracionPromedioMin / 60) * 10) / 10
            },
            registros
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// =========================================================
// CONFIGURACIÓN: precio por hora y capacidad (uso del Gerente)
// =========================================================

// ENDPOINT: Actualizar la tarifa por hora y/o la capacidad total del parqueo
app.put('/api/parqueo/config', async (req, res) => {
    const { tarifa_por_hora, capacidad_total } = req.body;

    if (tarifa_por_hora == null && capacidad_total == null) {
        return res.status(400).json({ message: "Debes enviar tarifa_por_hora y/o capacidad_total." });
    }
    if (tarifa_por_hora != null && (isNaN(tarifa_por_hora) || tarifa_por_hora <= 0)) {
        return res.status(400).json({ message: "La tarifa por hora debe ser un número mayor a 0." });
    }
    if (capacidad_total != null && (isNaN(capacidad_total) || capacidad_total <= 0)) {
        return res.status(400).json({ message: "La capacidad total debe ser un número mayor a 0." });
    }

    try {
        const [config] = await db.query('SELECT id_config, espacios_ocupados FROM parqueo_config LIMIT 1');
        if (config.length === 0) {
            return res.status(404).json({ message: "Configuración de parqueo no encontrada." });
        }
        const { id_config, espacios_ocupados } = config[0];

        if (capacidad_total != null && capacidad_total < espacios_ocupados) {
            return res.status(400).json({ message: `La capacidad no puede ser menor a los ${espacios_ocupados} espacios ya ocupados.` });
        }

        const campos = [];
        const valores = [];
        if (tarifa_por_hora != null) { campos.push('tarifa_por_hora = ?'); valores.push(tarifa_por_hora); }
        if (capacidad_total != null) { campos.push('capacidad_total = ?'); valores.push(capacidad_total); }
        valores.push(id_config);

        await db.query(`UPDATE parqueo_config SET ${campos.join(', ')} WHERE id_config = ?`, valores);

        const [actualizado] = await db.query('SELECT capacidad_total, espacios_ocupados, tarifa_por_hora FROM parqueo_config WHERE id_config = ?', [id_config]);
        res.json({
            message: "Configuración actualizada con éxito",
            capacidad_total: actualizado[0].capacidad_total,
            tarifa_por_hora: Number(actualizado[0].tarifa_por_hora)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// =========================================================
// ESTADÍSTICAS: gráficos para el dashboard del Gerente
// =========================================================

// ENDPOINT: Resumen general (KPIs) para el dashboard del Gerente
app.get('/api/estadisticas/resumen', async (req, res) => {
    try {
        const [config] = await db.query('SELECT capacidad_total, espacios_ocupados, tarifa_por_hora FROM parqueo_config LIMIT 1');
        const [[ingresosHoy]] = await db.query(
            `SELECT COALESCE(SUM(monto_pagado), 0) AS total FROM tickets
             WHERE estado = 'Finalizado' AND fecha_salida = CURDATE()`
        );
        const [[ingresosMes]] = await db.query(
            `SELECT COALESCE(SUM(monto_pagado), 0) AS total FROM tickets
             WHERE estado = 'Finalizado' AND YEAR(fecha_salida) = YEAR(CURDATE()) AND MONTH(fecha_salida) = MONTH(CURDATE())`
        );
        const [[ticketsHoy]] = await db.query(
            `SELECT COUNT(*) AS total FROM tickets WHERE fecha_ingreso = CURDATE()`
        );
        const [[promedio]] = await db.query(
            `SELECT COALESCE(AVG(monto_pagado), 0) AS promedio FROM tickets WHERE estado = 'Finalizado'`
        );

        const cfg = config[0] || { capacidad_total: 0, espacios_ocupados: 0, tarifa_por_hora: 0 };

        res.json({
            capacidad_total: cfg.capacidad_total,
            espacios_ocupados: cfg.espacios_ocupados,
            disponibles: cfg.capacidad_total - cfg.espacios_ocupados,
            tarifa_por_hora: Number(cfg.tarifa_por_hora),
            ingresos_hoy: Math.round(Number(ingresosHoy.total) * 100) / 100,
            ingresos_mes: Math.round(Number(ingresosMes.total) * 100) / 100,
            vehiculos_hoy: ticketsHoy.total,
            ticket_promedio: Math.round(Number(promedio.promedio) * 100) / 100
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ENDPOINT: Dinero recaudado agrupado por período (día / semana / mes / año)
app.get('/api/estadisticas/ganancias', async (req, res) => {
    const periodo = req.query.periodo || 'dia';

    try {
        let filas;
        if (periodo === 'dia') {
            [filas] = await db.query(
                `SELECT DATE_FORMAT(fecha_salida, '%Y-%m-%d') AS etiqueta, SUM(monto_pagado) AS total
                 FROM tickets
                 WHERE estado = 'Finalizado' AND fecha_salida >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
                 GROUP BY etiqueta ORDER BY etiqueta ASC`
            );
        } else if (periodo === 'semana') {
            [filas] = await db.query(
                `SELECT CONCAT('Sem. ', DATE_FORMAT(MIN(fecha_salida), '%d/%m')) AS etiqueta, SUM(monto_pagado) AS total
                 FROM tickets
                 WHERE estado = 'Finalizado' AND fecha_salida >= DATE_SUB(CURDATE(), INTERVAL 7 WEEK)
                 GROUP BY YEARWEEK(fecha_salida, 1) ORDER BY YEARWEEK(fecha_salida, 1) ASC`
            );
        } else if (periodo === 'mes') {
            [filas] = await db.query(
                `SELECT DATE_FORMAT(fecha_salida, '%b %Y') AS etiqueta, SUM(monto_pagado) AS total
                 FROM tickets
                 WHERE estado = 'Finalizado' AND fecha_salida >= DATE_SUB(CURDATE(), INTERVAL 11 MONTH)
                 GROUP BY DATE_FORMAT(fecha_salida, '%Y-%m') ORDER BY DATE_FORMAT(fecha_salida, '%Y-%m') ASC`
            );
        } else if (periodo === 'anio') {
            [filas] = await db.query(
                `SELECT YEAR(fecha_salida) AS etiqueta, SUM(monto_pagado) AS total
                 FROM tickets
                 WHERE estado = 'Finalizado'
                 GROUP BY YEAR(fecha_salida) ORDER BY YEAR(fecha_salida) ASC`
            );
        } else {
            return res.status(400).json({ message: "Periodo inválido. Usa dia, semana, mes o anio." });
        }

        res.json(filas.map(f => ({ etiqueta: String(f.etiqueta), total: Math.round(Number(f.total || 0) * 100) / 100 })));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ENDPOINT: Cantidad de ingresos por hora del día (para el gráfico de "hora pico")
app.get('/api/estadisticas/hora-pico', async (req, res) => {
    try {
        const [filas] = await db.query(
            `SELECT HOUR(hora_ingreso) AS hora, COUNT(*) AS cantidad
             FROM tickets GROUP BY HOUR(hora_ingreso)`
        );

        const mapa = new Map(filas.map(f => [f.hora, f.cantidad]));
        const resultado = Array.from({ length: 24 }, (_, hora) => ({
            hora,
            etiqueta: `${String(hora).padStart(2, '0')}:00`,
            cantidad: mapa.get(hora) || 0
        }));

        res.json(resultado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// =========================================================
// VEHÍCULOS: buscador e historial por placa
// =========================================================

// ENDPOINT: Buscar vehículos registrados con sus estadísticas de uso
app.get('/api/vehiculos', async (req, res) => {
    const busqueda = (req.query.buscar || '').toUpperCase().trim();

    try {
        const [filas] = await db.query(
            `SELECT v.placa, v.tipo,
                    COUNT(t.id_ticket) AS visitas,
                    COALESCE(SUM(t.monto_pagado), 0) AS total_gastado,
                    MAX(t.fecha_ingreso) AS ultima_visita,
                    SUM(CASE WHEN t.estado = 'Activo' THEN 1 ELSE 0 END) AS activo_ahora
             FROM vehiculos v
             LEFT JOIN tickets t ON t.placa_vehiculo = v.placa
             WHERE v.placa LIKE ?
             GROUP BY v.placa, v.tipo
             ORDER BY ultima_visita DESC`,
            [`%${busqueda}%`]
        );

        res.json(filas.map(f => ({
            placa: f.placa,
            tipo: f.tipo,
            visitas: f.visitas,
            total_gastado: Math.round(Number(f.total_gastado) * 100) / 100,
            ultima_visita: f.ultima_visita,
            esta_activo: f.activo_ahora > 0
        })));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ENDPOINT: Historial completo de tickets de una placa específica
app.get('/api/vehiculos/:placa/historial', async (req, res) => {
    const placa = req.params.placa.toUpperCase();

    try {
        const [filas] = await db.query(
            `SELECT id_ticket, placa_vehiculo, fecha_ingreso, hora_ingreso, fecha_salida, hora_salida, monto_pagado, estado
             FROM tickets WHERE placa_vehiculo = ? ORDER BY id_ticket DESC`,
            [placa]
        );
        res.json(filas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor de AlphaPark sincronizado y corriendo en http://localhost:${PORT}`);
});
