package com.alphapark.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * Entidad espejo de la tabla parqueo_config.
 * Actua como tabla de control global: almacena el aforo actual y la
 * tarifa por hora vigente. El backend la consulta cada vez que se
 * genera o se paga un ticket (ver AccesoService).
 */
@Entity
@Table(name = "parqueo_config")
@Getter
@Setter
@NoArgsConstructor
public class ParqueoConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_config")
    private Integer idConfig;

    @Column(name = "capacidad_total", nullable = false)
    private Integer capacidadTotal;

    @Column(name = "espacios_ocupados", nullable = false)
    private Integer espaciosOcupados;

    @Column(name = "tarifa_por_hora", nullable = false, precision = 10, scale = 2)
    private BigDecimal tarifaPorHora;
}
