package com.alphapark.service;

import com.alphapark.dto.parqueo.ActualizarConfigResponse;
import com.alphapark.dto.parqueo.EstadoParqueoResponse;
import com.alphapark.dto.tickets.HistorialResponse;
import com.alphapark.dto.tickets.IngresoResponse;
import com.alphapark.dto.tickets.KpisHistorial;
import com.alphapark.dto.tickets.RegistroHistorialItem;
import com.alphapark.dto.tickets.SalidaResponse;
import com.alphapark.dto.tickets.TicketActivoResponse;
import com.alphapark.exception.ApiException;
import com.alphapark.model.EstadoTicket;
import com.alphapark.model.ParqueoConfig;
import com.alphapark.model.Ticket;
import com.alphapark.model.TipoVehiculo;
import com.alphapark.model.Vehiculo;
import com.alphapark.repository.ParqueoConfigRepository;
import com.alphapark.repository.TicketRepository;
import com.alphapark.repository.VehiculoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
public class AccesoService {

    private final TicketRepository ticketRepository;
    private final VehiculoRepository vehiculoRepository;
    private final ParqueoConfigRepository parqueoConfigRepository;

    public AccesoService(TicketRepository ticketRepository,
                          VehiculoRepository vehiculoRepository,
                          ParqueoConfigRepository parqueoConfigRepository) {
        this.ticketRepository = ticketRepository;
        this.vehiculoRepository = vehiculoRepository;
        this.parqueoConfigRepository = parqueoConfigRepository;
    }

    private ParqueoConfig obtenerConfig() {
        return parqueoConfigRepository.findFirstByOrderByIdConfigAsc()
                .orElseThrow(() -> ApiException.notFound("Configuracion no encontrada"));
    }

    // -----------------------------------------------------------
    // Aforo / configuracion
    // -----------------------------------------------------------

    public EstadoParqueoResponse consultarEstado() {
        ParqueoConfig config = obtenerConfig();
        int disponibles = config.getCapacidadTotal() - config.getEspaciosOcupados();
        boolean lleno = config.getEspaciosOcupados() >= config.getCapacidadTotal();
        return new EstadoParqueoResponse(config.getCapacidadTotal(), config.getEspaciosOcupados(),
                disponibles, lleno, config.getTarifaPorHora());
    }

    @Transactional
    public ActualizarConfigResponse actualizarConfig(BigDecimal tarifaPorHora, Integer capacidadTotal) {
        if (tarifaPorHora == null && capacidadTotal == null) {
            throw ApiException.badRequest("Debes enviar tarifa_por_hora y/o capacidad_total.");
        }
        if (tarifaPorHora != null && tarifaPorHora.compareTo(BigDecimal.ZERO) <= 0) {
            throw ApiException.badRequest("La tarifa por hora debe ser un numero mayor a 0.");
        }
        if (capacidadTotal != null && capacidadTotal <= 0) {
            throw ApiException.badRequest("La capacidad total debe ser un numero mayor a 0.");
        }

        ParqueoConfig config = obtenerConfig();
        if (capacidadTotal != null && capacidadTotal < config.getEspaciosOcupados()) {
            throw ApiException.badRequest(
                    "La capacidad no puede ser menor a los " + config.getEspaciosOcupados() + " espacios ya ocupados.");
        }

        if (tarifaPorHora != null) {
            config.setTarifaPorHora(tarifaPorHora);
        }
        if (capacidadTotal != null) {
            config.setCapacidadTotal(capacidadTotal);
        }
        parqueoConfigRepository.save(config);

        return new ActualizarConfigResponse("Configuracion actualizada con exito",
                config.getCapacidadTotal(), config.getTarifaPorHora());
    }

    // -----------------------------------------------------------
    // Ingreso
    // -----------------------------------------------------------

    @Transactional
    public IngresoResponse registrarIngresoAutomatizado(String placaVehiculo, Integer idOperador) {
        if (placaVehiculo == null || placaVehiculo.isBlank() || idOperador == null) {
            throw ApiException.badRequest("Placa y ID de operador son requeridos.");
        }

        ParqueoConfig config = obtenerConfig();
        if (!validarAforoDisponible(config)) {
            throw ApiException.badRequest("Ingreso denegado: Parqueo LLENO.");
        }

        String placa = placaVehiculo.toUpperCase();
        if (!vehiculoRepository.existsById(placa)) {
            vehiculoRepository.save(new Vehiculo(placa, TipoVehiculo.Auto));
        }

        LocalDateTime ahora = LocalDateTime.now();
        Ticket ticket = new Ticket();
        ticket.setPlacaVehiculo(placa);
        ticket.setIdOperador(idOperador);
        ticket.setFechaIngreso(ahora.toLocalDate());
        ticket.setHoraIngreso(ahora.toLocalTime().withNano(0));
        ticket.setEstado(EstadoTicket.Activo);
        ticket = ticketRepository.save(ticket);

        config.setEspaciosOcupados(config.getEspaciosOcupados() + 1);
        parqueoConfigRepository.save(config);

        return new IngresoResponse("Ticket generado con exito", ticket.getIdTicket(), placa, idOperador,
                ticket.getFechaIngreso(), ticket.getHoraIngreso());
    }

    /** Valida si existe capacidad disponible antes de permitir un nuevo ingreso. */
    private boolean validarAforoDisponible(ParqueoConfig config) {
        return config.getEspaciosOcupados() < config.getCapacidadTotal();
    }

