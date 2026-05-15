import { Routes } from '@angular/router';
import { authGuard, guestGuard, pharmacieGuard, adminGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/landing/landing.component').then(m => m.LandingComponent) },
  {
    path: 'connexion',
    loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent),
    canActivate: [guestGuard],
  },
  {
    path: 'inscription',
    loadComponent: () => import('./pages/auth/register/register.component').then(m => m.RegisterComponent),
    canActivate: [guestGuard],
  },
  {
    path: 'recherche',
    loadComponent: () => import('./pages/recherche/recherche.component').then(m => m.RechercheComponent),
  },
  {
    path: 'pharmacie/dashboard',
    loadComponent: () => import('./pages/pharmacie-dashboard/pharmacie-dashboard.component').then(m => m.PharmacieDashboardComponent),
    canActivate: [pharmacieGuard],
  },
  {
    path: 'pharmacie/:id',
    loadComponent: () => import('./pages/pharmacie-detail/pharmacie-detail.component').then(m => m.PharmacieDetailComponent),
  },
  {
    path: 'historique',
    loadComponent: () => import('./pages/historique/historique.component').then(m => m.HistoriqueComponent),
    canActivate: [authGuard],
  },
  {
    path: 'alertes',
    loadComponent: () => import('./pages/alertes/alertes.component').then(m => m.AlertesComponent),
    canActivate: [authGuard],
  },
  {
    path: 'profil',
    loadComponent: () => import('./pages/profil/profil.component').then(m => m.ProfilComponent),
    canActivate: [authGuard],
  },
  {
    path: 'admin/dashboard',
    loadComponent: () => import('./pages/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    canActivate: [adminGuard],
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent),
  },
];
