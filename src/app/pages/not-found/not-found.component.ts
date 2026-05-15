import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="nf-layout">
      <div class="nf-code">404</div>
      <h1>Page introuvable</h1>
      <p class="text-muted">Cette page n'existe pas ou a été déplacée.</p>
      <a routerLink="/" class="btn btn--primary">Retour à l'accueil</a>
    </div>
  `,
  styles: [`
    .nf-layout {
      min-height: 100vh; display: flex; flex-direction: column;
      align-items: center; justify-content: center; gap: 16px; text-align: center;
      padding: 24px;
    }
    .nf-code {
      font-size: 96px; font-weight: 800; line-height: 1;
      background: linear-gradient(135deg, #00D4A0, #00B8D4);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    h1 { font-size: 28px; font-weight: 700; }
  `]
})
export class NotFoundComponent {}