    // -----------------------------------------------------------
    // Activos
    // -----------------------------------------------------------

    public List<TicketActivoResponse> listarActivos() {
        BigDecimal tarifa = obtenerConfig().getTarifaPorHora();
        LocalDateTime ahora = LocalDateTime.now();

        return ticketRepository.findByEstadoOrderByIdTicketDesc(EstadoTicket.Activo).stream()
                .map(t -> {
                    long minutos = calcularMinutos(t.getFechaIngreso(), t.getHoraIngreso(),
                            ahora.toLocalDate(), ahora.toLocalTime());
                    String horasTexto = (minutos / 60) + "h " + (minutos % 60) + "m";
                    return new TicketActivoResponse(t.getIdTicket(), t.getPlacaVehiculo(), t.getFechaIngreso(),
                            t.getHoraIngreso(), minutos, horasTexto, calcularCobro(minutos, tarifa));
                })
                .toList();
    }

    // -----------------------------------------------------------
    // Salida
    // -----------------------------------------------------------

    @Transactional
    public SalidaResponse registrarSalidaAutomatizada(Integer idTicket) {
        Ticket ticket = ticketRepository.findById(idTicket)
                .orElseThrow(() -> ApiException.notFound("Ticket no encontrado."));
        if (ticket.getEstado() != EstadoTicket.Activo) {
            throw ApiException.badRequest("Este ticket ya fue cerrado anteriormente.");
        }

        ParqueoConfig config = obtenerConfig();
        LocalDateTime ahora = LocalDateTime.now();
        LocalDate fechaSalida = ahora.toLocalDate();
        LocalTime horaSalida = ahora.toLocalTime().withNano(0);

        long minutos = calcularMinutos(ticket.getFechaIngreso(), ticket.getHoraIngreso(), fechaSalida, horaSalida);
        BigDecimal monto = calcularCobro(minutos, config.getTarifaPorHora());

        ticket.setEstado(EstadoTicket.Finalizado);
        ticket.setFechaSalida(fechaSalida);
        ticket.setHoraSalida(horaSalida);
        ticket.setMontoPagado(monto);
        ticketRepository.save(ticket);

        config.setEspaciosOcupados(Math.max(config.getEspaciosOcupados() - 1, 0));
        parqueoConfigRepository.save(config);

        return new SalidaResponse("Salida registrada con exito", idTicket, ticket.getPlacaVehiculo(), minutos, monto);
    }

    // -----------------------------------------------------------
    // Historial
    // -----------------------------------------------------------

    public HistorialResponse obtenerHistorial() {
        List<Ticket> finalizados = ticketRepository.findByEstadoOrderByIdTicketDesc(EstadoTicket.Finalizado);

        List<RegistroHistorialItem> registros = finalizados.stream()
                .map(t -> new RegistroHistorialItem(t.getIdTicket(), t.getPlacaVehiculo(), t.getFechaIngreso(),
                        t.getHoraIngreso(), t.getFechaSalida(), t.getHoraSalida(), t.getMontoPagado(),
                        calcularMinutos(t.getFechaIngreso(), t.getHoraIngreso(), t.getFechaSalida(), t.getHoraSalida())))
                .toList();

        LocalDate hoy = LocalDate.now();
        long totalRegistros = registros.size();
        long salidasHoy = finalizados.stream().filter(t -> hoy.equals(t.getFechaSalida())).count();
        BigDecimal ingresosTotales = registros.stream()
                .map(RegistroHistorialItem::getMontoPagado)
                .filter(m -> m != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);
        double duracionPromedioMin = totalRegistros > 0
                ? registros.stream().mapToLong(RegistroHistorialItem::getDuracionMinutos).average().orElse(0)
                : 0;
        double duracionPromedioHoras = Math.round((duracionPromedioMin / 60) * 10) / 10.0;

        KpisHistorial kpis = new KpisHistorial(totalRegistros, salidasHoy, ingresosTotales, duracionPromedioHoras);
        return new HistorialResponse(kpis, registros);
    }

    // -----------------------------------------------------------
    // Utilidades de calculo (equivalentes a calcularCobro / calcularMinutos en Node)
    // -----------------------------------------------------------

    /** Se cobra el equivalente a 1 hora como minimo, luego se prorratea por minuto. */
    private BigDecimal calcularCobro(long minutos, BigDecimal tarifaPorHora) {
        BigDecimal horas = BigDecimal.valueOf(minutos).divide(BigDecimal.valueOf(60), 10, RoundingMode.HALF_UP);
        BigDecimal cobro = horas.multiply(tarifaPorHora);
        if (cobro.compareTo(tarifaPorHora) < 0) {
            cobro = tarifaPorHora;
        }
        return cobro.setScale(2, RoundingMode.HALF_UP);
    }

    private long calcularMinutos(LocalDate fechaIngreso, LocalTime horaIngreso, LocalDate fechaRef, LocalTime horaRef) {
        if (fechaIngreso == null || horaIngreso == null || fechaRef == null || horaRef == null) {
            return 0;
        }
        LocalDateTime ingreso = LocalDateTime.of(fechaIngreso, horaIngreso);
        LocalDateTime referencia = LocalDateTime.of(fechaRef, horaRef);
        return Math.max(0, Duration.between(ingreso, referencia).toMinutes());
    }
}
