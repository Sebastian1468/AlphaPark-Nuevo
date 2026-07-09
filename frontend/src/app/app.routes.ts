import { Routes } from '@angular/router';
import { RegistroComponent } from './componentes/registro/registro';
import { ActivosComponent } from './componentes/activos/activos';
import { HistorialComponent } from './componentes/historial/historial';
import { MapaComponent } from './componentes/mapa/mapa';
import { LoginComponent } from './componentes/login/login';
import { CrearCuentaComponent } from './componentes/crear-cuenta/crear-cuenta';
import { DashboardComponent } from './componentes/dashboard/dashboard';
import { InicioComponent } from './componentes/inicio/inicio';
import { authGuard, empleadoGuard, gerenteGuard, invitadoGuard } from './guards/auth-guard';

export const routes: Routes = [
  // Landing page pública (si ya hay sesión, se redirige directo a su vista)
  { path: '', component: InicioComponent, pathMatch: 'full', canActivate: [invitadoGuard] },

  // Público (solo si no hay sesión activa)
  { path: 'login', component: LoginComponent, canActivate: [invitadoGuard] },
  { path: 'crear-cuenta', component: CrearCuentaComponent, canActivate: [invitadoGuard] },

  // Vista de Empleado (operación diaria del parqueo)
  { path: 'registro', component: RegistroComponent, canActivate: [authGuard, empleadoGuard] },
  { path: 'mapa', component: MapaComponent, canActivate: [authGuard, empleadoGuard] },
  { path: 'activos', component: ActivosComponent, canActivate: [authGuard, empleadoGuard] },
  { path: 'historial', component: HistorialComponent, canActivate: [authGuard, empleadoGuard] },

  // Vista de Gerente (dashboard con gráficos y estadísticas)
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard, gerenteGuard] },

  { path: '**', redirectTo: '' }
];
