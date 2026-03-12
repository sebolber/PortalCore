import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BatchJob, BatchStatus, BatchProtokollEintrag } from '../../models/batch-job.model';

@Component({
  selector: 'app-batch-jobs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6" style="font-family: 'Fira Sans', sans-serif">

      <!-- Page Header -->
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Batch-Jobs</h1>
        <p class="text-sm text-gray-500 mt-1">Verwaltung und Ueberwachung aller Batch-Prozesse</p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div class="bg-white border border-gray-200 rounded-xl p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">Erfolgreich</p>
              <p class="text-2xl font-bold text-green-600 mt-1">{{ stats().erfolgreich }}</p>
            </div>
            <div class="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
          </div>
        </div>
        <div class="bg-white border border-gray-200 rounded-xl p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">Laufend</p>
              <p class="text-2xl font-bold text-blue-600 mt-1">{{ stats().laeuft }}</p>
            </div>
            <div class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <svg class="w-5 h-5 text-blue-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
            </div>
          </div>
        </div>
        <div class="bg-white border border-gray-200 rounded-xl p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">Pausiert</p>
              <p class="text-2xl font-bold text-yellow-600 mt-1">{{ stats().pausiert }}</p>
            </div>
            <div class="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center">
              <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <rect x="6" y="4" width="4" height="16" rx="1" stroke-linecap="round" stroke-linejoin="round"/>
                <rect x="14" y="4" width="4" height="16" rx="1" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
        <div class="bg-white border border-gray-200 rounded-xl p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">Fehlgeschlagen</p>
              <p class="text-2xl font-bold text-red-600 mt-1">{{ stats().fehlgeschlagen }}</p>
            </div>
            <div class="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
              <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </div>
          </div>
        </div>
        <div class="bg-white border border-gray-200 rounded-xl p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">Warteschlange</p>
              <p class="text-2xl font-bold text-gray-600 mt-1">{{ stats().wartend }}</p>
            </div>
            <div class="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Warteschlange Section -->
      <div *ngIf="queuedJobs().length > 0">
        <h2 class="text-lg font-semibold text-gray-900 mb-3">Warteschlange</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div *ngFor="let job of queuedJobs()"
               class="bg-white border border-gray-200 rounded-xl p-4 relative group">
            <button (click)="removeFromQueue(job.id)"
                    class="absolute top-3 right-3 w-6 h-6 rounded-full bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
            <span class="inline-block px-2 py-0.5 text-xs font-medium rounded-full mb-2"
                  [ngClass]="getProduktBadgeClass(job.produktId)">
              {{ job.produktId }}
            </span>
            <p class="text-sm font-semibold text-gray-900">{{ job.name }}</p>
            <p class="text-xs text-gray-500 mt-1">Geplant: {{ job.naechsterLauf }}</p>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white border border-gray-200 rounded-xl p-4">
        <div class="flex flex-col sm:flex-row gap-3">
          <div class="relative flex-1">
            <svg class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <circle cx="11" cy="11" r="8"/><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35"/>
            </svg>
            <input type="text" placeholder="Job suchen..."
                   [(ngModel)]="searchQuery"
                   class="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#006EC7] focus:border-transparent"/>
          </div>
          <select [(ngModel)]="filterProdukt"
                  class="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#006EC7]">
            <option value="">Alle Produkte</option>
            <option value="SMILE">SMILE</option>
            <option value="oscare">oscare</option>
            <option value="Portal">Portal</option>
          </select>
          <select [(ngModel)]="filterStatus"
                  class="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#006EC7]">
            <option value="">Alle Status</option>
            <option value="laeuft">Laufend</option>
            <option value="erfolgreich">Erfolgreich</option>
            <option value="fehlgeschlagen">Fehlgeschlagen</option>
            <option value="pausiert">Pausiert</option>
            <option value="gestoppt">Gestoppt</option>
            <option value="wartend">Wartend</option>
          </select>
        </div>
      </div>

      <!-- Jobs Table -->
      <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-200">
                <th class="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Status</th>
                <th class="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Name</th>
                <th class="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Produkt</th>
                <th class="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Gestartet</th>
                <th class="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Dauer</th>
                <th class="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Naechster Lauf</th>
                <th class="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Status</th>
                <th class="text-right px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Aktionen</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr *ngFor="let job of filteredJobs()" class="hover:bg-gray-50 transition-colors">
                <!-- Status Icon -->
                <td class="px-4 py-3">
                  <!-- Spinning for laeuft -->
                  <svg *ngIf="job.status === 'laeuft'" class="w-5 h-5 text-blue-500 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                  </svg>
                  <svg *ngIf="job.status === 'erfolgreich'" class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                  </svg>
                  <svg *ngIf="job.status === 'fehlgeschlagen'" class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <svg *ngIf="job.status === 'pausiert'" class="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                    <rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>
                  </svg>
                  <svg *ngIf="job.status === 'gestoppt'" class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                    <rect x="6" y="6" width="12" height="12" rx="1" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <svg *ngIf="job.status === 'wartend' || job.status === 'geplant'" class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </td>

                <!-- Name + description + progress -->
                <td class="px-4 py-3">
                  <p class="font-medium text-gray-900">{{ job.name }}</p>
                  <p class="text-xs text-gray-500 mt-0.5">{{ job.beschreibung }}</p>
                  <div *ngIf="(job.status === 'laeuft' || job.status === 'pausiert') && job.fortschritt !== undefined"
                       class="mt-2 w-48">
                    <div class="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>Fortschritt</span>
                      <span>{{ job.fortschritt }}%</span>
                    </div>
                    <div class="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div class="h-full rounded-full transition-all duration-500"
                           [ngClass]="job.status === 'pausiert' ? 'bg-yellow-400' : 'bg-blue-500'"
                           [style.width.%]="job.fortschritt"></div>
                    </div>
                  </div>
                </td>

                <!-- Produkt Badge -->
                <td class="px-4 py-3">
                  <span class="inline-block px-2 py-0.5 text-xs font-medium rounded-full"
                        [ngClass]="getProduktBadgeClass(job.produktId)">
                    {{ job.produktId }}
                  </span>
                </td>

                <!-- Gestartet -->
                <td class="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">
                  {{ job.gestartetUm || '—' }}
                </td>

                <!-- Dauer -->
                <td class="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">
                  {{ job.dauer || '—' }}
                </td>

                <!-- Naechster Lauf -->
                <td class="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">
                  {{ job.naechsterLauf }}
                </td>

                <!-- Status Badge -->
                <td class="px-4 py-3">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        [ngClass]="getStatusBadgeClass(job.status)">
                    {{ getStatusLabel(job.status) }}
                  </span>
                </td>

                <!-- Actions -->
                <td class="px-4 py-3 text-right">
                  <div class="flex items-center justify-end gap-1">
                    <!-- Protokoll (always) -->
                    <button (click)="openProtokoll(job)"
                            class="px-2 py-1 text-xs font-medium text-gray-600 hover:text-[#006EC7] hover:bg-blue-50 rounded transition-colors"
                            title="Protokoll">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                      </svg>
                    </button>
                    <!-- Start/Restart for gestoppt, fehlgeschlagen, erfolgreich -->
                    <button *ngIf="job.status === 'gestoppt' || job.status === 'fehlgeschlagen' || job.status === 'erfolgreich'"
                            (click)="startJob(job)"
                            class="px-2 py-1 text-xs font-medium text-green-600 hover:bg-green-50 rounded transition-colors"
                            title="Starten">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                        <polygon points="5 3 19 12 5 21 5 3" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </button>
                    <!-- Resume for pausiert -->
                    <button *ngIf="job.status === 'pausiert'"
                            (click)="resumeJob(job)"
                            class="px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Fortsetzen">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                        <polygon points="5 3 19 12 5 21 5 3" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </button>
                    <!-- Pause for laeuft -->
                    <button *ngIf="job.status === 'laeuft'"
                            (click)="pauseJob(job)"
                            class="px-2 py-1 text-xs font-medium text-yellow-600 hover:bg-yellow-50 rounded transition-colors"
                            title="Pausieren">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                        <rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>
                      </svg>
                    </button>
                    <!-- Stop for laeuft, pausiert -->
                    <button *ngIf="job.status === 'laeuft' || job.status === 'pausiert'"
                            (click)="stopJob(job)"
                            class="px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Stoppen">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                        <rect x="6" y="6" width="12" height="12" rx="1" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Protokoll Modal -->
      <div *ngIf="protokollJob()" class="fixed inset-0 z-50 flex items-center justify-center">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" (click)="closeProtokoll()"></div>
        <!-- Modal Card -->
        <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl mx-4 max-h-[80vh] flex flex-col">
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Protokoll: {{ protokollJob()!.name }}</h3>
              <p class="text-xs text-gray-500 mt-0.5">
                {{ protokollJob()!.gestartetUm || 'Nicht gestartet' }}
                <span *ngIf="protokollJob()!.beendetUm"> — {{ protokollJob()!.beendetUm }}</span>
              </p>
            </div>
            <button (click)="closeProtokoll()"
                    class="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <!-- Log Table -->
          <div class="overflow-auto flex-1 p-4">
            <table class="w-full text-xs font-mono">
              <thead>
                <tr class="text-left text-gray-500 border-b border-gray-100">
                  <th class="pb-2 pr-4">Zeitstempel</th>
                  <th class="pb-2 pr-4">Level</th>
                  <th class="pb-2">Nachricht</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                <tr *ngFor="let entry of protokollJob()!.protokoll" class="hover:bg-gray-50">
                  <td class="py-2 pr-4 text-gray-500 whitespace-nowrap">{{ entry.zeit }}</td>
                  <td class="py-2 pr-4">
                    <span class="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase"
                          [ngClass]="{
                            'bg-blue-100 text-blue-700': entry.level === 'info',
                            'bg-yellow-100 text-yellow-700': entry.level === 'warn',
                            'bg-red-100 text-red-700': entry.level === 'error'
                          }">
                      {{ entry.level }}
                    </span>
                  </td>
                  <td class="py-2 text-gray-800">{{ entry.nachricht }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <!-- Footer -->
          <div class="px-6 py-3 border-t border-gray-200 flex justify-end">
            <button (click)="closeProtokoll()"
                    class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
              Schliessen
            </button>
          </div>
        </div>
      </div>

    </div>
  `,
})
export class BatchJobsComponent {
  searchQuery = '';
  filterProdukt = '';
  filterStatus = '';

  readonly protokollJob = signal<BatchJob | null>(null);

  readonly jobs = signal<BatchJob[]>([
    {
      id: 'bj-1',
      name: 'Abrechnungslauf Q1',
      beschreibung: 'Quartalsabrechnung fuer alle Mandanten',
      produktId: 'SMILE',
      schedule: '0 2 1 */3 *',
      status: 'erfolgreich',
      gestartetUm: '2026-03-01 02:00',
      beendetUm: '2026-03-01 02:45',
      naechsterLauf: '2026-06-01 02:00',
      dauer: '45 min',
      protokoll: [
        { zeit: '2026-03-01 02:00:00', level: 'info', nachricht: 'Abrechnungslauf gestartet' },
        { zeit: '2026-03-01 02:15:00', level: 'info', nachricht: '1.245 Faelle verarbeitet' },
        { zeit: '2026-03-01 02:45:00', level: 'info', nachricht: 'Abrechnungslauf erfolgreich abgeschlossen' },
      ],
    },
    {
      id: 'bj-2',
      name: 'Datenimport Leistungserbringer',
      beschreibung: 'Taegl. Import der Leistungserbringerdaten',
      produktId: 'oscare',
      schedule: '0 3 * * *',
      status: 'laeuft',
      gestartetUm: '2026-03-12 03:00',
      naechsterLauf: '2026-03-13 03:00',
      dauer: '12 min (bisher)',
      fortschritt: 67,
      protokoll: [
        { zeit: '2026-03-12 03:00:00', level: 'info', nachricht: 'Import gestartet' },
        { zeit: '2026-03-12 03:05:00', level: 'info', nachricht: '4.320 Datensaetze geladen' },
        { zeit: '2026-03-12 03:10:00', level: 'warn', nachricht: '3 Datensaetze mit fehlenden Pflichtfeldern' },
      ],
    },
    {
      id: 'bj-3',
      name: 'Berichterstellung Monat',
      beschreibung: 'Monatliche Berichte generieren',
      produktId: 'SMILE',
      schedule: '0 4 1 * *',
      status: 'pausiert',
      gestartetUm: '2026-03-01 04:00',
      naechsterLauf: '2026-04-01 04:00',
      dauer: '8 min (pausiert)',
      fortschritt: 35,
      protokoll: [
        { zeit: '2026-03-01 04:00:00', level: 'info', nachricht: 'Berichterstellung gestartet' },
        { zeit: '2026-03-01 04:05:00', level: 'warn', nachricht: 'Hohe Serverlast erkannt, pausiert' },
      ],
    },
    {
      id: 'bj-4',
      name: 'E-Mail Benachrichtigungen',
      beschreibung: 'Versand ausstehender E-Mail-Benachrichtigungen',
      produktId: 'Portal',
      schedule: '*/15 * * * *',
      status: 'erfolgreich',
      gestartetUm: '2026-03-12 08:45',
      beendetUm: '2026-03-12 08:46',
      naechsterLauf: '2026-03-12 09:00',
      dauer: '1 min',
      protokoll: [
        { zeit: '2026-03-12 08:45:00', level: 'info', nachricht: '23 E-Mails versendet' },
        { zeit: '2026-03-12 08:46:00', level: 'info', nachricht: 'Abgeschlossen' },
      ],
    },
    {
      id: 'bj-5',
      name: 'DTA-Export Pruefstelle',
      beschreibung: 'Export der Datenaustausch-Dateien',
      produktId: 'SMILE',
      schedule: '0 6 * * 1',
      status: 'fehlgeschlagen',
      gestartetUm: '2026-03-11 06:00',
      beendetUm: '2026-03-11 06:12',
      naechsterLauf: '2026-03-18 06:00',
      dauer: '12 min',
      protokoll: [
        { zeit: '2026-03-11 06:00:00', level: 'info', nachricht: 'DTA-Export gestartet' },
        { zeit: '2026-03-11 06:08:00', level: 'warn', nachricht: 'Verbindungstimeout zum Zielserver' },
        { zeit: '2026-03-11 06:12:00', level: 'error', nachricht: 'Export fehlgeschlagen: Verbindung abgelehnt' },
      ],
    },
    {
      id: 'bj-6',
      name: 'Archivierung Altdaten',
      beschreibung: 'Archivierung von Daten aelter als 5 Jahre',
      produktId: 'oscare',
      schedule: '0 1 1 1 *',
      status: 'erfolgreich',
      gestartetUm: '2026-01-01 01:00',
      beendetUm: '2026-01-01 03:30',
      naechsterLauf: '2027-01-01 01:00',
      dauer: '2h 30min',
      protokoll: [
        { zeit: '2026-01-01 01:00:00', level: 'info', nachricht: 'Archivierung gestartet' },
        { zeit: '2026-01-01 03:30:00', level: 'info', nachricht: '12.450 Datensaetze archiviert' },
      ],
    },
    {
      id: 'bj-7',
      name: 'Mandanten-Sync',
      beschreibung: 'Synchronisation der Mandantenstammdaten',
      produktId: 'Portal',
      schedule: '0 5 * * *',
      status: 'wartend',
      naechsterLauf: '2026-03-13 05:00',
      protokoll: [],
    },
    {
      id: 'bj-8',
      name: 'Statistik-Aggregation',
      beschreibung: 'Aggregation der Nutzungsstatistiken',
      produktId: 'Portal',
      schedule: '0 0 * * *',
      status: 'wartend',
      naechsterLauf: '2026-03-13 00:00',
      protokoll: [],
    },
  ]);

  readonly stats = computed(() => {
    const all = this.jobs();
    return {
      erfolgreich: all.filter(j => j.status === 'erfolgreich').length,
      laeuft: all.filter(j => j.status === 'laeuft').length,
      pausiert: all.filter(j => j.status === 'pausiert').length,
      fehlgeschlagen: all.filter(j => j.status === 'fehlgeschlagen').length,
      wartend: all.filter(j => j.status === 'wartend' || j.status === 'geplant').length,
    };
  });

  readonly queuedJobs = computed(() =>
    this.jobs().filter(j => j.status === 'wartend' || j.status === 'geplant')
  );

  readonly filteredJobs = computed(() => {
    let result = this.jobs().filter(j => j.status !== 'wartend' && j.status !== 'geplant');
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(j => j.name.toLowerCase().includes(q) || j.beschreibung.toLowerCase().includes(q));
    }
    if (this.filterProdukt) {
      result = result.filter(j => j.produktId === this.filterProdukt);
    }
    if (this.filterStatus) {
      result = result.filter(j => j.status === this.filterStatus);
    }
    return result;
  });

  getProduktBadgeClass(produktId: string): string {
    switch (produktId) {
      case 'SMILE': return 'bg-purple-100 text-purple-700';
      case 'oscare': return 'bg-teal-100 text-teal-700';
      case 'Portal': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  getStatusBadgeClass(status: BatchStatus): string {
    switch (status) {
      case 'erfolgreich': return 'bg-green-100 text-green-700';
      case 'laeuft': return 'bg-blue-100 text-blue-700';
      case 'pausiert': return 'bg-yellow-100 text-yellow-700';
      case 'fehlgeschlagen': return 'bg-red-100 text-red-700';
      case 'gestoppt': return 'bg-gray-100 text-gray-600';
      case 'wartend': case 'geplant': return 'bg-gray-100 text-gray-500';
      default: return 'bg-gray-100 text-gray-500';
    }
  }

  getStatusLabel(status: BatchStatus): string {
    switch (status) {
      case 'erfolgreich': return 'Erfolgreich';
      case 'laeuft': return 'Laufend';
      case 'pausiert': return 'Pausiert';
      case 'fehlgeschlagen': return 'Fehlgeschlagen';
      case 'gestoppt': return 'Gestoppt';
      case 'wartend': return 'Wartend';
      case 'geplant': return 'Geplant';
      default: return status;
    }
  }

  openProtokoll(job: BatchJob): void {
    this.protokollJob.set(job);
  }

  closeProtokoll(): void {
    this.protokollJob.set(null);
  }

  removeFromQueue(jobId: string): void {
    this.jobs.update(jobs => jobs.filter(j => j.id !== jobId));
  }

  startJob(job: BatchJob): void {
    this.jobs.update(jobs => jobs.map(j => j.id === job.id ? { ...j, status: 'laeuft' as BatchStatus, fortschritt: 0, gestartetUm: '2026-03-12 09:00' } : j));
  }

  resumeJob(job: BatchJob): void {
    this.jobs.update(jobs => jobs.map(j => j.id === job.id ? { ...j, status: 'laeuft' as BatchStatus } : j));
  }

  pauseJob(job: BatchJob): void {
    this.jobs.update(jobs => jobs.map(j => j.id === job.id ? { ...j, status: 'pausiert' as BatchStatus } : j));
  }

  stopJob(job: BatchJob): void {
    this.jobs.update(jobs => jobs.map(j => j.id === job.id ? { ...j, status: 'gestoppt' as BatchStatus, fortschritt: undefined } : j));
  }
}
