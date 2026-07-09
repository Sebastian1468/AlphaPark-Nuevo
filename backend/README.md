# AlphaPark — Backend (Spring Boot)

Backend reestructurado de Node/Express a **Java 17 + Spring Boot + Spring Data JPA
(Hibernate) + MySQL**, siguiendo la arquitectura N-Tier (Multicapa) descrita en el
informe técnico: `controller` → `service` → `repository` → `model`.

El contrato de la API (rutas, formato JSON, códigos de estado) es **idéntico** al
backend anterior en Node, por lo que el frontend en Angular no requiere ningún cambio.

## 1. Estructura de paquetes

```
com.alphapark
├── AlphaparkBackendApplication.java   # arranque de Spring Boot
├── config/        # CORS, BCrypt, siembra de datos iniciales
├── controller/     # capa de entrada / API REST (AccesoController, AuthController, ...)
├── service/         # capa de lógica de negocio (AccesoService, AuthService, ...)
├── repository/       # capa de acceso a datos (Spring Data JPA)
├── model/              # entidades JPA (Ticket, Vehiculo, Operador, ParqueoConfig)
├── dto/                  # objetos de transferencia de datos (request/response)
└── exception/               # manejo centralizado de errores
```

## 2. Requisitos

- Java 17 o superior
- Maven 3.9+ (o usa el wrapper de tu IDE / IntelliJ, como menciona el informe)
- MySQL 8

## 3. Base de datos

```bash
mysql -u root -p < schema.sql
```

Los usuarios de prueba (`gerente1` / `gerente123` y `lhernandez` / `empleado123`) los
crea automáticamente `DataInitializer` la primera vez que arranca la aplicación
(hasheando la contraseña con BCrypt), no hace falta insertarlos a mano.

## 4. Configuración

Por defecto se conecta a `localhost:3306/alphapark_db` con usuario `root` /
`root1234` y expone la API en el puerto `3000` (igual que el backend anterior en
Node). Para cambiar estos valores sin tocar código, exporta variables de entorno
antes de arrancar (ver `.env.example`):

```bash
export DB_HOST=localhost
export DB_USER=root
export DB_PASSWORD=tu_password
export DB_NAME=alphapark_db
export PORT=3000
```

o edítalas directamente en `src/main/resources/application.properties`.

## 5. Ejecutar el backend

```bash
mvn spring-boot:run
```

También puedes importar el proyecto como Maven en **IntelliJ IDEA** (el IDE que
menciona el informe para el backend) y ejecutar `AlphaparkBackendApplication`
directamente.

El servidor queda disponible en `http://localhost:3000`, exactamente igual que antes.

## 6. Endpoints (sin cambios respecto al backend anterior)

- `POST /api/auth/registro` — crea un usuario (`nombre_usuario`, `password`, `rol`)
- `POST /api/auth/login` — inicia sesión
- `GET  /api/parqueo/estado` — aforo y tarifa vigente
- `PUT  /api/parqueo/config` — actualiza `tarifa_por_hora` y/o `capacidad_total`
- `POST /api/tickets/ingreso` — registra el ingreso de un vehículo
- `GET  /api/tickets/activos` — vehículos actualmente dentro
- `PUT  /api/tickets/{id}/salida` — registra la salida y calcula el cobro
- `GET  /api/tickets/historial` — historial de salidas + KPIs
- `GET  /api/estadisticas/resumen` — KPIs del dashboard de gerente
- `GET  /api/estadisticas/ganancias?periodo=dia|semana|mes|anio`
- `GET  /api/estadisticas/hora-pico`
- `GET  /api/vehiculos?buscar=placa`
- `GET  /api/vehiculos/:placa/historial`

## 7. Qué cambió respecto al backend en Node

| Aspecto | Node (antes) | Spring Boot (ahora) |
|---|---|---|
| Lenguaje | JavaScript | Java 17 |
| Framework | Express | Spring Boot |
| Acceso a datos | SQL crudo con `mysql2` | Spring Data JPA / Hibernate |
| Arquitectura | Todo en `server.js` | N-Tier: controller/service/repository/model |
| Hash de contraseña | scrypt (nativo de Node) | BCrypt (Spring Security Crypto) |
| Puerto y rutas | `:3000/api/...` | Idénticos, sin cambios |

El código de Node se conserva sin borrar en `../backend-node-legacy` por si
necesitas comparar o volver atrás.
