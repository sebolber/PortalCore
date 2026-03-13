import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PortalApp, MarketSegment, AppType, AppCategory, AppVendor } from '../../models/app.model';
import { AppService } from '../../services/app.service';
import { InstalledAppService } from '../../services/installed-app.service';
import { PortalStateService } from '../../services/portal-state.service';
import { AuthService } from '../../services/auth.service';

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
    <div class="card bg-gradient-to-r from-[#006EC7] to-[#004A87] text-white !border-0 mb-4 sm:mb-6">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 class="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">App-Marktplatz</h1>
          <p class="text-blue-100 text-xs sm:text-sm max-w-2xl">
            Entdecken Sie Anwendungen und Integrationen fuer Ihr Gesundheitsportal.
          </p>
        </div>
        <button *ngIf="authService.darfAppInstallieren()"
                (click)="showCreateForm = true"
                class="px-4 py-2 bg-white text-[#006EC7] text-sm font-medium rounded-lg hover:bg-blue-50 transition-colors shrink-0 w-full sm:w-auto text-center">
          + Neue App anlegen
        </button>
      </div>
    </div>

    <!-- Create App Form Modal -->
    <div *ngIf="showCreateForm" class="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 sm:p-4">
      <div class="bg-white rounded-t-xl sm:rounded-xl shadow-xl w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-gray-800">Neue App anlegen</h2>
          <button (click)="showCreateForm = false" class="text-gray-400 hover:text-gray-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input [(ngModel)]="newApp.name" type="text" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#006EC7] focus:border-transparent"/>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">ID *</label>
              <input [(ngModel)]="newApp.id" type="text" placeholder="z.B. meine-app" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#006EC7] focus:border-transparent"/>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Kurzbeschreibung *</label>
            <input [(ngModel)]="newApp.shortDescription" type="text" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#006EC7] focus:border-transparent"/>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
            <textarea [(ngModel)]="newApp.longDescription" rows="3" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#006EC7] focus:border-transparent"></textarea>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Kategorie *</label>
              <select [(ngModel)]="newApp.category" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#006EC7] focus:border-transparent">
                <option *ngFor="let cat of categories" [value]="cat.key">{{ cat.label }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Marktsegment *</label>
              <select [(ngModel)]="newApp.marketSegment" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#006EC7] focus:border-transparent">
                <option *ngFor="let seg of segments" [value]="seg.key">{{ seg.name }}</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">App-Typ *</label>
              <select [(ngModel)]="newApp.appType" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#006EC7] focus:border-transparent">
                <option value="ANWENDUNG">Anwendung</option>
                <option value="INTEGRATION">Integration</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Anbieter *</label>
              <select [(ngModel)]="newApp.vendor" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#006EC7] focus:border-transparent">
                <option value="HEALTH_PORTAL">Health Portal</option>
                <option value="PLATFORM">Platform</option>
                <option value="COMMUNITY">Community</option>
                <option value="DRITTANBIETER">Drittanbieter</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Version</label>
              <input [(ngModel)]="newApp.version" type="text" placeholder="1.0.0" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#006EC7] focus:border-transparent"/>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Icon-Kuerzel</label>
              <input [(ngModel)]="newApp.iconInitials" type="text" maxlength="3" placeholder="z.B. MA" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#006EC7] focus:border-transparent"/>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Icon-Farbe</label>
              <input [(ngModel)]="newApp.iconColor" type="color" class="w-full h-10 border border-gray-200 rounded-lg cursor-pointer"/>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Repository-URL</label>
              <input [(ngModel)]="newApp.repositoryUrl" type="url" placeholder="https://github.com/..." class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#006EC7] focus:border-transparent"/>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Anwendungs-URL</label>
              <input [(ngModel)]="newApp.applicationUrl" type="text" placeholder="/apps/meine-app" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#006EC7] focus:border-transparent"/>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Preis</label>
            <select [(ngModel)]="newApp.price" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#006EC7] focus:border-transparent">
              <option value="kostenlos">Kostenlos</option>
              <option value="lizenzpflichtig">Lizenzpflichtig</option>
            </select>
          </div>

          <div class="flex gap-3 pt-4 border-t border-gray-100">
            <button (click)="createApp()"
                    [disabled]="!newApp.name || !newApp.id || !newApp.shortDescription"
                    class="flex-1 px-4 py-2.5 bg-[#006EC7] text-white text-sm font-medium rounded-lg hover:bg-[#005BA3] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              App anlegen
            </button>
            <button (click)="showCreateForm = false"
                    class="px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors">
              Abbrechen
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Market Segments -->
    <h2 class="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Marktsegmente</h2>
    <div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
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
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
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
export class AppStoreComponent implements OnInit {
  private readonly appService = inject(AppService);
  private readonly installedAppService = inject(InstalledAppService);
  private readonly portalState = inject(PortalStateService);
  readonly authService = inject(AuthService);

  searchQuery = '';
  selectedSegment: MarketSegment | null = null;
  selectedAppType: AppType | 'alle' = 'alle';
  selectedCategory: AppCategory | null = null;
  showCreateForm = false;

  allApps: PortalApp[] = [];
  filteredApps: PortalApp[] = [];
  installedAppIds: string[] = [];

  newApp: Partial<PortalApp> = this.getEmptyApp();

  readonly appTypeOptions = [
    { label: 'Alle', value: 'alle' as const },
    { label: 'Anwendung', value: 'ANWENDUNG' as AppType },
    { label: 'Integration', value: 'INTEGRATION' as AppType },
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

  segments: MarketSegmentInfo[] = [
    { key: 'STEUERUNG_PRUEFSTELLEN', name: 'Steuerung & Pruefstellen', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', appCount: 0 },
    { key: 'KOSTENTRAEGER', name: 'Kostentraeger', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', appCount: 0 },
    { key: 'ABRECHNUNGSDIENSTLEISTER', name: 'Abrechnungsdienstleister', icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z', appCount: 0 },
    { key: 'LEISTUNGSERBRINGER', name: 'Leistungserbringer', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', appCount: 0 },
    { key: 'INFRASTRUKTUR_PLATTFORMEN', name: 'Infrastruktur & Plattformen', icon: 'M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01', appCount: 0 },
    { key: 'OEFFENTLICHE_HAND_FORSCHUNG', name: 'Oeffentliche Hand & Forschung', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', appCount: 0 },
  ];

  ngOnInit(): void {
    this.loadApps();
    this.loadInstalledApps();
  }

  private loadApps(): void {
    this.appService.getAll().subscribe({
      next: (apps) => {
        this.allApps = apps;
        this.updateSegmentCounts();
        this.applyFilters();
      },
      error: () => {
        this.allApps = [];
        this.applyFilters();
      }
    });
  }

  private loadInstalledApps(): void {
    const tenantId = this.portalState.currentTenantSnapshot.id;
    this.installedAppService.getAll(tenantId).subscribe({
      next: (installed) => {
        this.installedAppIds = installed.map(i => i.app?.id).filter((id): id is string => !!id);
      },
      error: () => {
        this.installedAppIds = [];
      }
    });
  }

  private updateSegmentCounts(): void {
    for (const seg of this.segments) {
      seg.appCount = this.allApps.filter(a => a.marketSegment === seg.key).length;
    }
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
        a.vendorName.toLowerCase().includes(q)
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

  createApp(): void {
    if (!this.newApp.name || !this.newApp.id || !this.newApp.shortDescription) return;

    const app: Partial<PortalApp> = {
      ...this.newApp,
      rating: 0,
      reviewCount: 0,
      installCount: 0,
      featured: false,
      isNew: true,
      tags: [],
      compatibility: [],
    };

    this.appService.create(app).subscribe({
      next: (created) => {
        this.allApps.push(created);
        this.updateSegmentCounts();
        this.applyFilters();
        this.showCreateForm = false;
        this.newApp = this.getEmptyApp();
      }
    });
  }

  private getEmptyApp(): Partial<PortalApp> {
    return {
      id: '',
      name: '',
      shortDescription: '',
      longDescription: '',
      category: 'VERWALTUNG',
      marketSegment: 'KOSTENTRAEGER',
      appType: 'ANWENDUNG',
      vendor: 'HEALTH_PORTAL',
      vendorName: 'Health Portal',
      version: '1.0.0',
      iconColor: '#006EC7',
      iconInitials: '',
      price: 'kostenlos',
      repositoryUrl: '',
      applicationUrl: '',
    };
  }
}
