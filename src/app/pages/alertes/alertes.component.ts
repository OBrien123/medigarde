import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';
import { Alerte } from '../../core/models';

type Tab = 'active' | 'notified' | 'paused';

@Component({
  selector: 'app-alertes',
  standalone: true,
  imports: [RouterLink, FormsModule, DatePipe],
  templateUrl: './alertes.component.html',
  styleUrl: './alertes.component.scss',
})
export class AlertesComponent implements OnInit {
  private notifService = inject(NotificationService);
  private auth = inject(AuthService);

  alertes: Alerte[] = [];
  loading = true;
  activeTab: Tab = 'active';

  get user() { return this.auth.user; }

  get filtered(): Alerte[] {
    switch (this.activeTab) {
      case 'active':   return this.alertes.filter(a => a.active && !a.date_notification);
      case 'notified': return this.alertes.filter(a => !!a.date_notification);
      case 'paused':   return this.alertes.filter(a => !a.active && !a.date_notification);
    }
  }

  ngOnInit(): void {
    this.notifService.alertes().subscribe({
      next: r => { this.alertes = r.results; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  toggle(a: Alerte): void {
    this.notifService.toggleAlerte(a.id, !a.active).subscribe(updated => {
      const idx = this.alertes.findIndex(x => x.id === updated.id);
      if (idx >= 0) this.alertes[idx] = updated;
    });
  }

  delete(id: number): void {
    this.notifService.deleteAlerte(id).subscribe(() => {
      this.alertes = this.alertes.filter(a => a.id !== id);
    });
  }

  countTab(tab: Tab): number {
    switch (tab) {
      case 'active':   return this.alertes.filter(a => a.active && !a.date_notification).length;
      case 'notified': return this.alertes.filter(a => !!a.date_notification).length;
      case 'paused':   return this.alertes.filter(a => !a.active && !a.date_notification).length;
    }
  }

  rayonLabel(r: number): string {
    return r < 1000 ? `${r} m` : `${r / 1000} km`;
  }

  logout(): void { this.auth.logout(); }
}
