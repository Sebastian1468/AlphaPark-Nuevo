import { Routes } from '@angular/router';
import { RegistroComponent } from './componentes/registro/registro';
import { ActivosComponent } from './componentes/activos/activos';
import { HistorialComponent } from './componentes/historial/historial';
import { MapaComponent } from './componentes/mapa/mapa';

export const routes: Routes = [
  { path: 'registro', component: RegistroComponent },
  { path: 'activos', component: ActivosComponent },
  { path: 'historial', component: HistorialComponent },
  { path: 'mapa', component: MapaComponent },
  { path: '', redirectTo: '/registro', pathMatch: 'full' },
  { path: '**', redirectTo: '/registro' }
];