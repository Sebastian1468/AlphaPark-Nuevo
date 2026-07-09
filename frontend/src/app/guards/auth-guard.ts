import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

// Permite el acceso solo si hay una sesión iniciada (Empleado o Gerente)
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.estaLogueado()) return true;

  router.navigate(['/login']);
  return false;
};

// Permite el acceso solo a usuarios con rol Gerente
export const gerenteGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.esGerente()) return true;

  router.navigate(auth.estaLogueado() ? ['/registro'] : ['/login']);
  return false;
};

// Permite el acceso solo a usuarios con rol Empleado
export const empleadoGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.esEmpleado()) return true;

  router.navigate(auth.estaLogueado() ? ['/dashboard'] : ['/login']);
  return false;
};

// Evita que un usuario ya logueado vuelva a ver login/registro
export const invitadoGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.estaLogueado()) return true;

  router.navigate(auth.esGerente() ? ['/dashboard'] : ['/registro']);
  return false;
};
