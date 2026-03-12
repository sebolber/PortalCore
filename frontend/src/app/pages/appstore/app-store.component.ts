import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PortalApp, MarketSegment, AppType, AppCategory } from '../../models/app.model';

interface MarketSegmentInfo {
  key: MarketSegment;
  name: string;
  icon: string;
  appCount: number;
}

@Component({
  selector: 'app-app-store',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <!-- Hero Banner -->
    <div class="card bg-gradient-to-r from-[#006EC7] to-[#004A87] text-white !border-0 mb-6">
      <h1 class="text-2xl font-bold mb-2">App-Marktplatz</h1>
      <p class="text-blue-100 text-sm max-w-2xl">
        Entdecken Sie Anwendungen und Integrationen fuer Ihr Gesundheitsportal.
        Installieren Sie Apps passend zu Ihrem Marktsegment und erweitern Sie Ihre Plattform.
      </p>
    </div>

    <!-- Market Segments -->
    <h2 class="text-lg font-semibold text-gray-800 mb-4">Marktsegmente</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      <button *ngFor="let seg of segments"
              (click)="toggleSegmentFilter(seg.key)"
              class="card text-left hover:shadow-md transition-shadow"
              [class.ring-2]="selectedSegment === seg.key"
              [class.ring-blue-500]="selectedSegment === seg.key">
        <div class="flex items-center gap-3 mb-2">
          <div class="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" [attr.d]="seg.icon"/>
            </svg>
          </div>
          <div>
            <p class="text-sm font-semibold text-gray-800">{{ seg.name }}</p>
            <p class="text-xs text-gray-400">{{ seg.appCount }} Apps</p>
          </div>
        </div>
      </button>
    </div>

    <!-- Filter Bar -->
    <div class="card mb-6">
      <div class="flex flex-col sm:flex-row gap-4">
        <!-- Search -->
        <div class="relative flex-1">
          <svg class="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><path stroke-linecap="round" d="M21 21l-4.35-4.35"/>
          </svg>
          <input type="text"
                 [(ngModel)]="searchQuery"
                 (ngModelChange)="applyFilters()"
                 placeholder="Apps suchen..."
                 class="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#006EC7] focus:border-transparent"/>
        </div>

        <!-- App Type Toggle -->
        <div class="flex bg-gray-100 rounded-lg p-1 shrink-0">
          <button *ngFor="let type of appTypeOptions"
                  (click)="selectedAppType = type.value; applyFilters()"
                  class="px-4 py-1.5 text-sm font-medium rounded-md transition-colors"
                  [ngClass]="selectedAppType === type.value
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'">
            {{ type.label }}
          </button>
        </div>
      </div>

      <!-- Category Pills -->
      <div class="flex gap-2 mt-4 overflow-x-auto pb-1">
        <button (click)="selectedCategory = null; applyFilters()"
                class="px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-colors"
                [ngClass]="selectedCategory === null
                  ? 'bg-[#006EC7] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'">
          Alle
        </button>
        <button *ngFor="let cat of categories"
                (click)="selectedCategory = cat.key; applyFilters()"
                class="px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-colors"
                [ngClass]="selectedCategory === cat.key
                  ? 'bg-[#006EC7] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'">
          {{ cat.label }}
        </button>
      </div>
    </div>

    <!-- Results Count -->
    <div class="flex items-center justify-between mb-4">
      <p class="text-sm text-gray-500">{{ filteredApps.length }} Apps gefunden</p>
      <button *ngIf="selectedSegment"
              (click)="selectedSegment = null; applyFilters()"
              class="text-sm text-[#006EC7] hover:underline">
        Segmentfilter zuruecksetzen
      </button>
    </div>

    <!-- App Cards Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <a *ngFor="let app of filteredApps"
         [routerLink]="'/appstore/' + app.id"
         class="card hover:shadow-md transition-shadow cursor-pointer relative">

        <!-- New Badge -->
        <span *ngIf="app.isNew"
              class="absolute top-3 right-3 px-2 py-0.5 bg-green-50 text-green-700 text-[10px] font-bold uppercase rounded-full">
          Neu
        </span>

        <!-- App Icon & Info -->
        <div class="flex items-start gap-3 mb-3">
          <div class="w-11 h-11 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0"
               [style.background-color]="app.iconColor">
            {{ app.iconInitials }}
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-semibold text-gray-800 truncate">{{ app.name }}</p>
            <p class="text-xs text-gray-400 truncate">{{ app.vendorName }}</p>
          </div>
        </div>

        <!-- Rating & Install Count -->
        <div class="flex items-center gap-2 mb-2">
          <div class="flex items-center gap-0.5">
            <span *ngFor="let star of [1,2,3,4,5]" class="text-xs"
                  [class.text-yellow-400]="star <= app.rating"
                  [class.text-gray-300]="star > app.rating">&#9733;</span>
          </div>
          <span class="text-xs text-gray-400">{{ app.rating }}</span>
          <span class="text-xs text-gray-300">|</span>
          <span class="text-xs text-gray-400">{{ app.installCount }} Installationen</span>
        </div>

        <!-- Description -->
        <p class="text-xs text-gray-500 line-clamp-2 mb-3">{{ app.shortDescription }}</p>

        <!-- Footer -->
        <div class="flex items-center justify-between">
          <span class="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-medium rounded-full">
            {{ getCategoryLabel(app.category) }}
          </span>
          <span *ngIf="isInstalled(app.id)"
                class="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
            </svg>
            Installiert
          </span>
        </div>
      </a>
    </div>

    <!-- Empty State -->
    <div *ngIf="filteredApps.length === 0" class="text-center py-16">
      <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/>
      </svg>
      <p class="text-gray-500 text-sm">Keine Apps fuer die aktuelle Filterauswahl gefunden.</p>
    </div>
  `,
})
export class AppStoreComponent {
  searchQuery = '';
  selectedSegment: MarketSegment | null = null;
  selectedAppType: AppType | 'alle' = 'alle';
  selectedCategory: AppCategory | null = null;

  filteredApps: PortalApp[] = [];

  readonly installedAppIds = ['kv-ai-abrechnung', 'smile-kh', 'arztregister', 'wb-foerderung', 'dmp-manager', 'smile-kv'];

  readonly appTypeOptions = [
    { label: 'Alle', value: 'alle' as const },
    { label: 'Anwendung', value: 'anwendung' as AppType },
    { label: 'Integration', value: 'integration' as AppType },
  ];

  readonly categories: { key: AppCategory; label: string }[] = [
    { key: 'ABRECHNUNG', label: 'Abrechnung' },
    { key: 'FALLMANAGEMENT', label: 'Fallmanagement' },
    { key: 'VERWALTUNG', label: 'Verwaltung' },
    { key: 'KI_AGENTEN', label: 'KI-Agenten' },
    { key: 'ANALYSE', label: 'Analyse' },
    { key: 'KOMMUNIKATION', label: 'Kommunikation' },
    { key: 'INTEGRATION', label: 'Integration' },
    { key: 'FORMULARE', label: 'Formulare' },
  ];

  readonly segments: MarketSegmentInfo[] = [
    { key: 'STEUERUNG_PRUEFSTELLEN', name: 'Steuerung & Pruefstellen', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', appCount: 4 },
    { key: 'KOSTENTRAEGER', name: 'Kostentraeger', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', appCount: 5 },
    { key: 'ABRECHNUNGSDIENSTLEISTER', name: 'Abrechnungsdienstleister', icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z', appCount: 3 },
    { key: 'LEISTUNGSERBRINGER', name: 'Leistungserbringer', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', appCount: 3 },
    { key: 'INFRASTRUKTUR_PLATTFORMEN', name: 'Infrastruktur & Plattformen', icon: 'M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01', appCount: 2 },
    { key: 'OEFFENTLICHE_HAND_FORSCHUNG', name: 'Oeffentliche Hand & Forschung', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', appCount: 2 },
  ];

  readonly allApps: PortalApp[] = [
    {
      id: 'kv-ai-abrechnung', name: 'KV AI Abrechnung', shortDescription: 'KI-gestuetzte Abrechnungspruefung fuer KV-Leistungen mit automatischer Anomalie-Erkennung.',
      longDescription: 'Vollstaendig KI-gestuetztes System zur automatisierten Pruefung von KV-Abrechnungen. Erkennt Anomalien, Doppeleinreichungen und Kodierungsfehler in Echtzeit.',
      category: 'ABRECHNUNG', marketSegment: 'KOSTENTRAEGER', appType: 'anwendung', vendor: 'health_portal', vendorName: 'Health Portal',
      version: '3.2.1', iconColor: '#006EC7', iconInitials: 'KV', rating: 5, reviewCount: 42, installCount: 128,
      tags: ['KI', 'Abrechnung', 'KV'], price: 'lizenzpflichtig', compatibility: ['Portal 2.x'], featured: true, isNew: false, route: '/apps/kv-ai',
    },
    {
      id: 'smile-kh', name: 'smile KH', shortDescription: 'Krankenhaus-Fallmanagement mit Ampelsystem und Rechnungsverfolgung fuer Kostentraeger.',
      longDescription: 'Umfassendes Fallmanagement-System fuer Krankenhausabrechnungen. Bietet ein Ampelsystem zur schnellen Bewertung sowie eine vollstaendige Rechnungsverfolgung.',
      category: 'FALLMANAGEMENT', marketSegment: 'KOSTENTRAEGER', appType: 'anwendung', vendor: 'health_portal', vendorName: 'Health Portal',
      version: '4.1.0', iconColor: '#28DCAA', iconInitials: 'SK', rating: 4, reviewCount: 38, installCount: 95,
      tags: ['Krankenhaus', 'Fallmanagement', 'Ampel'], price: 'lizenzpflichtig', compatibility: ['Portal 2.x'], featured: true, isNew: false, route: '/apps/smile-kh',
    },
    {
      id: 'arztregister', name: 'Arztregister', shortDescription: 'Zentrale Verwaltung aller zugelassenen Aerzte, Therapeuten und Leistungsorte.',
      longDescription: 'Verwalten Sie zentral alle zugelassenen Leistungserbringer inklusive Aerzte, Therapeuten und Leistungsorte mit vollstaendiger Historisierung.',
      category: 'VERWALTUNG', marketSegment: 'STEUERUNG_PRUEFSTELLEN', appType: 'anwendung', vendor: 'health_portal', vendorName: 'Health Portal',
      version: '2.5.0', iconColor: '#76C800', iconInitials: 'AR', rating: 4, reviewCount: 27, installCount: 73,
      tags: ['Arzt', 'Register', 'Verwaltung'], price: 'kostenlos', compatibility: ['Portal 2.x'], featured: false, isNew: false, route: '/arztregister',
    },
    {
      id: 'wb-foerderung', name: 'WB-Foerderung', shortDescription: 'Verwaltung und Tracking von Weiterbildungsfoerderungen im Gesundheitswesen.',
      longDescription: 'Komplettloesung fuer die Verwaltung von Weiterbildungsfoerderungen. Tracking von Antraegen, Bewilligungen und Auszahlungen.',
      category: 'VERWALTUNG', marketSegment: 'STEUERUNG_PRUEFSTELLEN', appType: 'anwendung', vendor: 'health_portal', vendorName: 'Health Portal',
      version: '1.8.2', iconColor: '#FF9868', iconInitials: 'WB', rating: 4, reviewCount: 19, installCount: 45,
      tags: ['Weiterbildung', 'Foerderung'], price: 'kostenlos', compatibility: ['Portal 2.x'], featured: false, isNew: false, route: '/wb-foerderung',
    },
    {
      id: 'dmp-manager', name: 'DMP Manager', shortDescription: 'Disease-Management-Programme effizient verwalten und dokumentieren.',
      longDescription: 'Umfassende Verwaltung von Disease-Management-Programmen mit Einschreibung, Dokumentation und Qualitaetssicherung.',
      category: 'VERWALTUNG', marketSegment: 'KOSTENTRAEGER', appType: 'anwendung', vendor: 'health_portal', vendorName: 'Health Portal',
      version: '2.1.0', iconColor: '#006EC7', iconInitials: 'DM', rating: 4, reviewCount: 31, installCount: 88,
      tags: ['DMP', 'Chroniker', 'Qualitaet'], price: 'lizenzpflichtig', compatibility: ['Portal 2.x'], featured: false, isNew: false,
    },
    {
      id: 'smile-kv', name: 'smile KV', shortDescription: 'KV-Abrechnungsmanagement mit intelligenter Fehlererkennung.',
      longDescription: 'Spezialisierte Loesung fuer die Bearbeitung und Pruefung von KV-Abrechnungen mit automatisierter Fehlererkennung und Korrekturvorschlaegen.',
      category: 'ABRECHNUNG', marketSegment: 'KOSTENTRAEGER', appType: 'anwendung', vendor: 'health_portal', vendorName: 'Health Portal',
      version: '3.0.1', iconColor: '#F566BA', iconInitials: 'SV', rating: 4, reviewCount: 24, installCount: 67,
      tags: ['KV', 'Abrechnung', 'Pruefung'], price: 'lizenzpflichtig', compatibility: ['Portal 2.x'], featured: false, isNew: false,
    },
    {
      id: 'ki-kodier-assistent', name: 'KI-Kodier-Assistent', shortDescription: 'KI-basierte Unterstuetzung bei der medizinischen Kodierung (ICD, OPS, DRG).',
      longDescription: 'Intelligenter Assistent zur Unterstuetzung bei der korrekten medizinischen Kodierung. Nutzt KI um passende ICD-, OPS- und DRG-Codes vorzuschlagen.',
      category: 'KI_AGENTEN', marketSegment: 'ABRECHNUNGSDIENSTLEISTER', appType: 'anwendung', vendor: 'health_portal', vendorName: 'Health Portal',
      version: '1.2.0', iconColor: '#9333EA', iconInitials: 'KA', rating: 5, reviewCount: 15, installCount: 34,
      tags: ['KI', 'Kodierung', 'ICD', 'DRG'], price: 'lizenzpflichtig', compatibility: ['Portal 2.x'], featured: true, isNew: true,
    },
    {
      id: 'hzv-portal', name: 'HZV Portal', shortDescription: 'Verwaltungsportal fuer Hausarztzentrierte Versorgung.',
      longDescription: 'Portal zur vollstaendigen Verwaltung der Hausarztzentrierten Versorgung inklusive Vertragsmanagement und Abrechnungsabwicklung.',
      category: 'VERWALTUNG', marketSegment: 'KOSTENTRAEGER', appType: 'anwendung', vendor: 'health_portal', vendorName: 'Health Portal',
      version: '2.3.0', iconColor: '#E5580C', iconInitials: 'HZ', rating: 4, reviewCount: 22, installCount: 56,
      tags: ['HZV', 'Hausarzt', 'Versorgung'], price: 'lizenzpflichtig', compatibility: ['Portal 2.x'], featured: false, isNew: false,
    },
    {
      id: 'pzm-cockpit', name: 'PZM Cockpit', shortDescription: 'Patientenzentriertes Monitoring mit Echtzeit-Dashboard.',
      longDescription: 'Echtzeit-Dashboard zur patientenzentrierten Ueberwachung von Versorgungsverlaeufen und Qualitaetsindikatoren.',
      category: 'ANALYSE', marketSegment: 'LEISTUNGSERBRINGER', appType: 'anwendung', vendor: 'health_portal', vendorName: 'Health Portal',
      version: '1.5.0', iconColor: '#16A34A', iconInitials: 'PZ', rating: 4, reviewCount: 18, installCount: 41,
      tags: ['Monitoring', 'Dashboard', 'Echtzeit'], price: 'lizenzpflichtig', compatibility: ['Portal 2.x'], featured: false, isNew: true,
    },
    {
      id: 'epa-connector', name: 'ePA Connector', shortDescription: 'Integration mit der elektronischen Patientenakte (ePA).',
      longDescription: 'Nahtlose Integration mit der elektronischen Patientenakte. Lesen und Schreiben von Dokumenten in die ePA gemaess gematik-Spezifikation.',
      category: 'INTEGRATION', marketSegment: 'INFRASTRUKTUR_PLATTFORMEN', appType: 'integration', vendor: 'platform', vendorName: 'Platform',
      version: '1.0.3', iconColor: '#0891B2', iconInitials: 'eP', rating: 4, reviewCount: 8, installCount: 22,
      tags: ['ePA', 'gematik', 'Integration'], price: 'lizenzpflichtig', compatibility: ['Portal 2.x'], featured: false, isNew: true,
    },
    {
      id: 'ti-messenger', name: 'TI-Messenger', shortDescription: 'Sichere Kommunikation ueber die Telematikinfrastruktur.',
      longDescription: 'Integrierter Messenger fuer sichere Kommunikation im Gesundheitswesen ueber die Telematikinfrastruktur (TI).',
      category: 'KOMMUNIKATION', marketSegment: 'INFRASTRUKTUR_PLATTFORMEN', appType: 'integration', vendor: 'platform', vendorName: 'Platform',
      version: '1.1.0', iconColor: '#2563EB', iconInitials: 'TI', rating: 3, reviewCount: 6, installCount: 15,
      tags: ['TI', 'Messenger', 'Kommunikation'], price: 'kostenlos', compatibility: ['Portal 2.x'], featured: false, isNew: false,
    },
    {
      id: 'formular-designer', name: 'Formular-Designer', shortDescription: 'Drag-and-Drop Formularerstellung fuer Gesundheitsanwendungen.',
      longDescription: 'Visueller Formular-Designer mit Drag-and-Drop-Funktionalitaet. Erstellen Sie komplexe medizinische Formulare ohne Programmierung.',
      category: 'FORMULARE', marketSegment: 'LEISTUNGSERBRINGER', appType: 'anwendung', vendor: 'health_portal', vendorName: 'Health Portal',
      version: '2.0.0', iconColor: '#D946EF', iconInitials: 'FD', rating: 4, reviewCount: 14, installCount: 38,
      tags: ['Formulare', 'Designer', 'Drag-Drop'], price: 'kostenlos', compatibility: ['Portal 2.x'], featured: false, isNew: false,
    },
    {
      id: 'gkv-datenstelle', name: 'GKV-Datenstelle', shortDescription: 'Anbindung an die GKV-Datenstelle fuer den gesetzlichen Datenaustausch.',
      longDescription: 'Sichere Anbindung an die GKV-Datenstelle fuer alle gesetzlich vorgeschriebenen Datenmeldungen und -abrufe.',
      category: 'INTEGRATION', marketSegment: 'ABRECHNUNGSDIENSTLEISTER', appType: 'integration', vendor: 'health_portal', vendorName: 'Health Portal',
      version: '1.4.0', iconColor: '#64748B', iconInitials: 'GK', rating: 4, reviewCount: 11, installCount: 29,
      tags: ['GKV', 'Datenstelle', 'Meldung'], price: 'lizenzpflichtig', compatibility: ['Portal 2.x'], featured: false, isNew: false,
    },
    {
      id: 'versorgungsanalyse', name: 'Versorgungsanalyse', shortDescription: 'Datenbasierte Analysen zur Versorgungsqualitaet und Bedarfsplanung.',
      longDescription: 'Umfangreiche Analyseplattform fuer Versorgungsdaten. Unterstuetzt Bedarfsplanung, Qualitaetsmessung und regionale Versorgungsforschung.',
      category: 'ANALYSE', marketSegment: 'OEFFENTLICHE_HAND_FORSCHUNG', appType: 'anwendung', vendor: 'community', vendorName: 'Community',
      version: '1.0.0', iconColor: '#F59E0B', iconInitials: 'VA', rating: 4, reviewCount: 5, installCount: 12,
      tags: ['Analyse', 'Versorgung', 'Forschung'], price: 'lizenzpflichtig', compatibility: ['Portal 2.x'], featured: false, isNew: true,
    },
  ];

  constructor() {
    this.applyFilters();
  }

  applyFilters(): void {
    let result = [...this.allApps];

    if (this.selectedSegment) {
      result = result.filter(a => a.marketSegment === this.selectedSegment);
    }

    if (this.selectedAppType !== 'alle') {
      result = result.filter(a => a.appType === this.selectedAppType);
    }

    if (this.selectedCategory) {
      result = result.filter(a => a.category === this.selectedCategory);
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      result = result.filter(a =>
        a.name.toLowerCase().includes(q) ||
        a.shortDescription.toLowerCase().includes(q) ||
        a.vendorName.toLowerCase().includes(q) ||
        a.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    this.filteredApps = result;
  }

  toggleSegmentFilter(segment: MarketSegment): void {
    this.selectedSegment = this.selectedSegment === segment ? null : segment;
    this.applyFilters();
  }

  isInstalled(appId: string): boolean {
    return this.installedAppIds.includes(appId);
  }

  getCategoryLabel(category: AppCategory): string {
    const found = this.categories.find(c => c.key === category);
    return found ? found.label : category;
  }
}
