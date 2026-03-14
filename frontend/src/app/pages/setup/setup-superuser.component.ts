import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SetupService, SetupSuperuser } from '../../services/setup.service';

@Component({
  selector: 'app-setup-superuser',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-5">
      <div>
        <h2 class="text-lg font-semibold text-gray-900">Superuser anlegen</h2>
        <p class="text-sm text-gray-500 mt-1">Erstellen Sie den ersten Administrator mit vollen Rechten.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Vorname *</label>
          <input type="text" [(ngModel)]="superuser.vorname" placeholder="Max"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006EC7] focus:border-transparent outline-none" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nachname *</label>
          <input type="text" [(ngModel)]="superuser.nachname" placeholder="Mustermann"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006EC7] focus:border-transparent outline-none" />
        </div>
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">E-Mail-Adresse * (dient als Login)</label>
          <input type="email" [(ngModel)]="superuser.email" placeholder="admin&#64;beispiel.de"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006EC7] focus:border-transparent outline-none" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Passwort * (min. 8 Zeichen)</label>
          <input type="password" [(ngModel)]="superuser.passwort" placeholder="********"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006EC7] focus:border-transparent outline-none" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Passwort bestaetigen *</label>
          <input type="password" [(ngModel)]="superuser.passwortBestaetigung" placeholder="********"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006EC7] focus:border-transparent outline-none" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Sprache</label>
          <select [(ngModel)]="superuser.sprache"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006EC7] focus:border-transparent outline-none">
            @for (s of sprachen; track s.code) {
              <option [value]="s.code">{{ s.label }}</option>
            }
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Zeitzone</label>
          <select [(ngModel)]="superuser.zeitzone"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006EC7] focus:border-transparent outline-none">
            @for (tz of zeitzonen; track tz) {
              <option [value]="tz">{{ tz }}</option>
            }
          </select>
        </div>
      </div>

      @if (error()) {
        <div class="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">{{ error() }}</div>
      }

      <div class="flex justify-end pt-4">
        <button (click)="speichern()" [disabled]="saving()"
          class="px-6 py-2 text-sm font-medium text-white bg-[#006EC7] rounded-lg hover:bg-[#005ba3] disabled:opacity-50 transition-colors">
          @if (saving()) {
            Erstelle Superuser...
          } @else {
            Superuser anlegen & Setup abschliessen
          }
        </button>
      </div>
    </div>
  `
})
export class SetupSuperuserComponent {
  @Output() completed = new EventEmitter<void>();

  readonly error = signal('');
  readonly saving = signal(false);

  superuser: SetupSuperuser = {
    vorname: '',
    nachname: '',
    email: '',
    passwort: '',
    passwortBestaetigung: '',
    sprache: 'de',
    zeitzone: 'Europe/Berlin'
  };

  readonly sprachen = [
    { code: 'de', label: 'Deutsch' },
    { code: 'en', label: 'English' },
    { code: 'fr', label: 'Francais' },
    { code: 'it', label: 'Italiano' },
    { code: 'es', label: 'Espanol' },
  ];

  readonly zeitzonen = [
    'Europe/Berlin', 'Europe/Vienna', 'Europe/Zurich', 'Europe/London',
    'Europe/Paris', 'Europe/Rome', 'Europe/Madrid', 'Europe/Amsterdam',
    'America/New_York', 'America/Chicago', 'America/Los_Angeles',
  ];

  constructor(private setupService: SetupService) {}

  speichern(): void {
    if (!this.validateForm()) return;
    this.saving.set(true);
    this.error.set('');

    this.setupService.erstelleSuperuser(this.superuser).subscribe({
      next: () => {
        this.saving.set(false);
        this.completed.emit();
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(err.error?.message || err.error?.error || 'Superuser konnte nicht angelegt werden.');
      }
    });
  }

  private validateForm(): boolean {
    if (!this.superuser.vorname?.trim()) {
      this.error.set('Vorname ist erforderlich.');
      return false;
    }
    if (!this.superuser.nachname?.trim()) {
      this.error.set('Nachname ist erforderlich.');
      return false;
    }
    if (!this.superuser.email?.trim()) {
      this.error.set('E-Mail ist erforderlich.');
      return false;
    }
    if (!this.superuser.passwort || this.superuser.passwort.length < 8) {
      this.error.set('Passwort muss mindestens 8 Zeichen lang sein.');
      return false;
    }
    if (this.superuser.passwort !== this.superuser.passwortBestaetigung) {
      this.error.set('Passwort und Bestaetigung stimmen nicht ueberein.');
      return false;
    }
    return true;
  }
}
