import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Welcome Banner -->
    <div class="card bg-gradient-to-r from-[#006EC7] to-[#004A87] text-white !border-0 mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold mb-1">Willkommen zurueck, Sabine!</h1>
          <p class="text-blue-100 text-sm">{{ today }} &mdash; adesso health Portal</p>
        </div>
        <div class="hidden sm:flex items-center gap-2 bg-white/10 rounded-lg px-4 py-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span class="text-sm">AOK Nordwest</span>
        </div>
      </div>
    </div>

    <!-- Stat Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div *ngFor="let stat of stats" class="card flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
             [ngClass]="stat.bgClass">
          <svg class="w-6 h-6" [ngClass]="stat.colorClass" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" [attr.d]="stat.icon"/>
          </svg>
        </div>
        <div>
          <p class="text-2xl font-bold text-gray-800">{{ stat.value }}</p>
          <p class="text-sm text-gray-500">{{ stat.label }}</p>
        </div>
      </div>
    </div>

    <!-- Zuletzt genutzte Apps -->
    <h2 class="text-lg font-semibold text-gray-800 mb-4">Zuletzt genutzte Apps</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <a *ngFor="let app of recentApps"
         [routerLink]="'/appstore/' + app.id"
         class="card hover:shadow-md transition-shadow cursor-pointer">
        <div class="flex items-start gap-3 mb-3">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0"
               [style.background-color]="app.iconColor">
            {{ app.iconInitials }}
          </div>
          <div class="min-w-0">
            <p class="text-sm font-semibold text-gray-800 truncate">{{ app.name }}</p>
            <div class="flex items-center gap-0.5 mt-0.5">
              <span *ngFor="let star of [1,2,3,4,5]" class="text-xs"
                    [class.text-yellow-400]="star <= app.rating"
                    [class.text-gray-300]="star > app.rating">&#9733;</span>
              <span class="text-xs text-gray-400 ml-1">{{ app.rating }}</span>
            </div>
          </div>
        </div>
        <p class="text-xs text-gray-500 line-clamp-2">{{ app.shortDescription }}</p>
      </a>
    </div>

    <!-- smile KH - Fallstatus -->
    <h2 class="text-lg font-semibold text-gray-800 mb-4">smile KH - Fallstatus</h2>

    <!-- Ampel Summary -->
    <div class="flex gap-3 mb-4">
      <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-green-50 text-green-700">
        <span class="w-2.5 h-2.5 rounded-full bg-green-500"></span>
        Gruen: {{ ampelCounts.gruen }}
      </span>
      <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-yellow-50 text-yellow-700">
        <span class="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
        Gelb: {{ ampelCounts.gelb }}
      </span>
      <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-red-50 text-red-700">
        <span class="w-2.5 h-2.5 rounded-full bg-red-500"></span>
        Rot: {{ ampelCounts.rot }}
      </span>
    </div>

    <!-- Fallstatus Table -->
    <div class="card !p-0 overflow-hidden mb-8">
      <table class="w-full text-sm">
        <thead class="bg-gray-100/50 border-b">
          <tr>
            <th class="px-4 py-3 text-left font-semibold text-gray-600">Fall-Nr.</th>
            <th class="px-4 py-3 text-left font-semibold text-gray-600">Patient</th>
            <th class="px-4 py-3 text-left font-semibold text-gray-600">Krankenhaus</th>
            <th class="px-4 py-3 text-left font-semibold text-gray-600">DRG-Code</th>
            <th class="px-4 py-3 text-right font-semibold text-gray-600">Betrag</th>
            <th class="px-4 py-3 text-center font-semibold text-gray-600">Ampel</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let fall of faelle; let odd = odd"
              [class.bg-gray-50/50]="odd"
              class="border-b border-gray-100 last:border-0 hover:bg-blue-50/30 transition-colors">
            <td class="px-4 py-3 font-mono text-xs font-medium text-gray-800">{{ fall.fallNr }}</td>
            <td class="px-4 py-3 text-gray-600">{{ fall.patient }}</td>
            <td class="px-4 py-3 text-gray-500">{{ fall.krankenhaus }}</td>
            <td class="px-4 py-3 font-mono">{{ fall.drgCode }}</td>
            <td class="px-4 py-3 text-right font-medium text-gray-800">{{ fall.betrag | number:'1.2-2' }} &euro;</td>
            <td class="px-4 py-3 text-center">
              <span class="w-3 h-3 rounded-full inline-block"
                [class.bg-green-500]="fall.ampel === 'gruen'"
                [class.bg-yellow-400]="fall.ampel === 'gelb'"
                [class.bg-red-500]="fall.ampel === 'rot'"></span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- smile KH - Offene Rechnungen -->
    <h2 class="text-lg font-semibold text-gray-800 mb-4">smile KH - Offene Rechnungen</h2>
    <div class="card !p-0 overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-100/50 border-b">
          <tr>
            <th class="px-4 py-3 text-left font-semibold text-gray-600">Rechnungs-Nr.</th>
            <th class="px-4 py-3 text-left font-semibold text-gray-600">Krankenhaus</th>
            <th class="px-4 py-3 text-right font-semibold text-gray-600">Betrag</th>
            <th class="px-4 py-3 text-left font-semibold text-gray-600">Status</th>
            <th class="px-4 py-3 text-right font-semibold text-gray-600">Tage offen</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let r of rechnungen; let odd = odd"
              [class.bg-gray-50/50]="odd"
              class="border-b border-gray-100 last:border-0 hover:bg-blue-50/30 transition-colors">
            <td class="px-4 py-3 font-mono text-xs font-medium text-gray-800">{{ r.rechnungsNr }}</td>
            <td class="px-4 py-3 text-gray-600">{{ r.krankenhaus }}</td>
            <td class="px-4 py-3 text-right font-medium text-gray-800">{{ r.betrag | number:'1.2-2' }} &euro;</td>
            <td class="px-4 py-3">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    [ngClass]="{
                      'bg-gray-100 text-gray-700': r.status === 'offen',
                      'bg-blue-50 text-blue-700': r.status === 'in_pruefung',
                      'bg-red-50 text-red-700': r.status === 'gemahnt',
                      'bg-yellow-50 text-yellow-700': r.status === 'teilbezahlt'
                    }">{{ r.statusLabel }}</span>
            </td>
            <td class="px-4 py-3 text-right"
                [ngClass]="r.tageOffen > 30 ? 'text-red-600 font-medium' : 'text-gray-600'">
              {{ r.tageOffen }} Tage
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
})
export class DashboardComponent {
  today = new Date().toLocaleDateString('de-DE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  stats = [
    {
      label: 'Installierte Apps',
      value: '6',
      icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
      colorClass: 'text-blue-600',
      bgClass: 'bg-blue-50',
    },
    {
      label: 'Nachrichten',
      value: '3',
      icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
      colorClass: 'text-pink-600',
      bgClass: 'bg-pink-50',
    },
    {
      label: 'Offene Aufgaben',
      value: '7',
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
      colorClass: 'text-orange-600',
      bgClass: 'bg-orange-50',
    },
    {
      label: 'Batch-Jobs',
      value: '3 laufend',
      icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      colorClass: 'text-green-600',
      bgClass: 'bg-green-50',
    },
  ];

