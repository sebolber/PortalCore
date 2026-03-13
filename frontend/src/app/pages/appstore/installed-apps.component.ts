import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { InstalledApp } from '../../models/app.model';
import { InstalledAppService } from '../../services/installed-app.service';
import { PortalStateService } from '../../services/portal-state.service';

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
      <div *ngFor="let installed of apps" class="card">
        <!-- App Header -->
        <div class="flex items-start gap-3 mb-4">
          <a [routerLink]="'/appstore/' + installed.app?.id"
             class="w-12 h-12 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0 hover:opacity-80 transition-opacity"
             [style.background-color]="installed.app?.iconColor || '#006EC7'">
            {{ installed.app?.iconInitials || '?' }}
          </a>
          <div class="flex-1 min-w-0">
            <a [routerLink]="'/appstore/' + installed.app?.id"
               class="text-sm font-semibold text-gray-800 hover:text-[#006EC7] transition-colors truncate block">
              {{ installed.app?.name || 'Unbekannte App' }}
            </a>
            <p class="text-xs text-gray-400">{{ installed.app?.vendorName || '' }}</p>
          </div>
          <!-- Status Badge -->
          <span class="px-2.5 py-0.5 text-[10px] font-medium rounded-full shrink-0"
                [ngClass]="{
                  'bg-green-50 text-green-700': installed.status === 'ACTIVE',
                  'bg-gray-100 text-gray-500': installed.status === 'INACTIVE'
                }">
            {{ installed.status === 'ACTIVE' ? 'Aktiv' : installed.status }}
          </span>
        </div>

        <!-- Details -->
        <div class="space-y-2 mb-4">
          <div class="flex justify-between text-xs">
            <span class="text-gray-400">Version</span>
            <span class="text-gray-700 font-medium">{{ installed.app?.version || '-' }}</span>
          </div>
          <div class="flex justify-between text-xs">
            <span class="text-gray-400">Installiert am</span>
            <span class="text-gray-700">{{ formatDate(installed.installedAt) }}</span>
          </div>
          <div *ngIf="installed.app?.repositoryUrl" class="flex justify-between text-xs">
            <span class="text-gray-400">Repository</span>
            <span class="text-gray-700 truncate ml-4">{{ installed.app?.repositoryUrl }}</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-2 pt-3 border-t border-gray-100">
          <a *ngIf="installed.app?.applicationUrl"
             [routerLink]="installed.app?.applicationUrl"
             class="flex-1 px-3 py-2 bg-[#006EC7] text-white text-xs font-medium rounded-lg hover:bg-[#005BA3] transition-colors text-center">
            Oeffnen
          </a>
          <button (click)="uninstall(installed)"
                  [disabled]="uninstallingId === installed.id"
                  class="flex-1 px-3 py-2 bg-white border border-red-200 text-red-600 text-xs font-medium rounded-lg hover:bg-red-50 transition-colors text-center disabled:opacity-50">
            {{ uninstallingId === installed.id ? 'Wird entfernt...' : 'Deinstallieren' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div *ngIf="apps.length === 0 && !loading" class="text-center py-16">
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
export class InstalledAppsComponent implements OnInit {
  private readonly installedAppService = inject(InstalledAppService);
  private readonly portalState = inject(PortalStateService);

  apps: InstalledApp[] = [];
  loading = true;
  uninstallingId: string | null = null;

  ngOnInit(): void {
    this.loadInstalledApps();
  }

  private loadInstalledApps(): void {
    const tenantId = this.portalState.currentTenantSnapshot.id;
    this.installedAppService.getAll(tenantId).subscribe({
      next: (installed) => {
        this.apps = installed;
        this.loading = false;
      },
      error: () => {
        this.apps = [];
        this.loading = false;
      }
    });
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  uninstall(installed: InstalledApp): void {
    if (!installed.app) return;
    this.uninstallingId = installed.id;
    const tenantId = this.portalState.currentTenantSnapshot.id;
    this.installedAppService.uninstall(tenantId, installed.app.id).subscribe({
      next: () => {
        this.apps = this.apps.filter(a => a.id !== installed.id);
        this.uninstallingId = null;
      },
      error: () => {
        this.uninstallingId = null;
      }
    });
  }
}
