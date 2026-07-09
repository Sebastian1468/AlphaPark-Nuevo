package com.alphapark.repository;

import com.alphapark.model.Vehiculo;
import com.alphapark.repository.projection.VehiculoResumenProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface VehiculoRepository extends JpaRepository<Vehiculo, String> {

    /**
     * Busca vehiculos por coincidencia parcial de placa junto con sus
     * estadisticas de uso (visitas, gasto total, ultima visita y si
     * esta activo ahora mismo). Equivalente al JOIN + GROUP BY del
     * endpoint GET /api/vehiculos del backend anterior en Node.
     */
    @Query(value = """
            SELECT v.placa AS placa,
                   v.tipo AS tipo,
                   COUNT(t.id_ticket) AS visitas,
                   COALESCE(SUM(t.monto_pagado), 0) AS totalGastado,
                   MAX(t.fecha_ingreso) AS ultimaVisita,
                   SUM(CASE WHEN t.estado = 'Activo' THEN 1 ELSE 0 END) AS activoAhora
            FROM vehiculos v
            LEFT JOIN tickets t ON t.placa_vehiculo = v.placa
            WHERE v.placa LIKE CONCAT('%', :busqueda, '%')
            GROUP BY v.placa, v.tipo
            ORDER BY ultimaVisita DESC
            """, nativeQuery = true)
    List<VehiculoResumenProjection> buscar(@Param("busqueda") String busqueda);
}
