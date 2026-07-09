package com.alphapark.repository.projection;

import java.math.BigDecimal;
import java.time.LocalDate;

/** Proyeccion nativa usada por VehiculoRepository#buscar. */
public interface VehiculoResumenProjection {
    String getPlaca();
    String getTipo();
    Long getVisitas();
    BigDecimal getTotalGastado();
    LocalDate getUltimaVisita();
    Long getActivoAhora();
}
