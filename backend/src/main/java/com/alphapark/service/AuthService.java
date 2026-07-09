package com.alphapark.service;

import com.alphapark.dto.auth.UsuarioResponse;
import com.alphapark.exception.ApiException;
import com.alphapark.model.Operador;
import com.alphapark.model.Rol;
import com.alphapark.repository.OperadorRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
public class AuthService {

    private final OperadorRepository operadorRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(OperadorRepository operadorRepository, PasswordEncoder passwordEncoder) {
        this.operadorRepository = operadorRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public UsuarioResponse registrar(String nombreUsuario, String password, String rolTexto) {
        if (nombreUsuario == null || nombreUsuario.isBlank() || password == null || rolTexto == null) {
            throw ApiException.badRequest("Usuario, contrasena y rol son requeridos.");
        }

        Rol rol;
        try {
            rol = Rol.valueOf(rolTexto);
        } catch (IllegalArgumentException ex) {
            throw ApiException.badRequest("El rol debe ser 'Empleado' o 'Gerente'.");
        }

        if (password.length() < 6) {
            throw ApiException.badRequest("La contrasena debe tener al menos 6 caracteres.");
        }
        if (operadorRepository.existsByNombreUsuario(nombreUsuario)) {
            throw ApiException.conflict("Ese nombre de usuario ya esta en uso.");
        }

        Operador operador = new Operador();
        operador.setNombreUsuario(nombreUsuario);
        operador.setPassword(passwordEncoder.encode(password));
        operador.setRol(rol);
        operador = operadorRepository.save(operador);

        return new UsuarioResponse("Cuenta creada con exito", operador.getIdOperador(),
                operador.getNombreUsuario(), operador.getRol());
    }

    public UsuarioResponse login(String nombreUsuario, String password) {
        if (nombreUsuario == null || nombreUsuario.isBlank() || password == null || password.isBlank()) {
            throw ApiException.badRequest("Usuario y contrasena son requeridos.");
        }

        Operador operador = operadorRepository.findByNombreUsuario(nombreUsuario)
                .orElseThrow(() -> ApiException.unauthorized("Usuario o contrasena incorrectos."));

        if (!passwordEncoder.matches(password, operador.getPassword())) {
            throw ApiException.unauthorized("Usuario o contrasena incorrectos.");
        }

        return new UsuarioResponse("Inicio de sesion exitoso", operador.getIdOperador(),
                operador.getNombreUsuario(), operador.getRol());
    }
}
