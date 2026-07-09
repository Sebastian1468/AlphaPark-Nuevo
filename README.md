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

> Si ya tenías la base de datos creada con la tabla `operadores` anterior (roles `Operador`/`Administrador`), bórrala y vuelve a crearla con este script, o migra manualmente agregando la columna `password` y ajustando el ENUM `rol`.

### Usuarios de prueba (ya vienen creados por el script)

| Usuario     | Contraseña   | Rol       |
|-------------|--------------|-----------|
| `gerente1`  | `gerente123` | Gerente   |
| `lhernandez`| `empleado123`| Empleado  |

También puedes crear cuentas nuevas desde la pantalla **"Crear Cuenta"** de la aplicación (`/crear-cuenta`).

## 2. Backend

```bash
cd backend
npm install
cp .env.example .env   # ajusta usuario/clave de MySQL si hace falta
npm start
```

El servidor corre en `http://localhost:3000`. Las contraseñas se guardan hasheadas con `scrypt` (módulo nativo `crypto` de Node), no se agregó ninguna dependencia nueva.

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
