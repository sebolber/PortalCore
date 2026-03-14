import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SetupService, SetupMandant } from '../../services/setup.service';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Component({
  selector: 'app-setup-mandant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-5">
      <div>
        <h2 class="text-lg font-semibold text-gray-900">Default-Mandant anlegen</h2>
        <p class="text-sm text-gray-500 mt-1">Legen Sie den ersten Mandanten an. Der Superuser wird diesem automatisch zugeordnet.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Name *</label>
          <input type="text" [(ngModel)]="mandant.name" placeholder="z.B. AOK Nordwest"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006EC7] focus:border-transparent outline-none" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Kuerzel *</label>
          <input type="text" [(ngModel)]="mandant.kuerzel" placeholder="z.B. AOK-NW"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006EC7] focus:border-transparent outline-none" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Strasse</label>
          <input type="text" [(ngModel)]="mandant.strasse"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006EC7] focus:border-transparent outline-none" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Hausnummer</label>
          <input type="text" [(ngModel)]="mandant.hausnummer"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006EC7] focus:border-transparent outline-none" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">PLZ</label>
          <input type="text" [(ngModel)]="mandant.plz"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006EC7] focus:border-transparent outline-none" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Ort</label>
          <input type="text" [(ngModel)]="mandant.ort"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006EC7] focus:border-transparent outline-none" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
          <input type="tel" [(ngModel)]="mandant.telefon"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006EC7] focus:border-transparent outline-none" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">E-Mail</label>
          <input type="email" [(ngModel)]="mandant.email" (blur)="validateEmail()"
            [class]="emailFehler() ? 'w-full px-3 py-2 border border-red-400 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent outline-none' : 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006EC7] focus:border-transparent outline-none'" />
          @if (emailFehler()) {
            <p class="text-xs text-red-600 mt-1">{{ emailFehler() }}</p>
          }
        </div>
      </div>

      @if (error()) {
        <div class="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">{{ error() }}</div>
      }

      <div class="flex justify-between pt-4">
        <button (click)="zurueck.emit()"
          class="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          Zurueck
        </button>
        <button (click)="speichern()" [disabled]="saving()"
          class="px-6 py-2 text-sm font-medium text-white bg-[#006EC7] rounded-lg hover:bg-[#005ba3] disabled:opacity-50 transition-colors">
          @if (saving()) {
            Speichere...
          } @else {
            Mandant anlegen & Weiter
          }
        </button>
      </div>
    </div>
  `
})
export class SetupMandantComponent implements OnInit {
  @Input() initialData: SetupMandant | null = null;
  @Output() completed = new EventEmitter<SetupMandant>();
  @Output() zurueck = new EventEmitter<void>();

  readonly error = signal('');
  readonly emailFehler = signal('');
  readonly saving = signal(false);

  mandant: SetupMandant = {
    name: '',
    kuerzel: '',
    strasse: '',
    hausnummer: '',
    plz: '',
    ort: '',
    telefon: '',
    email: ''
  };

  constructor(private setupService: SetupService) {}

  ngOnInit(): void {
    if (this.initialData) {
      this.mandant = { ...this.initialData };
    }
  }

  validateEmail(): void {
    const email = this.mandant.email?.trim();
    if (email && !EMAIL_PATTERN.test(email)) {
      this.emailFehler.set('Bitte geben Sie eine gueltige E-Mail-Adresse ein (z.B. info@beispiel.de).');
    } else {
      this.emailFehler.set('');
    }
  }

  speichern(): void {
    if (!this.mandant.name?.trim()) {
      this.error.set('Mandantenname ist erforderlich.');
      return;
    }
    if (!this.mandant.kuerzel?.trim()) {
      this.error.set('Kuerzel ist erforderlich.');
      return;
    }
    const email = this.mandant.email?.trim();
    if (email && !EMAIL_PATTERN.test(email)) {
      this.emailFehler.set('Bitte geben Sie eine gueltige E-Mail-Adresse ein (z.B. info@beispiel.de).');
      this.error.set('E-Mail-Adresse ist ungueltig.');
      return;
    }
    this.emailFehler.set('');

    this.saving.set(true);
    this.error.set('');

    this.setupService.erstelleMandant(this.mandant).subscribe({
      next: () => {
        this.saving.set(false);
        this.completed.emit({ ...this.mandant });
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(err.error?.message || err.error?.error || 'Mandant konnte nicht angelegt werden.');
      }
    });
  }
}
