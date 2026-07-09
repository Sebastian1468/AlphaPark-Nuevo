package com.alphapark.repository.projection;

/** Proyeccion nativa usada por TicketRepository para /api/estadisticas/hora-pico. */
public interface HoraPicoProjection {
    Integer getHora();
    Long getCantidad();
}
