import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  form = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  loading = false;
  error = '';
  showPassword = false;

  submit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';
    const { email, password } = this.form.value;
    this.auth.login(email!, password!).subscribe({
      next: () => {
        this.auth.fetchMe().subscribe(user => {
          if (user.role === 'pharmacie') this.router.navigate(['/pharmacie/dashboard']);
          else if (user.role === 'admin') this.router.navigate(['/admin/dashboard']);
          else this.router.navigate(['/recherche']);
        });
      },
      error: () => {
        this.loading = false;
        this.error = 'Email ou mot de passe incorrect.';
      },
    });
  }
}
