import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div class="w-full max-w-md">
        <!-- Logo -->
        <div class="text-center mb-8">
          <div class="w-16 h-16 rounded-2xl bg-[#006EC7] flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4"
               style="font-family: 'Fira Sans Condensed', sans-serif">HP</div>
          <h1 class="text-2xl font-bold text-gray-900" style="font-family: 'Fira Sans Condensed', sans-serif">
            Health Portal
          </h1>
          <p class="text-gray-500 mt-1">Melden Sie sich mit Ihrer E-Mail-Adresse an</p>
        </div>

        <!-- Login Card -->
        <div class="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <!-- Step 1: Email -->
          <div *ngIf="step() === 'email'">
            <label class="block text-sm font-medium text-gray-700 mb-2">E-Mail-Adresse</label>
            <input type="email"
                   [(ngModel)]="email"
                   (keydown.enter)="requestOtp()"
                   placeholder="ihre.email&#64;beispiel.de"
                   class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006EC7] focus:border-transparent outline-none text-gray-900"
                   [disabled]="loading()"
                   autofocus />

            <button (click)="requestOtp()"
                    [disabled]="loading() || !email"
                    class="w-full mt-4 px-4 py-3 bg-[#006EC7] text-white font-medium rounded-lg hover:bg-[#005ba3] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              <span *ngIf="!loading()">Anmeldecode anfordern</span>
              <span *ngIf="loading()" class="flex items-center justify-center gap-2">
                <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Wird gesendet...
              </span>
            </button>
          </div>

          <!-- Step 2: OTP Code -->
          <div *ngIf="step() === 'otp'">
            <div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
              Ein 6-stelliger Code wurde an <strong>{{ email }}</strong> gesendet.
            </div>

            <label class="block text-sm font-medium text-gray-700 mb-2">Einmal-Code</label>
            <input type="text"
                   [(ngModel)]="otpCode"
                   (keydown.enter)="verifyOtp()"
                   placeholder="123456"
                   maxlength="6"
                   class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006EC7] focus:border-transparent outline-none text-gray-900 text-center text-2xl tracking-[0.5em] font-mono"
                   [disabled]="loading()"
                   autofocus />

            <button (click)="verifyOtp()"
                    [disabled]="loading() || otpCode.length < 6"
                    class="w-full mt-4 px-4 py-3 bg-[#006EC7] text-white font-medium rounded-lg hover:bg-[#005ba3] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              <span *ngIf="!loading()">Anmelden</span>
              <span *ngIf="loading()" class="flex items-center justify-center gap-2">
                <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Wird geprueft...
              </span>
            </button>

            <button (click)="backToEmail()"
                    class="w-full mt-2 px-4 py-2 text-gray-500 text-sm hover:text-gray-700 transition-colors">
              Andere E-Mail-Adresse verwenden
            </button>
          </div>

          <!-- Error -->
          <div *ngIf="error()" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
            {{ error() }}
          </div>

          <!-- Success -->
          <div *ngIf="success()" class="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
            {{ success() }}
          </div>
        </div>

        <!-- Security hint -->
        <div class="mt-6 text-center text-xs text-gray-400">
          <svg class="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          Sichere Anmeldung ohne Passwort. Der Code ist 10 Minuten gueltig.
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  email = '';
  otpCode = '';

  readonly step = signal<'email' | 'otp'>('email');
  readonly loading = signal(false);
  readonly error = signal('');
  readonly success = signal('');

  constructor(private authService: AuthService, private router: Router) {}

  requestOtp(): void {
    if (!this.email) return;
    this.loading.set(true);
    this.error.set('');
    this.success.set('');

    this.authService.requestOtp(this.email.trim().toLowerCase()).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.success.set(res.message);
        this.step.set('otp');
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.error || 'Fehler beim Senden des Codes.');
      }
    });
  }

  verifyOtp(): void {
    if (this.otpCode.length < 6) return;
    this.loading.set(true);
    this.error.set('');

    this.authService.verifyOtp(this.email.trim().toLowerCase(), this.otpCode.trim()).subscribe({
      next: (response) => {
        this.loading.set(false);
        this.authService.handleLoginSuccess(response);
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.error || 'Ungueltiger oder abgelaufener Code.');
      }
    });
  }

  backToEmail(): void {
    this.step.set('email');
    this.otpCode = '';
    this.error.set('');
    this.success.set('');
  }
}