  recentApps = [
    {
      id: 'kv-ai-abrechnung',
      name: 'KV AI Abrechnung',
      iconColor: '#006EC7',
      iconInitials: 'KV',
      rating: 5,
      shortDescription: 'KI-gestuetzte Abrechnungspruefung fuer KV-Leistungen mit automatischer Anomalie-Erkennung.',
    },
    {
      id: 'smile-kh',
      name: 'smile KH',
      iconColor: '#28DCAA',
      iconInitials: 'SK',
      rating: 4,
      shortDescription: 'Krankenhaus-Fallmanagement mit Ampelsystem und Rechnungsverfolgung fuer Kostentraeger.',
    },
    {
      id: 'arztregister',
      name: 'Arztregister',
      iconColor: '#76C800',
      iconInitials: 'AR',
      rating: 4,
      shortDescription: 'Zentrale Verwaltung aller zugelassenen Aerzte, Therapeuten und Leistungsorte.',
    },
    {
      id: 'wb-foerderung',
      name: 'WB-Foerderung',
      iconColor: '#FF9868',
      iconInitials: 'WB',
      rating: 4,
      shortDescription: 'Verwaltung und Tracking von Weiterbildungsfoerderungen im Gesundheitswesen.',
    },
  ];

  ampelCounts = { gruen: 4, gelb: 3, rot: 3 };

