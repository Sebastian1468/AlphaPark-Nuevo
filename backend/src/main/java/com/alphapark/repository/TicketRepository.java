package com.alphapark.repository;

import com.alphapark.model.EstadoTicket;
import com.alphapark.model.Ticket;
import com.alphapark.repository.projection.GananciaProjection;
import com.alphapark.repository.projection.HoraPicoProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Integer> {

    /** Historial de tickets de una placa especifica (auditoria por vehiculo). */
    List<Ticket> findByPlacaVehiculoOrderByIdTicketDesc(String placaVehiculo);

    /** Vehiculos actualmente dentro del estacionamiento (aforo en tiempo real). */
    List<Ticket> findByEstadoOrderByIdTicketDesc(EstadoTicket estado);

    // ---------------------------------------------------------------
    // KPIs para el dashboard del Gerente (GET /api/estadisticas/resumen)
    // ---------------------------------------------------------------

    @Query(value = """
            SELECT COALESCE(SUM(monto_pagado), 0) FROM tickets
            WHERE estado = 'Finalizado' AND fecha_salida = CURDATE()
            """, nativeQuery = true)
    BigDecimal getIngresosHoy();

    @Query(value = """
            SELECT COALESCE(SUM(monto_pagado), 0) FROM tickets
            WHERE estado = 'Finalizado'
              AND YEAR(fecha_salida) = YEAR(CURDATE())
              AND MONTH(fecha_salida) = MONTH(CURDATE())
            """, nativeQuery = true)
    BigDecimal getIngresosMes();

    @Query(value = "SELECT COUNT(*) FROM tickets WHERE fecha_ingreso = CURDATE()", nativeQuery = true)
    Long getVehiculosHoy();

    @Query(value = """
            SELECT COALESCE(AVG(monto_pagado), 0) FROM tickets WHERE estado = 'Finalizado'
            """, nativeQuery = true)
    BigDecimal getTicketPromedio();

    // ---------------------------------------------------------------
    // Ganancias agrupadas por periodo (GET /api/estadisticas/ganancias)
    // ---------------------------------------------------------------

    @Query(value = """
            SELECT DATE_FORMAT(fecha_salida, '%Y-%m-%d') AS etiqueta, SUM(monto_pagado) AS total
            FROM tickets
            WHERE estado = 'Finalizado' AND fecha_salida >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
            GROUP BY etiqueta ORDER BY etiqueta ASC
            """, nativeQuery = true)
    List<GananciaProjection> getGananciasPorDia();

    @Query(value = """
            SELECT CONCAT('Sem. ', DATE_FORMAT(MIN(fecha_salida), '%d/%m')) AS etiqueta, SUM(monto_pagado) AS total
            FROM tickets
            WHERE estado = 'Finalizado' AND fecha_salida >= DATE_SUB(CURDATE(), INTERVAL 7 WEEK)
            GROUP BY YEARWEEK(fecha_salida, 1) ORDER BY YEARWEEK(fecha_salida, 1) ASC
            """, nativeQuery = true)
    List<GananciaProjection> getGananciasPorSemana();

    @Query(value = """
            SELECT DATE_FORMAT(fecha_salida, '%b %Y') AS etiqueta, SUM(monto_pagado) AS total
            FROM tickets
            WHERE estado = 'Finalizado' AND fecha_salida >= DATE_SUB(CURDATE(), INTERVAL 11 MONTH)
            GROUP BY DATE_FORMAT(fecha_salida, '%Y-%m') ORDER BY DATE_FORMAT(fecha_salida, '%Y-%m') ASC
            """, nativeQuery = true)
    List<GananciaProjection> getGananciasPorMes();

    @Query(value = """
            SELECT CAST(YEAR(fecha_salida) AS CHAR) AS etiqueta, SUM(monto_pagado) AS total
            FROM tickets
            WHERE estado = 'Finalizado'
            GROUP BY YEAR(fecha_salida) ORDER BY YEAR(fecha_salida) ASC
            """, nativeQuery = true)
    List<GananciaProjection> getGananciasPorAnio();

    // ---------------------------------------------------------------
    // Hora pico (GET /api/estadisticas/hora-pico)
    // ---------------------------------------------------------------

    @Query(value = """
            SELECT HOUR(hora_ingreso) AS hora, COUNT(*) AS cantidad
            FROM tickets GROUP BY HOUR(hora_ingreso)
            """, nativeQuery = true)
    List<HoraPicoProjection> getHoraPicoRaw();
}
