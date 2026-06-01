import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PharmacieService } from '../../core/services/pharmacie.service';
import { MedicamentService } from '../../core/services/medicament.service';
import { AuthService } from '../../core/services/auth.service';
import { Pharmacie, Medicament } from '../../core/models';

type NavItem = 'dashboard' | 'pharmacies' | 'pending' | 'suspendues' | 'medicaments';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent implements OnInit {
  private pharmacieService = inject(PharmacieService);
  private medicamentService = inject(MedicamentService);
  private auth = inject(AuthService);

  activeNav: NavItem = 'dashboard';
  pharmacies: Pharmacie[] = [];
  pending: Pharmacie[] = [];
  loading = true;

  // Suivi chargement par pharmacie
  processingId: number | null = null;

  // Médicaments
  medicaments: Medicament[] = [];
  loadingMeds = false;
  showAddMed = false;
  savingMed = false;
  newMed: Partial<Medicament> & { categorie_id?: number } = {};
  deletingMedId: number | null = null;

  get user() { return this.auth.user; }

  get stats() {
    const total = this.pharmacies.length;
    const active = this.pharmacies.filter(p => p.statut === 'valide').length;
    const enAttente = this.pending.length;
    const suspendu = this.pharmacies.filter(p => p.statut === 'suspendu').length;
    return { total, active, enAttente, suspendu };
  }

  get suspendues(): Pharmacie[] {
    return this.pharmacies.filter(p => p.statut === 'suspendu');
  }

  isProcessing(id: number): boolean {
    return this.processingId === id;
  }

  ngOnInit(): void {
    this.pharmacieService.list({ page_size: '100' } as any).subscribe(r => {
      this.pharmacies = r.results;
      this.pending = r.results.filter(p => p.statut === 'en_attente');
      this.loading = false;
    });
  }

  loadMedicaments(): void {
    if (this.medicaments.length) return;
    this.loadingMeds = true;
    this.medicamentService.list().subscribe(r => {
      this.medicaments = r.results;
      this.loadingMeds = false;
    });
  }

  goTo(nav: NavItem): void {
    this.activeNav = nav;
    if (nav === 'medicaments') this.loadMedicaments();
  }

  valider(p: Pharmacie): void {
    this.processingId = p.user_id;
    this.pharmacieService.valider(p.user_id).subscribe({
      next: updated => { this.updateList(updated); this.processingId = null; },
      error: () => { this.processingId = null; }
    });
  }

  suspendre(p: Pharmacie): void {
    this.processingId = p.user_id;
    this.pharmacieService.suspendre(p.user_id).subscribe({
      next: updated => { this.updateList(updated); this.processingId = null; },
      error: () => { this.processingId = null; }
    });
  }

  reactiver(p: Pharmacie): void {
    this.processingId = p.user_id;
    this.pharmacieService.valider(p.user_id).subscribe({
      next: updated => { this.updateList(updated); this.processingId = null; },
      error: () => { this.processingId = null; }
    });
  }

  private updateList(updated: Pharmacie): void {
    const idx = this.pharmacies.findIndex(p => p.user_id === updated.user_id);
    if (idx >= 0) this.pharmacies[idx] = updated;
    this.pending = this.pharmacies.filter(p => p.statut === 'en_attente');
  }

  // ── Médicaments ──────────────────────────────────────────────────────────
  openAddMed(): void {
    this.newMed = { nom_generique: '', dosage: '', forme: '', prescription: false };
    this.showAddMed = true;
  }

  cancelAddMed(): void { this.showAddMed = false; this.newMed = {}; }

  saveMed(): void {
    if (!this.newMed.nom_generique || !this.newMed.dosage) return;
    this.savingMed = true;
    // POST via HttpClient directement via le service
    this.medicamentService.create(this.newMed as any).subscribe({
      next: created => {
        this.medicaments.unshift(created);
        this.savingMed = false;
        this.cancelAddMed();
      },
      error: () => { this.savingMed = false; }
    });
  }

  deleteMed(id: number): void {
    if (!confirm('Supprimer ce médicament ?')) return;
    this.deletingMedId = id;
    this.medicamentService.delete(id).subscribe({
      next: () => {
        this.medicaments = this.medicaments.filter(m => m.id !== id);
        this.deletingMedId = null;
      },
      error: () => { this.deletingMedId = null; }
    });
  }

  logout(): void { this.auth.logout(); }
}
