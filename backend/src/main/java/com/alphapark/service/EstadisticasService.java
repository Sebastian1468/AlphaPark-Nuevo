package com.alphapark.service;

import com.alphapark.dto.estadisticas.PuntoGananciaResponse;
import com.alphapark.dto.estadisticas.PuntoHoraPicoResponse;
import com.alphapark.dto.estadisticas.ResumenResponse;
import com.alphapark.exception.ApiException;
import com.alphapark.model.ParqueoConfig;
import com.alphapark.repository.ParqueoConfigRepository;
import com.alphapark.repository.TicketRepository;
import com.alphapark.repository.projection.GananciaProjection;
import com.alphapark.repository.projection.HoraPicoProjection;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/** Genera los KPIs y series de datos que alimentan los graficos del Gerente. */
@Service
public class EstadisticasService {

    private final ParqueoConfigRepository parqueoConfigRepository;
    private final TicketRepository ticketRepository;

    public EstadisticasService(ParqueoConfigRepository parqueoConfigRepository, TicketRepository ticketRepository) {
        this.parqueoConfigRepository = parqueoConfigRepository;
        this.ticketRepository = ticketRepository;
    }

    public ResumenResponse getResumen() {
        ParqueoConfig config = parqueoConfigRepository.findFirstByOrderByIdConfigAsc()
                .orElseThrow(() -> ApiException.notFound("Configuracion no encontrada"));

        BigDecimal ingresosHoy = redondear(ticketRepository.getIngresosHoy());
        BigDecimal ingresosMes = redondear(ticketRepository.getIngresosMes());
        long vehiculosHoy = ticketRepository.getVehiculosHoy();
        BigDecimal ticketPromedio = redondear(ticketRepository.getTicketPromedio());

        return new ResumenResponse(config.getCapacidadTotal(), config.getEspaciosOcupados(),
                config.getCapacidadTotal() - config.getEspaciosOcupados(), config.getTarifaPorHora(),
                ingresosHoy, ingresosMes, vehiculosHoy, ticketPromedio);
    }

    public List<PuntoGananciaResponse> getGanancias(String periodo) {
        List<GananciaProjection> filas = switch (periodo) {
            case "dia" -> ticketRepository.getGananciasPorDia();
            case "semana" -> ticketRepository.getGananciasPorSemana();
            case "mes" -> ticketRepository.getGananciasPorMes();
            case "anio" -> ticketRepository.getGananciasPorAnio();
            default -> throw ApiException.badRequest("Periodo invalido. Usa dia, semana, mes o anio.");
        };

        return filas.stream()
                .map(f -> new PuntoGananciaResponse(f.getEtiqueta(), redondear(f.getTotal())))
                .toList();
    }

    public List<PuntoHoraPicoResponse> getHoraPico() {
        List<HoraPicoProjection> filas = ticketRepository.getHoraPicoRaw();
        Map<Integer, Long> mapa = new HashMap<>();
        for (HoraPicoProjection f : filas) {
            mapa.put(f.getHora(), f.getCantidad());
        }

        return java.util.stream.IntStream.range(0, 24)
                .mapToObj(hora -> new PuntoHoraPicoResponse(hora, String.format("%02d:00", hora),
                        mapa.getOrDefault(hora, 0L)))
                .toList();
    }

    private BigDecimal redondear(BigDecimal valor) {
        return (valor == null ? BigDecimal.ZERO : valor).setScale(2, RoundingMode.HALF_UP);
    }
}
