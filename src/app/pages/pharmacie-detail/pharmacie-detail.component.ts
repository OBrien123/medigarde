import { Component, inject, OnInit, OnDestroy, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PharmacieService } from '../../core/services/pharmacie.service';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';
import { Pharmacie, Stock, Horaire } from '../../core/models';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-pharmacie-detail',
  standalone: true,
  imports: [RouterLink, FormsModule, DecimalPipe],
  templateUrl: './pharmacie-detail.component.html',
  styleUrl: './pharmacie-detail.component.scss',
})
export class PharmacieDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private pharmacieService = inject(PharmacieService);
  private notifService = inject(NotificationService);
  private auth = inject(AuthService);
  private platformId = inject(PLATFORM_ID);

  pharmacie: Pharmacie | null = null;
  stocks: Stock[] = [];
  horaires: Horaire[] = [];
  loading = true;
  alerteRayon = 2000;
  alerteSuccess = false;
  private map: any;

  readonly joursEntries = [
    { key: 'lundi', label: 'Lundi' },
    { key: 'mardi', label: 'Mardi' },
    { key: 'mercredi', label: 'Mercredi' },
    { key: 'jeudi', label: 'Jeudi' },
    { key: 'vendredi', label: 'Vendredi' },
    { key: 'samedi', label: 'Samedi' },
    { key: 'dimanche', label: 'Dimanche' },
  ];

  get isLoggedIn(): boolean { return this.auth.isLoggedIn; }

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.pharmacieService.get(id).subscribe(p => {
      this.pharmacie = p;
      this.horaires = p.horaires ?? [];
      this.stocks = p.stocks ?? [];
      this.loading = false;
      if (isPlatformBrowser(this.platformId)) setTimeout(() => this.initMap(), 200);
    });
  }

  ngOnDestroy(): void { this.map?.remove(); }

  private initMap(): void {
    if (!this.pharmacie?.latitude || !this.pharmacie?.longitude) return;
    const L = (window as any).L;
    if (!L) return;
    this.map = L.map('detail-map', { zoomControl: true }).setView([this.pharmacie.latitude, this.pharmacie.longitude], 16);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(this.map);
    L.circleMarker([this.pharmacie.latitude, this.pharmacie.longitude], {
      radius: 12, fillColor: '#00D4A0', color: '#fff', weight: 3, fillOpacity: 1,
    }).addTo(this.map).bindPopup(this.pharmacie.nom).openPopup();
  }

  stockBadge(s: Stock): string {
    const st = this.stockStatus(s);
    return st === 'available' ? 'badge--success' : st === 'low' ? 'badge--warning' : 'badge--danger';
  }

  stockLabel(s: Stock): string {
    const st = this.stockStatus(s);
    return st === 'available' ? 'En stock' : st === 'low' ? 'Stock faible' : 'Rupture';
  }

  stockStatus(s: Stock): 'available' | 'low' | 'out' {
    if (!s.disponible) return 'out';
    if (s.quantite <= s.seuil_alerte) return 'low';
    return 'available';
  }

  openItineraire(): void {
    if (!this.pharmacie?.latitude || !this.pharmacie?.longitude) return;
    const dest = `${this.pharmacie.latitude},${this.pharmacie.longitude}`;
    navigator.geolocation.getCurrentPosition(
      pos => window.open(`https://www.google.com/maps/dir/${pos.coords.latitude},${pos.coords.longitude}/${dest}`, '_blank'),
      ()  => window.open(`https://www.google.com/maps/dir//${dest}`, '_blank')
    );
  }

  activerAlerte(): void {
    if (!this.pharmacie) return;
    this.notifService.createAlerte({
      medicament: this.stocks[0]?.medicament,
      rayon: this.alerteRayon,
      pharmacie: this.pharmacie.user_id,
      active: true,
    }).subscribe(() => { this.alerteSuccess = true; });
  }

  getHoraire(jour: string): Horaire | undefined {
    return this.horaires.find(h => h.jour === jour);
  }
}
