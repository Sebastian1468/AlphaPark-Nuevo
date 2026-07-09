package com.alphapark.repository.projection;

import java.math.BigDecimal;

/** Proyeccion nativa usada por TicketRepository para /api/estadisticas/ganancias. */
public interface GananciaProjection {
    String getEtiqueta();
    BigDecimal getTotal();
}
