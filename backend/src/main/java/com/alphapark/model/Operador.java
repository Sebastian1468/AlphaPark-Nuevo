package com.alphapark.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.sql.Timestamp;

/**
 * Entidad espejo de la tabla operadores. Representa al personal
 * autenticado (Empleado o Gerente) encargado de supervisar los accesos
 * y ejecutar las operaciones en el sistema web.
 */
@Entity
@Table(name = "operadores")
@Getter
@Setter
@NoArgsConstructor
public class Operador {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_operador")
    private Integer idOperador;

    @Column(name = "nombre_usuario", nullable = false, unique = true, length = 50)
    private String nombreUsuario;

    /** Password ya hasheado con BCrypt (ver AuthService). */
    @Column(name = "password", nullable = false, length = 255)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(name = "rol", nullable = false)
    private Rol rol = Rol.Empleado;

    @CreationTimestamp
    @Column(name = "fecha_creacion", insertable = true, updatable = false)
    private Timestamp fechaCreacion;
}
