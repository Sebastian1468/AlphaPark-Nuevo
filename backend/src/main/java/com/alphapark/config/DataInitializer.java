package com.alphapark.config;

import com.alphapark.model.Operador;
import com.alphapark.model.ParqueoConfig;
import com.alphapark.model.Rol;
import com.alphapark.repository.OperadorRepository;
import com.alphapark.repository.ParqueoConfigRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

/**
 * Siembra los datos minimos para que el sistema funcione desde el
 * primer arranque: la fila de configuracion del parqueo y los dos
 * usuarios de prueba documentados en el README (gerente1 / lhernandez).
 * Las contrasenas se hashean con BCrypt en tiempo de arranque, por lo
 * que schema.sql ya no necesita traer hashes hardcodeados.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private final ParqueoConfigRepository parqueoConfigRepository;
    private final OperadorRepository operadorRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(ParqueoConfigRepository parqueoConfigRepository,
                            OperadorRepository operadorRepository,
                            PasswordEncoder passwordEncoder) {
        this.parqueoConfigRepository = parqueoConfigRepository;
        this.operadorRepository = operadorRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (parqueoConfigRepository.count() == 0) {
            ParqueoConfig config = new ParqueoConfig();
            config.setCapacidadTotal(100);
            config.setEspaciosOcupados(0);
            config.setTarifaPorHora(new BigDecimal("5.00"));
            parqueoConfigRepository.save(config);
        }

        crearOperadorSiNoExiste("gerente1", "gerente123", Rol.Gerente);
        crearOperadorSiNoExiste("lhernandez", "empleado123", Rol.Empleado);
    }

    private void crearOperadorSiNoExiste(String nombreUsuario, String password, Rol rol) {
        if (!operadorRepository.existsByNombreUsuario(nombreUsuario)) {
            Operador operador = new Operador();
            operador.setNombreUsuario(nombreUsuario);
            operador.setPassword(passwordEncoder.encode(password));
            operador.setRol(rol);
            operadorRepository.save(operador);
        }
    }
}
