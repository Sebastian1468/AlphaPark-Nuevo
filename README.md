# AlphaPark — Sistema de Gestión de Estacionamientos

## Novedades de esta versión

Se agregó un sistema de **login y registro con dos roles**: `Empleado` y `Gerente`, cada uno con una vista distinta.

- **Empleado**: Registrar Entrada, Mapa de Ocupación, Vehículos Activos, Historial.
- **Gerente**: Dashboard con gráficos de dinero recaudado (filtrable por día/semana/mes/año), gráfico de barras de hora pico, configuración del precio por hora y capacidad, buscador de vehículos con historial por placa, e historial de transacciones.

## 1. Base de datos

Ejecuta el script actualizado (agrega la columna `password` y los roles `Empleado`/`Gerente`):

```bash
mysql -u root -p < backend/schema.sql
```

### Usuarios de prueba (ya vienen creados por el script)

| Usuario     | Contraseña   | Rol       |
|-------------|--------------|-----------|
| `gerente1`  | `gerente123` | Gerente   |
| `lhernandez`| `empleado123`| Empleado  |

También se puede crear cuentas nuevas desde la pantalla **"Crear Cuenta"** de la aplicación (`/crear-cuenta`).

## 2. Backend (Spring Boot)

El backend fue reestructurado a **Java 21 + Spring Boot + Spring
Data JPA + MySQL**, con arquitectura en capas (`controller` → `service` →
`repository` → `model`). El contrato de la API no cambió, así que el frontend
sigue funcionando igual. Detalles completos en [`backend/README.md`](backend/README.md).

```bash
cd backend
mvn spring-boot:run
```

El servidor corre en `http://localhost:3000`. Las contraseñas se guardan hasheadas con **BCrypt**. .

## 3. Frontend

```bash
cd frontend
npm install
ng serve
```

Abre `http://localhost:4200`. Serás redirigido a `/login`.

## 4. Endpoints nuevos del backend

- `POST /api/auth/registro` — crea un usuario (`nombre_usuario`, `password`, `rol`)
- `POST /api/auth/login` — inicia sesión
- `PUT /api/parqueo/config` — actualiza `tarifa_por_hora` y/o `capacidad_total`
- `GET /api/estadisticas/resumen` — KPIs del dashboard de gerente
- `GET /api/estadisticas/ganancias?periodo=dia|semana|mes|anio` — dinero recaudado agrupado
- `GET /api/estadisticas/hora-pico` — ingresos de vehículos agrupados por hora (0-23)
- `GET /api/vehiculos?buscar=placa` — buscador de vehículos con estadísticas de uso
- `GET /api/vehiculos/:placa/historial` — historial de tickets de una placa

## Notas

- La sesión se guarda en `localStorage` (`alphapark_usuario`); no hay JWT ni expiración de sesión — es un login simple pensado para uso interno.
- Las rutas del frontend están protegidas con guards de Angular (`authGuard`, `empleadoGuard`, `gerenteGuard`, `invitadoGuard`) en `src/app/guards/auth-guard.ts`.
- Los gráficos usan **Chart.js** cargado por CDN en `frontend/src/index.html` (no requiere instalación adicional).
