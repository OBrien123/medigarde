import { Component, inject, OnInit, OnDestroy, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
})
export class LandingComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private auth = inject(AuthService);
  private platformId = inject(PLATFORM_ID);

  searchQuery = '';
  private map: any;

  readonly popularMeds = ['Paracétamol', 'Amoxicilline', 'Coartem', 'Ibuprofène', 'Chloroquine'];

  readonly previewRows = [
    { name: 'Amoxicilline 500mg', qty: 45, pct: 80, color: 'accent' },
    { name: 'Paracétamol 500mg', qty: 120, pct: 95, color: 'accent' },
    { name: 'Coartem 80/480mg', qty: 8, pct: 20, color: 'warning' },
    { name: 'Doliprane 1000mg', qty: 2, pct: 5, color: 'danger' },
  ];

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadLeaflet().then(() => this.initMap());
    }
  }

  private loadLeaflet(): Promise<void> {
    return new Promise(resolve => {
      if ((window as any).L) { resolve(); return; }
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => resolve();
      document.head.appendChild(script);
    });
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  private async initMap(): Promise<void> {
    const L = (window as any).L;
    if (!L) return;

    this.map = L.map('landing-map', { zoomControl: false, attributionControl: false }).setView([14.6937, -17.4441], 13);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    }).addTo(this.map);

    const pharmacies = [
      { lat: 14.6967, lng: -17.4461, nom: 'Pharmacie Centrale' },
      { lat: 14.6900, lng: -17.4400, nom: 'Pharmacie du Plateau' },
      { lat: 14.7010, lng: -17.4510, nom: 'Pharmacie Liberté' },
      { lat: 14.6850, lng: -17.4380, nom: 'Pharmacie Sacré-Cœur' },
      { lat: 14.7050, lng: -17.4350, nom: 'Pharmacie Mermoz' },
    ];
    pharmacies.forEach(p => {
      const marker = L.circleMarker([p.lat, p.lng], {
        radius: 9, fillColor: '#00D4A0', color: '#0A0F1E', weight: 2, fillOpacity: 0.9,
      }).addTo(this.map);
      marker.bindPopup(`<strong>${p.nom}</strong><br><small style="color:#00D4A0">En stock</small>`);
    });
  }

  searchChip(med: string): void {
    this.searchQuery = med;
    this.search();
  }

  search(): void {
    if (!this.searchQuery.trim()) return;
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          this.router.navigate(['/recherche'], {
            queryParams: {
              q: this.searchQuery,
              lat: pos.coords.latitude,
              lon: pos.coords.longitude,
            },
          });
        },
        () => {
          this.router.navigate(['/recherche'], { queryParams: { q: this.searchQuery } });
        }
      );
    } else {
      this.router.navigate(['/recherche'], { queryParams: { q: this.searchQuery } });
    }
  }

  goToRegister(): void { this.router.navigate(['/inscription']); }
  goToLogin(): void { this.router.navigate(['/connexion']); }
  get isLoggedIn(): boolean { return this.auth.isLoggedIn; }
  goToDashboard(): void {
    const role = this.auth.user?.role;
    if (role === 'pharmacie') this.router.navigate(['/pharmacie/dashboard']);
    else if (role === 'admin') this.router.navigate(['/admin/dashboard']);
    else this.router.navigate(['/historique']); // espace client = historique + alertes
  }
}
