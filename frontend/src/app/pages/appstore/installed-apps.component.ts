import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface InstalledAppView {
  id: string;
  appId: string;
  name: string;
  iconColor: string;
  iconInitials: string;
  version: string;
  status: 'aktiv' | 'inaktiv' | 'update_verfuegbar';
  installedAt: string;
  vendorName: string;
}

@Component({
  selector: 'app-installed-apps',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Installierte Apps</h1>
        <p class="text-sm text-gray-500 mt-1">{{ apps.length }} Apps installiert</p>
      </div>
      <a routerLink="/appstore"
         class="px-4 py-2 bg-[#006EC7] text-white text-sm font-medium rounded-lg hover:bg-[#005BA3] transition-colors">
        Weitere Apps entdecken
      </a>
    </div>

    <!-- App Cards Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div *ngFor="let app of apps" class="card">
        <!-- App Header -->
        <div class="flex items-start gap-3 mb-4">
          <a [routerLink]="'/appstore/' + app.appId"
             class="w-12 h-12 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0 hover:opacity-80 transition-opacity"
             [style.background-color]="app.iconColor">
            {{ app.iconInitials }}
          </a>
          <div class="flex-1 min-w-0">
            <a [routerLink]="'/appstore/' + app.appId"
               class="text-sm font-semibold text-gray-800 hover:text-[#006EC7] transition-colors truncate block">
              {{ app.name }}
            </a>
            <p class="text-xs text-gray-400">{{ app.vendorName }}</p>
          </div>
          <!-- Status Badge -->
          <span class="px-2.5 py-0.5 text-[10px] font-medium rounded-full shrink-0"
                [ngClass]="{
                  'bg-green-50 text-green-700': app.status === 'aktiv',
                  'bg-gray-100 text-gray-500': app.status === 'inaktiv',
                  'bg-blue-50 text-blue-700': app.status === 'update_verfuegbar'
                }">
            {{ getStatusLabel(app.status) }}
          </span>
        </div>

        <!-- Details -->
        <div class="space-y-2 mb-4">
          <div class="flex justify-between text-xs">
            <span class="text-gray-400">Version</span>
            <span class="text-gray-700 font-medium">{{ app.version }}</span>
          </div>
          <div class="flex justify-between text-xs">
            <span class="text-gray-400">Installiert am</span>
            <span class="text-gray-700">{{ formatDate(app.installedAt) }}</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-2 pt-3 border-t border-gray-100">
          <button *ngIf="app.status === 'update_verfuegbar'"
                  (click)="updateApp(app)"
                  class="flex-1 px-3 py-2 bg-[#006EC7] text-white text-xs font-medium rounded-lg hover:bg-[#005BA3] transition-colors text-center">
            Aktualisieren
          </button>
          <button (click)="uninstall(app)"
                  class="flex-1 px-3 py-2 bg-white border border-red-200 text-red-600 text-xs font-medium rounded-lg hover:bg-red-50 transition-colors text-center">
            Deinstallieren
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div *ngIf="apps.length === 0" class="text-center py-16">
      <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
      </svg>
      <p class="text-gray-500 text-sm mb-4">Noch keine Apps installiert.</p>
      <a routerLink="/appstore"
         class="inline-flex px-4 py-2 bg-[#006EC7] text-white text-sm font-medium rounded-lg hover:bg-[#005BA3] transition-colors">
        Apps entdecken
      </a>
    </div>
  `,
})
export class InstalledAppsComponent {
  apps: InstalledAppView[] = [
    {
      id: 'inst-1', appId: 'kv-ai-abrechnung', name: 'KV AI Abrechnung',
      iconColor: '#006EC7', iconInitials: 'KV', version: '3.2.1', status: 'aktiv',
      installedAt: '2025-08-15', vendorName: 'adesso health',
    },
    {
      id: 'inst-2', appId: 'smile-kh', name: 'smile KH',
      iconColor: '#28DCAA', iconInitials: 'SK', version: '4.0.2', status: 'update_verfuegbar',
      installedAt: '2025-06-01', vendorName: 'adesso health',
    },
    {
      id: 'inst-3', appId: 'arztregister', name: 'Arztregister',
      iconColor: '#76C800', iconInitials: 'AR', version: '2.5.0', status: 'aktiv',
      installedAt: '2025-09-10', vendorName: 'adesso health',
    },
    {
      id: 'inst-4', appId: 'wb-foerderung', name: 'WB-Foerderung',
      iconColor: '#FF9868', iconInitials: 'WB', version: '1.8.2', status: 'aktiv',
      installedAt: '2025-10-22', vendorName: 'adesso health',
    },
    {
      id: 'inst-5', appId: 'dmp-manager', name: 'DMP Manager',
      iconColor: '#006EC7', iconInitials: 'DM', version: '2.1.0', status: 'aktiv',
      installedAt: '2025-07-03', vendorName: 'adesso health',
    },
    {
      id: 'inst-6', appId: 'smile-kv', name: 'smile KV',
      iconColor: '#F566BA', iconInitials: 'SV', version: '2.9.0', status: 'update_verfuegbar',
      installedAt: '2025-05-18', vendorName: 'adesso health',
    },
  ];

  getStatusLabel(status: InstalledAppView['status']): string {
    const labels: Record<string, string> = {
      'aktiv': 'Aktiv',
      'inaktiv': 'Inaktiv',
      'update_verfuegbar': 'Update verfuegbar',
    };
    return labels[status] || status;
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  updateApp(app: InstalledAppView): void {
    app.status = 'aktiv';
    // In a real app, this would call the InstalledAppService
  }

  uninstall(app: InstalledAppView): void {
    this.apps = this.apps.filter(a => a.id !== app.id);
    // In a real app, this would call the InstalledAppService
  }
}
