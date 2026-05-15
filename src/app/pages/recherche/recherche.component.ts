import { Component, inject, OnInit, OnDestroy, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { RechercheService } from '../../core/services/recherche.service';
import { AuthService } from '../../core/services/auth.service';
import { Pharmacie } from '../../core/models';

@Component({
  selector: 'app-recherche',
  standalone: true,
  imports: [FormsModule, RouterLink, DecimalPipe],
  templateUrl: './recherche.component.html',
  styleUrl: './recherche.component.scss',
})
export class RechercheComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private rechercheService = inject(RechercheService);
  private auth = inject(AuthService);
  private platformId = inject(PLATFORM_ID);

  searchQuery = '';
  results: Pharmacie[] = [];
  filteredResults: Pharmacie[] = [];
  loading = false;
  error = '';
  selectedResult: Pharmacie | null = null;
  mapReady = false;
  userLat = 14.6937;
  userLng = -17.4441;

  // Filtres
  showFilters = false;
  filterVille = '';
  filterRayon = 10000;
  readonly rayonOptions = [
    { label: '1 km', value: 1000 },
    { label: '3 km', value: 3000 },
    { label: '5 km', value: 5000 },
    { label: '10 km', value: 10000 },
    { label: '20 km', value: 20000 },
  ];

  get user() { return this.auth.user; }

  private map: any;
  private markers: any[] = [];

  ngOnInit(): void {
    const params = this.route.snapshot.queryParams;
    this.searchQuery = params['q'] || '';
    if (params['lat']) this.userLat = +params['lat'];
    if (params['lng']) this.userLng = +params['lng'];
    if (params['lon']) this.userLng = +params['lon'];

    if (isPlatformBrowser(this.platformId)) {
      this.loadLeaflet().then(() => {
        this.initMap();
        if (this.searchQuery) this.search();
      });
    }
  }

  ngOnDestroy(): void { this.map?.remove(); }

  private loadLeaflet(): Promise<void> {
    return new Promise(resolve => {
      if ((window as any).L) { resolve(); return; }
      // Leaflet JS depuis CDN si pas encore chargé
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => resolve();
      document.head.appendChild(script);
    });
  }

  private initMap(): void {
    const L = (window as any).L;
    if (!L) return;
    this.map = L.map('results-map', { zoomControl: true }).setView([this.userLat, this.userLng], 13);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap © CARTO'
    }).addTo(this.map);
    L.circleMarker([this.userLat, this.userLng], {
      radius: 8, fillColor: '#3B82F6', color: '#fff', weight: 2, fillOpacity: 1,
    }).addTo(this.map).bindPopup('<strong>Votre position</strong>');
    this.mapReady = true;
  }

  applyFilters(): void {
    let res = [...this.results];
    if (this.filterVille.trim()) {
      const v = this.filterVille.trim().toLowerCase();
      res = res.filter(p => p.ville?.toLowerCase().includes(v));
    }
    if (this.filterRayon) {
      res = res.filter(p => !p.distance || p.distance <= this.filterRayon);
    }
    this.filteredResults = res;
    this.updateMapMarkers();
  }

  resetFilters(): void {
    this.filterVille = '';
    this.filterRayon = 10000;
    this.applyFilters();
  }

  search(): void {
    if (!this.searchQuery.trim()) return;
    this.loading = true; this.error = '';
    this.router.navigate([], {
      queryParams: { q: this.searchQuery, lat: this.userLat, lng: this.userLng },
      replaceUrl: true
    });

    this.rechercheService.chercherMedicament(this.searchQuery).subscribe({
      next: medRes => {
        const medId = medRes.results[0]?.id;
        this.rechercheService.chercherPharmaciesProches(this.userLat, this.userLng, medId, this.filterRayon).subscribe({
          next: pharmacies => {
            this.results = pharmacies;
            this.filteredResults = pharmacies;
            this.loading = false;
            this.applyFilters();
            if (this.filteredResults.length > 0) this.selectResult(this.filteredResults[0]);
          },
          error: () => { this.loading = false; this.error = 'Erreur lors de la recherche.'; }
        });
      },
      error: () => {
        this.rechercheService.chercherPharmaciesProches(this.userLat, this.userLng, undefined, this.filterRayon).subscribe({
          next: pharmacies => {
            this.results = pharmacies;
            this.filteredResults = pharmacies;
            this.loading = false;
            this.applyFilters();
          },
          error: () => { this.loading = false; this.error = 'Erreur lors de la recherche.'; }
        });
      }
    });
  }

  selectResult(p: Pharmacie): void {
    this.selectedResult = p;
    if (this.map && p.latitude && p.longitude) {
      this.map.setView([+p.latitude, +p.longitude], 15);
    }
  }

  private updateMapMarkers(): void {
    const L = (window as any).L;
    if (!L || !this.map) return;
    this.markers.forEach(m => m.remove());
    this.markers = [];
    this.filteredResults.forEach(p => {
      if (!p.latitude || !p.longitude) return;
      const m = L.circleMarker([+p.latitude, +p.longitude], {
        radius: 10, fillColor: '#00D4A0', color: '#fff', weight: 2, fillOpacity: 1,
      }).addTo(this.map);
      m.bindPopup(`<strong>${p.nom}</strong><br>${p.adresse}`);
      m.on('click', () => this.selectResult(p));
      this.markers.push(m);
    });
  }

  locateMe(): void {
    navigator.geolocation.getCurrentPosition(pos => {
      this.userLat = pos.coords.latitude;
      this.userLng = pos.coords.longitude;
      this.map?.setView([this.userLat, this.userLng], 14);
      if (this.searchQuery) this.search();
    }, () => {
      alert('Impossible d\'obtenir votre position. Vérifiez les permissions du navigateur.');
    });
  }

  formatDistance(m?: number): string {
    if (!m) return '';
    return m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`;
  }

  logout(): void { this.auth.logout(); }
}
