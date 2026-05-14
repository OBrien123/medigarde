import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn) return true;
  return router.createUrlTree(['/connexion']);
};

export const pharmacieGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn && auth.isPharmacist) return true;
  return router.createUrlTree(['/connexion']);
};

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn && auth.isAdmin) return true;
  return router.createUrlTree(['/connexion']);
};

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isLoggedIn) return true;
  const role = auth.user?.role;
  if (role === 'pharmacie') return router.createUrlTree(['/pharmacie/dashboard']);
  if (role === 'admin') return router.createUrlTree(['/admin/dashboard']);
  return router.createUrlTree(['/recherche']);
};
