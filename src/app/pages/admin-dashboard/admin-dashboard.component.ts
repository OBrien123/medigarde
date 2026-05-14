import { Component, inject, OnInit } from '@angular/core';
import { PharmacieService } from '../../core/services/pharmacie.service';
import { AuthService } from '../../core/services/auth.service';
import { Pharmacie } from '../../core/models';

type NavItem = 'dashboard' | 'pharmacies' | 'pending';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent implements OnInit {
  private pharmacieService = inject(PharmacieService);
  private auth = inject(AuthService);

  activeNav: NavItem = 'dashboard';
  pharmacies: Pharmacie[] = [];
  pending: Pharmacie[] = [];
  loading = true;

  get user() { return this.auth.user; }

  get stats() {
    const total = this.pharmacies.length;
    const active = this.pharmacies.filter(p => p.statut === 'valide').length;
    const enAttente = this.pending.length;
    const suspendu = this.pharmacies.filter(p => p.statut === 'suspendu').length;
    return { total, active, enAttente, suspendu };
  }

  ngOnInit(): void {
    this.pharmacieService.list().subscribe(r => {
      this.pharmacies = r.results;
      this.pending = r.results.filter(p => p.statut === 'en_attente');
      this.loading = false;
    });
  }

  valider(p: Pharmacie): void {
    this.pharmacieService.valider(p.user_id).subscribe(updated => {
      this.updateList(updated);
    });
  }

  suspendre(p: Pharmacie): void {
    this.pharmacieService.suspendre(p.user_id).subscribe(updated => {
      this.updateList(updated);
    });
  }

  private updateList(updated: Pharmacie): void {
    const idx = this.pharmacies.findIndex(p => p.user_id === updated.user_id);
    if (idx >= 0) this.pharmacies[idx] = updated;
    this.pending = this.pharmacies.filter(p => p.statut === 'en_attente');
  }

  logout(): void { this.auth.logout(); }
}