  faelle = [
    { fallNr: 'F-2026-0847', patient: 'Heinrich Meier', krankenhaus: 'Uniklinikum Muenster', drgCode: 'I68B', betrag: 12450, ampel: 'gruen' },
    { fallNr: 'F-2026-0848', patient: 'Ursula Becker', krankenhaus: 'Ev. Klinikum Bethel', drgCode: 'G67C', betrag: 8920, ampel: 'gelb' },
    { fallNr: 'F-2026-0849', patient: 'Klaus Wagner', krankenhaus: 'Klinikum Dortmund', drgCode: 'F25Z', betrag: 23180, ampel: 'rot' },
    { fallNr: 'F-2026-0850', patient: 'Maria Fischer', krankenhaus: 'St. Franziskus-Hospital', drgCode: 'B80Z', betrag: 4560, ampel: 'gruen' },
    { fallNr: 'F-2026-0851', patient: 'Hans Schulz', krankenhaus: 'Marienhospital Osnabrueck', drgCode: 'I24Z', betrag: 15780, ampel: 'rot' },
    { fallNr: 'F-2026-0852', patient: 'Petra Hoffmann', krankenhaus: 'Herz-/Diabeteszentrum NRW', drgCode: 'F12A', betrag: 31200, ampel: 'gelb' },
    { fallNr: 'F-2026-0853', patient: 'Sabine Braun', krankenhaus: 'Klinikum Dortmund', drgCode: 'K62Z', betrag: 15200, ampel: 'gruen' },
    { fallNr: 'F-2026-0854', patient: 'Thomas Klein', krankenhaus: 'Uniklinikum Muenster', drgCode: 'F17B', betrag: 31450, ampel: 'rot' },
    { fallNr: 'F-2026-0855', patient: 'Lisa Wagner', krankenhaus: 'St. Marien Hospital', drgCode: 'G36Z', betrag: 7890, ampel: 'gruen' },
    { fallNr: 'F-2026-0856', patient: 'Frank Schulz', krankenhaus: 'St. Franziskus-Hospital', drgCode: 'I09Z', betrag: 18340, ampel: 'gelb' },
  ];

  rechnungen = [
    { rechnungsNr: 'R-2026-1234', krankenhaus: 'Uniklinikum Muenster', betrag: 12450, status: 'offen', statusLabel: 'Offen', tageOffen: 25 },
    { rechnungsNr: 'R-2026-1180', krankenhaus: 'Klinikum Dortmund', betrag: 23180, status: 'in_pruefung', statusLabel: 'In Pruefung', tageOffen: 39 },
    { rechnungsNr: 'R-2026-1120', krankenhaus: 'Ev. Klinikum Bethel', betrag: 8920, status: 'teilbezahlt', statusLabel: 'Teilbezahlt', tageOffen: 51 },
    { rechnungsNr: 'R-2026-1089', krankenhaus: 'Herz-/Diabeteszentrum NRW', betrag: 31200, status: 'gemahnt', statusLabel: 'Gemahnt', tageOffen: 61 },
    { rechnungsNr: 'R-2026-1250', krankenhaus: 'St. Franziskus-Hospital', betrag: 4560, status: 'offen', statusLabel: 'Offen', tageOffen: 20 },
  ];
}
