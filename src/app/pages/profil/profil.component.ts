import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';

interface ClientProfile {
  first_name: string;
  last_name: string;
  telephone: string;
  adresse: string;
  ville: string;
  code_postal: string;
}

@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './profil.component.html',
  styleUrl: './profil.component.scss',
})
export class ProfilComponent implements OnInit {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  profile: ClientProfile = { first_name: '', last_name: '', telephone: '', adresse: '', ville: '', code_postal: '' };
  loading = true;
  saving = false;
  success = false;
  error = '';

  get user() { return this.auth.user; }

  ngOnInit(): void {
    this.http.get<any>(`${environment.apiUrl}/api/accounts/me/client/`).subscribe({
      next: data => {
        this.profile = {
          first_name: data.user?.first_name ?? '',
          last_name:  data.user?.last_name ?? '',
          telephone:  data.user?.telephone ?? '',
          adresse:    data.adresse ?? '',
          ville:      data.ville ?? '',
          code_postal: data.code_postal ?? '',
        };
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  save(): void {
    this.saving = true; this.error = ''; this.success = false;
    this.http.patch(`${environment.apiUrl}/api/accounts/me/client/`, this.profile).subscribe({
      next: () => {
        this.saving = false; this.success = true;
        setTimeout(() => this.success = false, 3000);
      },
      error: err => {
        this.saving = false;
        this.error = err?.error ? Object.values(err.error).flat().join(' ') : 'Erreur lors de la sauvegarde.';
      }
    });
  }

  logout(): void { this.auth.logout(); }
}
