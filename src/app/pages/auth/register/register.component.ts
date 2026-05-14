import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

type UserType = 'client' | 'pharmacie';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  step = 1;
  userType: UserType = 'client';
  loading = false;
  error = '';

  clientForm = this.fb.group({
    first_name: ['', Validators.required],
    last_name:  ['', Validators.required],
    email:      ['', [Validators.required, Validators.email]],
    telephone:  [''],
    password:   ['', [Validators.required, Validators.minLength(8)]],
    password2:  ['', Validators.required],
    adresse:    [''],
    ville:      [''],
  });

  pharmacieForm = this.fb.group({
    nom:       ['', Validators.required],
    adresse:   ['', Validators.required],
    ville:     ['', Validators.required],
    telephone: ['', Validators.required],
    email:     ['', [Validators.required, Validators.email]],
    ninea:     ['', Validators.required],
    licence:   ['', Validators.required],
    password:  ['', [Validators.required, Validators.minLength(8)]],
    password2: ['', Validators.required],
  });

  selectType(type: UserType): void {
    this.userType = type;
    this.step = 2;
  }

  back(): void {
    if (this.step > 1) this.step--;
    this.error = '';
  }

  nextStep(): void { this.step = 3; }

  get form() {
    return this.userType === 'client' ? this.clientForm : this.pharmacieForm;
  }

  pwdStrength(pwd: string | null | undefined): 'weak' | 'medium' | 'strong' {
    if (!pwd || pwd.length < 8) return 'weak';
    const hasLetters = /[a-zA-Z]/.test(pwd);
    const hasNumbers = /[0-9]/.test(pwd);
    const hasSpecial = /[^a-zA-Z0-9]/.test(pwd);
    const score = (hasLetters ? 1 : 0) + (hasNumbers ? 1 : 0) + (hasSpecial ? 1 : 0);
    if (score >= 3) return 'strong';
    if (score >= 2) return 'medium';
    return 'weak';
  }

  pwdStrengthLabel(pwd: string | null | undefined): string {
    const s = this.pwdStrength(pwd);
    return { weak: '⚠️ Faible', medium: '🔶 Moyen', strong: '✅ Fort' }[s];
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const val = this.form.value;
    if (val['password'] !== val['password2']) {
      this.error = 'Les mots de passe ne correspondent pas.'; return;
    }
    this.loading = true; this.error = '';

    const obs = this.userType === 'client'
      ? this.auth.registerClient(val)
      : this.auth.registerPharmacie(val);

    obs.subscribe({
      next: () => {
        if (this.userType === 'client') {
          this.auth.login(val['email'] as string, val['password'] as string).subscribe({
            next: () => this.router.navigate(['/recherche']),
            error: () => this.router.navigate(['/connexion']),
          });
        } else {
          this.step = 4;
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error ? Object.values(err.error).flat().join(' ') : 'Une erreur est survenue.';
      },
    });
  }
}
