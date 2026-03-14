import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SetupService, SmtpKonfiguration, SetupMandant } from '../../services/setup.service';
import { SetupSmtpComponent } from './setup-smtp.component';
import { SetupMandantComponent } from './setup-mandant.component';
import { SetupSuperuserComponent } from './setup-superuser.component';

type SetupSchritt = 'smtp' | 'mandant' | 'superuser' | 'fertig';

@Component({
  selector: 'app-setup',
  standalone: true,
  imports: [CommonModule, SetupSmtpComponent, SetupMandantComponent, SetupSuperuserComponent],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div class="w-full max-w-2xl">
        <!-- Logo -->
        <div class="text-center mb-8">
          <div class="w-16 h-16 rounded-2xl bg-[#006EC7] flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4"
               style="font-family: 'Fira Sans Condensed', sans-serif">HP</div>
          <h1 class="text-2xl font-bold text-gray-900" style="font-family: 'Fira Sans Condensed', sans-serif">
            Health Portal — Ersteinrichtung
          </h1>
          <p class="text-gray-500 mt-1">Konfigurieren Sie Ihr System in drei Schritten</p>
        </div>

        <!-- Fortschrittsanzeige -->
        <div class="flex items-center justify-center gap-2 mb-8">
          @for (schritt of schritte; track schritt.key; let i = $index) {
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors"
                [class]="schrittClass(schritt.key)">
                @if (isSchrittAbgeschlossen(schritt.key)) {
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                  </svg>
                } @else {
                  {{ i + 1 }}
                }
              </div>
              <span class="text-sm font-medium hidden sm:inline"
                [class]="aktuellerSchritt() === schritt.key ? 'text-gray-900' : 'text-gray-400'">
                {{ schritt.label }}
              </span>
              @if (i < schritte.length - 1) {
                <div class="w-8 h-px bg-gray-300 mx-1"></div>
              }
            </div>
          }
        </div>

        <!-- Setup Card -->
        <div class="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          @switch (aktuellerSchritt()) {
            @case ('smtp') {
              <app-setup-smtp
                [initialData]="gespeicherteSmtpDaten()"
                (completed)="onSmtpAbgeschlossen($event)">
              </app-setup-smtp>
            }
            @case ('mandant') {
              <app-setup-mandant
                [initialData]="gespeicherteMandantDaten()"
                (completed)="onMandantAbgeschlossen($event)"
                (zurueck)="onZurueckZuSmtp()">
              </app-setup-mandant>
            }
            @case ('superuser') {
              <app-setup-superuser
                (completed)="onSuperuserAbgeschlossen()"
                (zurueck)="onZurueckZuMandant()">
              </app-setup-superuser>
            }
            @case ('fertig') {
              <div class="text-center py-8">
                <div class="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4">
                  <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <h2 class="text-xl font-semibold text-gray-900 mb-2">Ersteinrichtung abgeschlossen</h2>
                <p class="text-gray-500 mb-6">Das System ist einsatzbereit. Sie koennen sich jetzt anmelden.</p>
                <button (click)="zumLogin()"
                  class="px-6 py-3 text-sm font-medium text-white bg-[#006EC7] rounded-lg hover:bg-[#005ba3] transition-colors">
                  Zur Anmeldung
                </button>
              </div>
            }
          }
        </div>
      </div>
    </div>
  `
})
export class SetupComponent implements OnInit {
  readonly aktuellerSchritt = signal<SetupSchritt>('smtp');
  readonly gespeicherteSmtpDaten = signal<SmtpKonfiguration | null>(null);
  readonly gespeicherteMandantDaten = signal<SetupMandant | null>(null);

  readonly schritte = [
    { key: 'smtp' as const, label: 'SMTP' },
    { key: 'mandant' as const, label: 'Mandant' },
    { key: 'superuser' as const, label: 'Superuser' },
  ];

  private abgeschlosseneSchritte = new Set<string>();

  constructor(
    private setupService: SetupService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.setupService.getStatus().subscribe({
      next: (status) => {
        if (status.istInitialisiert) {
          this.router.navigate(['/login']);
          return;
        }
        if (status.superuserAngelegt) {
          this.aktuellerSchritt.set('fertig');
        } else if (status.mandantAngelegt) {
          this.abgeschlosseneSchritte.add('smtp');
          this.abgeschlosseneSchritte.add('mandant');
          this.aktuellerSchritt.set('superuser');
        } else if (status.smtpKonfiguriert) {
          this.abgeschlosseneSchritte.add('smtp');
          this.aktuellerSchritt.set('mandant');
        }
      }
    });
  }

  onSmtpAbgeschlossen(daten: SmtpKonfiguration): void {
    this.gespeicherteSmtpDaten.set(daten);
    this.abgeschlosseneSchritte.add('smtp');
    this.aktuellerSchritt.set('mandant');
  }

  onMandantAbgeschlossen(daten: SetupMandant): void {
    this.gespeicherteMandantDaten.set(daten);
    this.abgeschlosseneSchritte.add('mandant');
    this.aktuellerSchritt.set('superuser');
  }

  onSuperuserAbgeschlossen(): void {
    this.abgeschlosseneSchritte.add('superuser');
    this.aktuellerSchritt.set('fertig');
  }

  onZurueckZuSmtp(): void {
    this.aktuellerSchritt.set('smtp');
  }

  onZurueckZuMandant(): void {
    this.aktuellerSchritt.set('mandant');
  }

  zumLogin(): void {
    this.router.navigate(['/login']);
  }

  isSchrittAbgeschlossen(key: string): boolean {
    return this.abgeschlosseneSchritte.has(key);
  }

  schrittClass(key: string): string {
    if (this.isSchrittAbgeschlossen(key)) {
      return 'bg-green-500 text-white';
    }
    if (this.aktuellerSchritt() === key) {
      return 'bg-[#006EC7] text-white';
    }
    return 'bg-gray-200 text-gray-500';
  }
}
