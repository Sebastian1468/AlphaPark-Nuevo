package com.alphapark.service;

import com.alphapark.dto.vehiculos.TicketVehiculoItem;
import com.alphapark.dto.vehiculos.VehiculoResumenResponse;
import com.alphapark.repository.TicketRepository;
import com.alphapark.repository.VehiculoRepository;
import com.alphapark.repository.projection.VehiculoResumenProjection;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

/** Buscador de vehiculos con sus estadisticas de uso y su historial por placa. */
@Service
public class VehiculoService {

    private final VehiculoRepository vehiculoRepository;
    private final TicketRepository ticketRepository;

    public VehiculoService(VehiculoRepository vehiculoRepository, TicketRepository ticketRepository) {
        this.vehiculoRepository = vehiculoRepository;
        this.ticketRepository = ticketRepository;
    }

    public List<VehiculoResumenResponse> buscar(String termino) {
        String busqueda = (termino == null ? "" : termino).toUpperCase().trim();

        return vehiculoRepository.buscar(busqueda).stream()
                .map(f -> new VehiculoResumenResponse(f.getPlaca(), f.getTipo(), f.getVisitas(),
                        (f.getTotalGastado() == null ? BigDecimal.ZERO : f.getTotalGastado()).setScale(2, RoundingMode.HALF_UP),
                        f.getUltimaVisita(), f.getActivoAhora() != null && f.getActivoAhora() > 0))
                .toList();
    }

    public List<TicketVehiculoItem> getHistorialPorPlaca(String placa) {
        String placaUpper = placa.toUpperCase();
        return ticketRepository.findByPlacaVehiculoOrderByIdTicketDesc(placaUpper).stream()
                .map(t -> new TicketVehiculoItem(t.getIdTicket(), t.getPlacaVehiculo(), t.getFechaIngreso(),
                        t.getHoraIngreso(), t.getFechaSalida(), t.getHoraSalida(), t.getMontoPagado(), t.getEstado()))
                .toList();
    }
}
