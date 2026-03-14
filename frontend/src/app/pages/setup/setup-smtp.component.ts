import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SetupService, SmtpKonfiguration } from '../../services/setup.service';

@Component({
  selector: 'app-setup-smtp',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-5">
      <div>
        <h2 class="text-lg font-semibold text-gray-900">SMTP-Mailkonfiguration</h2>
        <p class="text-sm text-gray-500 mt-1">Konfigurieren Sie den Mailserver fuer Systembenachrichtigungen.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">SMTP-Host *</label>
          <input type="text" [(ngModel)]="smtp.host" placeholder="smtp.beispiel.de"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006EC7] focus:border-transparent outline-none" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">SMTP-Port *</label>
          <input type="number" [(ngModel)]="smtp.port" placeholder="587"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006EC7] focus:border-transparent outline-none" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Verschluesselung *</label>
          <select [(ngModel)]="smtp.verschluesselung"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006EC7] focus:border-transparent outline-none">
            <option value="TLS">STARTTLS</option>
            <option value="SSL">SSL/TLS</option>
            <option value="NONE">Keine</option>
          </select>
        </div>
        <div>
          <label class="flex items-center gap-2 mt-7 cursor-pointer">
            <input type="checkbox" [(ngModel)]="smtp.authentifizierungAktiv"
              class="w-4 h-4 text-[#006EC7] rounded border-gray-300 focus:ring-[#006EC7]" />
            <span class="text-sm text-gray-700">Authentifizierung aktiv</span>
          </label>
        </div>
      </div>

      @if (smtp.authentifizierungAktiv) {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Benutzername</label>
            <input type="text" [(ngModel)]="smtp.benutzername" placeholder="user&#64;beispiel.de"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006EC7] focus:border-transparent outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Passwort</label>
            <input type="password" [(ngModel)]="smtp.passwort" placeholder="********"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006EC7] focus:border-transparent outline-none" />
          </div>
        </div>
      }

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Absendername *</label>
          <input type="text" [(ngModel)]="smtp.absenderName" placeholder="Health Portal"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006EC7] focus:border-transparent outline-none" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Absender-E-Mail *</label>
          <input type="email" [(ngModel)]="smtp.absenderEmail" placeholder="noreply&#64;beispiel.de"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006EC7] focus:border-transparent outline-none" />
        </div>
      </div>

      @if (error()) {
        <div class="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">{{ error() }}</div>
      }
      @if (testSuccess()) {
        <div class="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">{{ testSuccess() }}</div>
      }

      <div class="flex justify-between pt-4">
        <button (click)="testVerbindung()" [disabled]="testing()"
          class="px-4 py-2 text-sm font-medium text-[#006EC7] border border-[#006EC7] rounded-lg hover:bg-[#006EC7]/10 disabled:opacity-50 transition-colors">
          @if (testing()) {
            Teste Verbindung...
          } @else {
            Verbindung testen
          }
        </button>
        <button (click)="speichern()" [disabled]="saving()"
          class="px-6 py-2 text-sm font-medium text-white bg-[#006EC7] rounded-lg hover:bg-[#005ba3] disabled:opacity-50 transition-colors">
          @if (saving()) {
            Speichere...
          } @else {
            Speichern & Weiter
          }
        </button>
      </div>
    </div>
  `
})
export class SetupSmtpComponent {
  @Output() completed = new EventEmitter<void>();

  readonly error = signal('');
  readonly testSuccess = signal('');
  readonly testing = signal(false);
  readonly saving = signal(false);

  smtp: SmtpKonfiguration = {
    host: 'smtp.ionos.de',
    port: 587,
    benutzername: '',
    passwort: '',
    verschluesselung: 'SSL',
    absenderName: 'Health Portal',
    absenderEmail: '',
    authentifizierungAktiv: true
  };

  constructor(private setupService: SetupService) {}

  testVerbindung(): void {
    if (!this.validateForm()) return;
    this.testing.set(true);
    this.error.set('');
    this.testSuccess.set('');

    this.setupService.testeSmtp(this.smtp).subscribe({
      next: (res) => {
        this.testing.set(false);
        this.testSuccess.set(res.message);
      },
      error: (err) => {
        this.testing.set(false);
        this.error.set(err.error?.message || err.error?.error || 'SMTP-Verbindungstest fehlgeschlagen.');
      }
    });
  }

  speichern(): void {
    if (!this.validateForm()) return;
    this.saving.set(true);
    this.error.set('');

    this.setupService.speichereSmtp(this.smtp).subscribe({
      next: () => {
        this.saving.set(false);
        this.completed.emit();
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(err.error?.message || err.error?.error || 'SMTP-Konfiguration konnte nicht gespeichert werden.');
      }
    });
  }

  private validateForm(): boolean {
    if (!this.smtp.host?.trim()) {
      this.error.set('SMTP-Host ist erforderlich.');
      return false;
    }
    if (!this.smtp.absenderName?.trim()) {
      this.error.set('Absendername ist erforderlich.');
      return false;
    }
    if (!this.smtp.absenderEmail?.trim()) {
      this.error.set('Absender-E-Mail ist erforderlich.');
      return false;
    }
    return true;
  }
}
