import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { StockService } from '../../core/services/stock.service';
import { PharmacieService } from '../../core/services/pharmacie.service';
import { AuthService } from '../../core/services/auth.service';
import { Stock, Pharmacie } from '../../core/models';

type NavItem = 'dashboard' | 'stocks' | 'profile';

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
  private auth = inject(AuthService);
  private router = inject(Router);

  activeNav: NavItem = 'dashboard';
  pharmacie: Pharmacie | null = null;
  stocks: Stock[] = [];
  loading = true;

  // Modal ajout/édition
  showModal = false;
  editingStock: Partial<Stock> | null = null;
  saving = false;

  get user() { return this.auth.user; }

  get kpis() {
    const total = this.stocks.length;
    const disponibles = this.stocks.filter(s => s.disponible).length;
    const faibles = this.stocks.filter(s => s.disponible && s.quantite <= s.seuil_alerte).length;
    const ruptures = this.stocks.filter(s => !s.disponible).length;
    return { total, disponibles, faibles, ruptures };
  }

  get filteredStocks(): Stock[] {
    return this.stocks;
  }

  ngOnInit(): void {
    const userId = this.auth.user?.id;
    if (!userId) { this.loading = false; return; }
    // Le PK de Pharmacie = user.id (OneToOneField primary_key)
    this.pharmacieService.maPharmacie(userId).subscribe({
      next: p => {
        this.pharmacie = p;
        this.stockService.byPharmacie(p.user_id).subscribe(r => {
          this.stocks = r.results;
          this.loading = false;
        });
      },
      error: () => { this.loading = false; }
    });
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

  openEdit(s: Stock): void {
    this.editingStock = { ...s };
    this.showModal = true;
  }

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
        next: created => {
          this.stocks.unshift(created);
          this.saving = false; this.closeModal();
        },
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
