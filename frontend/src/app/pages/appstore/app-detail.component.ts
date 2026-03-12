import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { PortalApp } from '../../models/app.model';

@Component({
  selector: 'app-app-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Back Button -->
    <a routerLink="/appstore"
       class="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
      </svg>
      Zurueck zum App-Marktplatz
    </a>

    <div *ngIf="app">
      <!-- App Header -->
      <div class="card mb-6">
        <div class="flex flex-col sm:flex-row items-start gap-6">
          <!-- Icon -->
          <div class="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shrink-0"
               [style.background-color]="app.iconColor">
            {{ app.iconInitials }}
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-4 mb-2">
              <div>
                <h1 class="text-2xl font-bold text-gray-800">{{ app.name }}</h1>
                <p class="text-sm text-gray-500">{{ app.vendorName }}</p>
              </div>
              <span class="px-3 py-1 text-sm font-medium rounded-full shrink-0"
                    [ngClass]="app.price === 'kostenlos'
                      ? 'bg-green-50 text-green-700'
                      : 'bg-blue-50 text-blue-700'">
                {{ app.price === 'kostenlos' ? 'Kostenlos' : 'Lizenzpflichtig' }}
              </span>
            </div>

            <div class="flex flex-wrap items-center gap-4 mb-4">
              <!-- Version -->
              <span class="text-sm text-gray-400">Version {{ app.version }}</span>

              <!-- Rating -->
              <div class="flex items-center gap-1">
                <span *ngFor="let star of [1,2,3,4,5]" class="text-sm"
                      [class.text-yellow-400]="star <= app.rating"
                      [class.text-gray-300]="star > app.rating">&#9733;</span>
                <span class="text-sm text-gray-500 ml-1">{{ app.rating }}</span>
                <span class="text-sm text-gray-400">({{ app.reviewCount }} Bewertungen)</span>
              </div>

              <!-- Install Count -->
              <span class="text-sm text-gray-400">{{ app.installCount }} Installationen</span>
            </div>

            <!-- Action Button -->
            <button *ngIf="!isInstalled"
                    (click)="install()"
                    class="px-6 py-2.5 bg-[#006EC7] text-white text-sm font-medium rounded-lg hover:bg-[#005BA3] transition-colors">
              Installieren
            </button>
            <div *ngIf="isInstalled"
                 class="inline-flex items-center gap-2 px-6 py-2.5 bg-green-50 text-green-700 text-sm font-medium rounded-lg">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
              </svg>
              Bereits installiert
            </div>
          </div>
        </div>
      </div>

      <!-- Description -->
      <div class="card mb-6">
        <h2 class="text-lg font-semibold text-gray-800 mb-3">Beschreibung</h2>
        <p class="text-sm text-gray-600 leading-relaxed">{{ app.longDescription }}</p>
      </div>

      <!-- Tags -->
      <div class="card mb-6">
        <h2 class="text-lg font-semibold text-gray-800 mb-3">Tags</h2>
        <div class="flex flex-wrap gap-2">
          <span *ngFor="let tag of app.tags"
                class="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
            {{ tag }}
          </span>
        </div>
      </div>

      <!-- Compatibility -->
      <div class="card mb-6">
        <h2 class="text-lg font-semibold text-gray-800 mb-3">Kompatibilitaet</h2>
        <ul class="space-y-2">
          <li *ngFor="let compat of app.compatibility" class="flex items-center gap-2 text-sm text-gray-600">
            <svg class="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
            </svg>
            {{ compat }}
          </li>
        </ul>
      </div>

      <!-- Changelog -->
      <div class="card">
        <h2 class="text-lg font-semibold text-gray-800 mb-3">Changelog</h2>
        <div class="space-y-4">
          <div *ngFor="let entry of changelog" class="border-l-2 border-gray-200 pl-4">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-sm font-semibold text-gray-800">{{ entry.version }}</span>
              <span class="text-xs text-gray-400">{{ entry.date }}</span>
            </div>
            <ul class="space-y-1">
              <li *ngFor="let change of entry.changes" class="text-sm text-gray-600 flex items-start gap-2">
                <span class="text-gray-300 mt-1 shrink-0">&bull;</span>
                {{ change }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Not Found -->
    <div *ngIf="!app" class="text-center py-16">
      <p class="text-gray-500 text-sm">App nicht gefunden.</p>
      <a routerLink="/appstore" class="text-[#006EC7] text-sm hover:underline mt-2 inline-block">
        Zurueck zum App-Marktplatz
      </a>
    </div>
  `,
})
export class AppDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);

  app: PortalApp | undefined;
  isInstalled = false;
  changelog: { version: string; date: string; changes: string[] }[] = [];

  private readonly installedAppIds = ['kv-ai-abrechnung', 'smile-kh', 'arztregister', 'wb-foerderung', 'dmp-manager', 'smile-kv'];

  private readonly allApps: PortalApp[] = [
    {
      id: 'kv-ai-abrechnung', name: 'KV AI Abrechnung', shortDescription: 'KI-gestuetzte Abrechnungspruefung fuer KV-Leistungen mit automatischer Anomalie-Erkennung.',
      longDescription: 'Vollstaendig KI-gestuetztes System zur automatisierten Pruefung von KV-Abrechnungen. Erkennt Anomalien, Doppeleinreichungen und Kodierungsfehler in Echtzeit. Die Loesung nutzt modernste Machine-Learning-Algorithmen, die auf Basis historischer Abrechnungsdaten trainiert wurden, um Auffaelligkeiten zuverlaessig zu identifizieren. Integrierte Dashboards bieten volle Transparenz ueber den Pruefstatus und die Ergebnisse.',
      category: 'ABRECHNUNG', marketSegment: 'KOSTENTRAEGER', appType: 'anwendung', vendor: 'health_portal', vendorName: 'Health Portal',
      version: '3.2.1', iconColor: '#006EC7', iconInitials: 'KV', rating: 5, reviewCount: 42, installCount: 128,
      tags: ['KI', 'Abrechnung', 'KV', 'Anomalie-Erkennung', 'Machine Learning'], price: 'lizenzpflichtig', compatibility: ['Portal 2.x', 'smile KV 3.x'], featured: true, isNew: false, route: '/apps/kv-ai',
    },
    {
      id: 'smile-kh', name: 'smile KH', shortDescription: 'Krankenhaus-Fallmanagement mit Ampelsystem und Rechnungsverfolgung fuer Kostentraeger.',
      longDescription: 'Umfassendes Fallmanagement-System fuer Krankenhausabrechnungen. Bietet ein dreistufiges Ampelsystem (gruen/gelb/rot) zur schnellen Bewertung eingehender Faelle sowie eine vollstaendige Rechnungsverfolgung inklusive Mahnwesen. Das System unterstuetzt die gesamte Prozesskette von der Falleinreichung bis zur finalen Abrechnung und bietet umfangreiche Berichtsfunktionen.',
      category: 'FALLMANAGEMENT', marketSegment: 'KOSTENTRAEGER', appType: 'anwendung', vendor: 'health_portal', vendorName: 'Health Portal',
      version: '4.1.0', iconColor: '#28DCAA', iconInitials: 'SK', rating: 4, reviewCount: 38, installCount: 95,
      tags: ['Krankenhaus', 'Fallmanagement', 'Ampelsystem', 'Rechnungsverfolgung'], price: 'lizenzpflichtig', compatibility: ['Portal 2.x'], featured: true, isNew: false, route: '/apps/smile-kh',
    },
    {
      id: 'arztregister', name: 'Arztregister', shortDescription: 'Zentrale Verwaltung aller zugelassenen Aerzte, Therapeuten und Leistungsorte.',
      longDescription: 'Verwalten Sie zentral alle zugelassenen Leistungserbringer inklusive Aerzte, Therapeuten und Leistungsorte mit vollstaendiger Historisierung. Die Anwendung bietet eine komfortable Suchfunktion, Exportmoeglichkeiten und die Integration mit externen Registern.',
      category: 'VERWALTUNG', marketSegment: 'STEUERUNG_PRUEFSTELLEN', appType: 'anwendung', vendor: 'health_portal', vendorName: 'Health Portal',
      version: '2.5.0', iconColor: '#76C800', iconInitials: 'AR', rating: 4, reviewCount: 27, installCount: 73,
      tags: ['Arzt', 'Register', 'Verwaltung', 'Leistungserbringer'], price: 'kostenlos', compatibility: ['Portal 2.x'], featured: false, isNew: false, route: '/arztregister',
    },
    {
      id: 'wb-foerderung', name: 'WB-Foerderung', shortDescription: 'Verwaltung und Tracking von Weiterbildungsfoerderungen im Gesundheitswesen.',
      longDescription: 'Komplettloesung fuer die Verwaltung von Weiterbildungsfoerderungen im Gesundheitswesen. Beinhaltet Tracking von Antraegen, Bewilligungsprozesse, automatische Auszahlungssteuerung und umfassende Berichterstattung.',
      category: 'VERWALTUNG', marketSegment: 'STEUERUNG_PRUEFSTELLEN', appType: 'anwendung', vendor: 'health_portal', vendorName: 'Health Portal',
      version: '1.8.2', iconColor: '#FF9868', iconInitials: 'WB', rating: 4, reviewCount: 19, installCount: 45,
      tags: ['Weiterbildung', 'Foerderung', 'Antraege'], price: 'kostenlos', compatibility: ['Portal 2.x'], featured: false, isNew: false, route: '/wb-foerderung',
    },
    {
      id: 'dmp-manager', name: 'DMP Manager', shortDescription: 'Disease-Management-Programme effizient verwalten und dokumentieren.',
      longDescription: 'Umfassende Verwaltung von Disease-Management-Programmen mit Einschreibung, Dokumentation und Qualitaetssicherung. Unterstuetzt alle gaengigen DMP-Programme und bietet nahtlose Integration mit den gesetzlich vorgeschriebenen Meldeverfahren.',
      category: 'VERWALTUNG', marketSegment: 'KOSTENTRAEGER', appType: 'anwendung', vendor: 'health_portal', vendorName: 'Health Portal',
      version: '2.1.0', iconColor: '#006EC7', iconInitials: 'DM', rating: 4, reviewCount: 31, installCount: 88,
      tags: ['DMP', 'Chroniker', 'Qualitaet', 'Einschreibung'], price: 'lizenzpflichtig', compatibility: ['Portal 2.x'], featured: false, isNew: false,
    },
    {
      id: 'smile-kv', name: 'smile KV', shortDescription: 'KV-Abrechnungsmanagement mit intelligenter Fehlererkennung.',
      longDescription: 'Spezialisierte Loesung fuer die Bearbeitung und Pruefung von KV-Abrechnungen mit automatisierter Fehlererkennung und Korrekturvorschlaegen. Integriert sich nahtlos in bestehende Abrechnungsworkflows.',
      category: 'ABRECHNUNG', marketSegment: 'KOSTENTRAEGER', appType: 'anwendung', vendor: 'health_portal', vendorName: 'Health Portal',
      version: '3.0.1', iconColor: '#F566BA', iconInitials: 'SV', rating: 4, reviewCount: 24, installCount: 67,
      tags: ['KV', 'Abrechnung', 'Pruefung', 'Fehlererkennung'], price: 'lizenzpflichtig', compatibility: ['Portal 2.x'], featured: false, isNew: false,
    },
    {
      id: 'ki-kodier-assistent', name: 'KI-Kodier-Assistent', shortDescription: 'KI-basierte Unterstuetzung bei der medizinischen Kodierung (ICD, OPS, DRG).',
      longDescription: 'Intelligenter Assistent zur Unterstuetzung bei der korrekten medizinischen Kodierung. Nutzt KI um passende ICD-, OPS- und DRG-Codes vorzuschlagen und die Kodierqualitaet nachhaltig zu verbessern.',
      category: 'KI_AGENTEN', marketSegment: 'ABRECHNUNGSDIENSTLEISTER', appType: 'anwendung', vendor: 'health_portal', vendorName: 'Health Portal',
      version: '1.2.0', iconColor: '#9333EA', iconInitials: 'KA', rating: 5, reviewCount: 15, installCount: 34,
      tags: ['KI', 'Kodierung', 'ICD', 'OPS', 'DRG'], price: 'lizenzpflichtig', compatibility: ['Portal 2.x', 'smile KH 4.x'], featured: true, isNew: true,
    },
    {
      id: 'hzv-portal', name: 'HZV Portal', shortDescription: 'Verwaltungsportal fuer Hausarztzentrierte Versorgung.',
      longDescription: 'Portal zur vollstaendigen Verwaltung der Hausarztzentrierten Versorgung inklusive Vertragsmanagement, Teilnehmerverwaltung und Abrechnungsabwicklung.',
      category: 'VERWALTUNG', marketSegment: 'KOSTENTRAEGER', appType: 'anwendung', vendor: 'health_portal', vendorName: 'Health Portal',
      version: '2.3.0', iconColor: '#E5580C', iconInitials: 'HZ', rating: 4, reviewCount: 22, installCount: 56,
      tags: ['HZV', 'Hausarzt', 'Versorgung', 'Vertragsmanagement'], price: 'lizenzpflichtig', compatibility: ['Portal 2.x'], featured: false, isNew: false,
    },
    {
      id: 'pzm-cockpit', name: 'PZM Cockpit', shortDescription: 'Patientenzentriertes Monitoring mit Echtzeit-Dashboard.',
      longDescription: 'Echtzeit-Dashboard zur patientenzentrierten Ueberwachung von Versorgungsverlaeufen und Qualitaetsindikatoren. Bietet individuell konfigurierbare Ansichten und Alarmierungsfunktionen.',
      category: 'ANALYSE', marketSegment: 'LEISTUNGSERBRINGER', appType: 'anwendung', vendor: 'health_portal', vendorName: 'Health Portal',
      version: '1.5.0', iconColor: '#16A34A', iconInitials: 'PZ', rating: 4, reviewCount: 18, installCount: 41,
      tags: ['Monitoring', 'Dashboard', 'Echtzeit', 'Patient'], price: 'lizenzpflichtig', compatibility: ['Portal 2.x'], featured: false, isNew: true,
    },
    {
      id: 'epa-connector', name: 'ePA Connector', shortDescription: 'Integration mit der elektronischen Patientenakte (ePA).',
      longDescription: 'Nahtlose Integration mit der elektronischen Patientenakte. Lesen und Schreiben von Dokumenten in die ePA gemaess aktueller gematik-Spezifikation. Unterstuetzt alle gaengigen Dokumenttypen.',
      category: 'INTEGRATION', marketSegment: 'INFRASTRUKTUR_PLATTFORMEN', appType: 'integration', vendor: 'platform', vendorName: 'Platform',
      version: '1.0.3', iconColor: '#0891B2', iconInitials: 'eP', rating: 4, reviewCount: 8, installCount: 22,
      tags: ['ePA', 'gematik', 'Integration', 'Patientenakte'], price: 'lizenzpflichtig', compatibility: ['Portal 2.x', 'gematik ePA 2.x'], featured: false, isNew: true,
    },
    {
      id: 'ti-messenger', name: 'TI-Messenger', shortDescription: 'Sichere Kommunikation ueber die Telematikinfrastruktur.',
      longDescription: 'Integrierter Messenger fuer sichere Kommunikation im Gesundheitswesen ueber die Telematikinfrastruktur (TI). Unterstuetzt Einzel- und Gruppenchats sowie den Austausch medizinischer Dokumente.',
      category: 'KOMMUNIKATION', marketSegment: 'INFRASTRUKTUR_PLATTFORMEN', appType: 'integration', vendor: 'platform', vendorName: 'Platform',
      version: '1.1.0', iconColor: '#2563EB', iconInitials: 'TI', rating: 3, reviewCount: 6, installCount: 15,
      tags: ['TI', 'Messenger', 'Kommunikation', 'Telematik'], price: 'kostenlos', compatibility: ['Portal 2.x'], featured: false, isNew: false,
    },
    {
      id: 'formular-designer', name: 'Formular-Designer', shortDescription: 'Drag-and-Drop Formularerstellung fuer Gesundheitsanwendungen.',
      longDescription: 'Visueller Formular-Designer mit Drag-and-Drop-Funktionalitaet. Erstellen Sie komplexe medizinische Formulare ohne Programmierung. Unterstuetzt Validierung, bedingte Logik und PDF-Export.',
      category: 'FORMULARE', marketSegment: 'LEISTUNGSERBRINGER', appType: 'anwendung', vendor: 'health_portal', vendorName: 'Health Portal',
      version: '2.0.0', iconColor: '#D946EF', iconInitials: 'FD', rating: 4, reviewCount: 14, installCount: 38,
      tags: ['Formulare', 'Designer', 'Drag-Drop', 'PDF'], price: 'kostenlos', compatibility: ['Portal 2.x'], featured: false, isNew: false,
    },
    {
      id: 'gkv-datenstelle', name: 'GKV-Datenstelle', shortDescription: 'Anbindung an die GKV-Datenstelle fuer den gesetzlichen Datenaustausch.',
      longDescription: 'Sichere Anbindung an die GKV-Datenstelle fuer alle gesetzlich vorgeschriebenen Datenmeldungen und -abrufe. Automatisierte Verarbeitung und Protokollierung aller Datentransfers.',
      category: 'INTEGRATION', marketSegment: 'ABRECHNUNGSDIENSTLEISTER', appType: 'integration', vendor: 'health_portal', vendorName: 'Health Portal',
      version: '1.4.0', iconColor: '#64748B', iconInitials: 'GK', rating: 4, reviewCount: 11, installCount: 29,
      tags: ['GKV', 'Datenstelle', 'Meldung', 'Integration'], price: 'lizenzpflichtig', compatibility: ['Portal 2.x'], featured: false, isNew: false,
    },
    {
      id: 'versorgungsanalyse', name: 'Versorgungsanalyse', shortDescription: 'Datenbasierte Analysen zur Versorgungsqualitaet und Bedarfsplanung.',
      longDescription: 'Umfangreiche Analyseplattform fuer Versorgungsdaten. Unterstuetzt Bedarfsplanung, Qualitaetsmessung und regionale Versorgungsforschung mit interaktiven Dashboards und Exportfunktionen.',
      category: 'ANALYSE', marketSegment: 'OEFFENTLICHE_HAND_FORSCHUNG', appType: 'anwendung', vendor: 'community', vendorName: 'Community',
      version: '1.0.0', iconColor: '#F59E0B', iconInitials: 'VA', rating: 4, reviewCount: 5, installCount: 12,
      tags: ['Analyse', 'Versorgung', 'Forschung', 'Bedarfsplanung'], price: 'lizenzpflichtig', compatibility: ['Portal 2.x'], featured: false, isNew: true,
    },
  ];

  ngOnInit(): void {
    const appId = this.route.snapshot.paramMap.get('appId');
    if (appId) {
      this.app = this.allApps.find(a => a.id === appId);
      this.isInstalled = this.installedAppIds.includes(appId);
      if (this.app) {
        this.changelog = this.generateChangelog(this.app);
      }
    }
  }

  install(): void {
    if (this.app) {
      this.isInstalled = true;
    }
  }

  private generateChangelog(app: PortalApp): { version: string; date: string; changes: string[] }[] {
    return [
      {
        version: app.version,
        date: '2026-02-15',
        changes: [
          'Performance-Optimierungen im Dashboard',
          'Fehlerbehebung bei der Datenexportfunktion',
          'Verbesserte Barrierefreiheit gemaess WCAG 2.1',
        ],
      },
      {
        version: this.decrementVersion(app.version),
        date: '2025-12-01',
        changes: [
          'Neues Benutzerinterface mit verbesserter Navigation',
          'Erweiterte Filterfunktionen',
          'Integration mit dem Portal-Benachrichtigungssystem',
        ],
      },
      {
        version: this.decrementVersion(this.decrementVersion(app.version)),
        date: '2025-09-10',
        changes: [
          'Initiale Veroeffentlichung im Health Portal',
          'Grundlegende Funktionalitaet implementiert',
        ],
      },
    ];
  }

  private decrementVersion(version: string): string {
    const parts = version.split('.').map(Number);
    if (parts[2] > 0) {
      parts[2]--;
    } else if (parts[1] > 0) {
      parts[1]--;
      parts[2] = 0;
    } else if (parts[0] > 0) {
      parts[0]--;
      parts[1] = 0;
      parts[2] = 0;
    }
    return parts.join('.');
  }
}
