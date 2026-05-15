import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { StockService } from '../../core/services/stock.service';
import { PharmacieService } from '../../core/services/pharmacie.service';
import { MedicamentService } from '../../core/services/medicament.service';
import { AuthService } from '../../core/services/auth.service';
import { Stock, Pharmacie, Medicament, Horaire } from '../../core/models';

type NavItem = 'dashboard' | 'stocks' | 'horaires' | 'profile';

@Component({
  selector: 'app-pharmacie-dashboard',
  standalone: true,
  imports: [FormsModule, DecimalPipe],
  templateUrl: './pharmacie-dashboard.component.html',
  styleUrl: './pharmacie-dashboard.component.scss',
})
export class PharmacieDashboardComponent implements OnInit {
  private stockService = inject(StockService);
  private pharmacieService = inject(PharmacieService);
  private medicamentService = inject(MedicamentService);
  private auth = inject(AuthService);

  activeNav: NavItem = 'dashboard';
  pharmacie: Pharmacie | null = null;
  stocks: Stock[] = [];
  medicaments: Medicament[] = [];
  loading = true;

  // Stock modal
  showModal = false;
  editingStock: Partial<Stock> | null = null;
  saving = false;

  // Profil edit
  editingProfile: Partial<Pharmacie> | null = null;
  savingProfile = false;
  profileSuccess = false;

  // Horaires
  readonly joursEntries = [
    { key: 'lundi', label: 'Lundi' },
    { key: 'mardi', label: 'Mardi' },
    { key: 'mercredi', label: 'Mercredi' },
    { key: 'jeudi', label: 'Jeudi' },
    { key: 'vendredi', label: 'Vendredi' },
    { key: 'samedi', label: 'Samedi' },
    { key: 'dimanche', label: 'Dimanche' },
  ];
  horaires: Horaire[] = [];
  savingHoraires = false;
  horairesSuccess = false;

  get user() { return this.auth.user; }

  get kpis() {
    const total = this.stocks.length;
    const disponibles = this.stocks.filter(s => s.disponible).length;
    const faibles = this.stocks.filter(s => s.disponible && s.quantite <= s.seuil_alerte).length;
    const ruptures = this.stocks.filter(s => !s.disponible).length;
    return { total, disponibles, faibles, ruptures };
  }

  ngOnInit(): void {
    const userId = this.auth.user?.id;
    if (!userId) { this.loading = false; return; }
    this.medicamentService.list().subscribe(r => this.medicaments = r.results);
    this.pharmacieService.maPharmacie(userId).subscribe({
      next: p => {
        this.pharmacie = p;
        this.initHoraires(p.horaires ?? []);
        this.stockService.byPharmacie(p.user_id).subscribe(r => {
          this.stocks = r.results;
          this.loading = false;
        });
      },
      error: () => { this.loading = false; }
    });
  }

  private initHoraires(existing: Horaire[]): void {
    this.horaires = this.joursEntries.map(j => {
      const found = existing.find(h => h.jour === j.key);
      return found ?? { jour: j.key, ouverture: '08:00', fermeture: '18:00', ferme: false };
    });
  }

  getHoraire(jour: string): Horaire {
    return this.horaires.find(h => h.jour === jour)!;
  }

  saveHoraires(): void {
    if (!this.pharmacie) return;
    this.savingHoraires = true;
    this.pharmacieService.update(this.pharmacie.user_id, { horaires: this.horaires } as any).subscribe({
      next: updated => {
        this.pharmacie = updated;
        this.initHoraires(updated.horaires ?? []);
        this.savingHoraires = false;
        this.horairesSuccess = true;
        setTimeout(() => this.horairesSuccess = false, 3000);
      },
      error: () => { this.savingHoraires = false; }
    });
  }

  startEditProfile(): void {
    if (!this.pharmacie) return;
    this.editingProfile = {
      nom: this.pharmacie.nom,
      adresse: this.pharmacie.adresse,
      ville: this.pharmacie.ville,
      telephone: this.pharmacie.telephone,
      email: this.pharmacie.email,
    };
    this.profileSuccess = false;
  }

  cancelEditProfile(): void { this.editingProfile = null; }

  saveProfile(): void {
    if (!this.editingProfile || !this.pharmacie) return;
    this.savingProfile = true;
    this.pharmacieService.update(this.pharmacie.user_id, this.editingProfile).subscribe({
      next: updated => {
        this.pharmacie = updated;
        this.editingProfile = null;
        this.savingProfile = false;
        this.profileSuccess = true;
        setTimeout(() => this.profileSuccess = false, 3000);
      },
      error: () => { this.savingProfile = false; }
    });
  }

  // ── Stock helpers ──────────────────────────────────────────────────────────
  medicamentNom(med: Medicament): string {
    return `${med.nom_generique} ${med.dosage}${med.nom_commercial ? ' (' + med.nom_commercial + ')' : ''}`;
  }

  stockStatus(s: Stock): 'available' | 'low' | 'out' {
    if (!s.disponible) return 'out';
    if (s.quantite <= s.seuil_alerte) return 'low';
    return 'available';
  }

  stockBadge(s: Stock): string {
    const st = this.stockStatus(s);
    return st === 'available' ? 'badge--success' : st === 'low' ? 'badge--warning' : 'badge--danger';
  }

  stockLabel(s: Stock): string {
    const st = this.stockStatus(s);
    return st === 'available' ? 'En stock' : st === 'low' ? 'Faible' : 'Rupture';
  }

  stockPercent(s: Stock): number {
    const max = Math.max(s.quantite, s.seuil_alerte * 3, 100);
    return Math.round((s.quantite / max) * 100);
  }

  openAdd(): void {
    this.editingStock = { quantite: 0, prix: 0, seuil_alerte: 10 };
    this.showModal = true;
  }

  openEdit(s: Stock): void { this.editingStock = { ...s }; this.showModal = true; }
  closeModal(): void { this.showModal = false; this.editingStock = null; }

  saveStock(): void {
    if (!this.editingStock) return;
    this.saving = true;
    if (this.editingStock['id']) {
      this.stockService.update(this.editingStock['id'] as number, this.editingStock).subscribe({
        next: updated => {
          const idx = this.stocks.findIndex(s => s.id === updated.id);
          if (idx >= 0) this.stocks[idx] = updated;
          this.saving = false; this.closeModal();
        },
        error: () => { this.saving = false; }
      });
    } else {
      this.stockService.create({ ...this.editingStock, pharmacie: this.pharmacie!.user_id }).subscribe({
        next: created => { this.stocks.unshift(created); this.saving = false; this.closeModal(); },
        error: () => { this.saving = false; }
      });
    }
  }

  deleteStock(id: number): void {
    if (!confirm('Supprimer ce stock ?')) return;
    this.stockService.delete(id).subscribe(() => {
      this.stocks = this.stocks.filter(s => s.id !== id);
    });
  }

  logout(): void { this.auth.logout(); }
}
