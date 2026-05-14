import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { RechercheService } from '../../core/services/recherche.service';
import { AuthService } from '../../core/services/auth.service';
import { Recherche } from '../../core/models';

interface GroupedHistory {
  date: string;
  items: Recherche[];
}

@Component({
  selector: 'app-historique',
  standalone: true,
  imports: [RouterLink, DatePipe, TitleCasePipe],
  templateUrl: './historique.component.html',
  styleUrl: './historique.component.scss',
})
export class HistoriqueComponent implements OnInit {
  private rechercheService = inject(RechercheService);
  private auth = inject(AuthService);

  history: Recherche[] = [];
  grouped: GroupedHistory[] = [];
  loading = true;

  get user() { return this.auth.user; }

  ngOnInit(): void {
    this.rechercheService.historique().subscribe({
      next: r => {
        this.history = r.results;
        this.grouped = this.groupByDate(r.results);
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  private groupByDate(items: Recherche[]): GroupedHistory[] {
    const map = new Map<string, Recherche[]>();
    items.forEach(r => {
      const d = new Date(r.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
      if (!map.has(d)) map.set(d, []);
      map.get(d)!.push(r);
    });
    return Array.from(map.entries()).map(([date, items]) => ({ date, items }));
  }

  delete(id: number): void {
    // Suppression locale uniquement (pas d'endpoint DELETE côté backend)
    this.history = this.history.filter(r => r.id !== id);
    this.grouped = this.groupByDate(this.history);
  }

  relancer(r: Recherche): void {
    const params: Record<string, string> = { q: r.medicament_nom };
    if (r.latitude) params['lat'] = r.latitude.toString();
    if (r.longitude) params['lon'] = r.longitude.toString();
    window.location.href = '/recherche?' + new URLSearchParams(params).toString();
  }

  logout(): void { this.auth.logout(); }
}
