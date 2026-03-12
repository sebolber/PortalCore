import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface CmsEntry {
  id: string;
  titel: string;
  slug: string;
  typ: 'seite' | 'news' | 'faq' | 'hilfe';
  status: 'veroeffentlicht' | 'entwurf' | 'archiviert';
  autor: string;
  aktualisiert: string;
}

@Component({
  selector: 'app-cms',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6" style="font-family: 'Fira Sans', sans-serif">

      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">CMS</h1>
          <p class="text-sm text-gray-500 mt-1">Inhalte verwalten und veroeffentlichen</p>
        </div>
        <button class="px-4 py-2 text-sm font-medium text-white bg-[#006EC7] hover:bg-[#005ba3] rounded-lg transition-colors flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
          </svg>
          Neuer Inhalt
        </button>
      </div>

      <!-- Type Filter + Search -->
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="flex gap-1 bg-white border border-gray-200 rounded-xl p-1">
          <button *ngFor="let t of typeFilters"
                  (click)="activeType = t.value"
                  class="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
                  [ngClass]="activeType === t.value
                    ? 'bg-[#006EC7] text-white'
                    : 'text-gray-600 hover:bg-gray-50'">
            {{ t.label }}
          </button>
        </div>
        <div class="relative flex-1">
          <svg class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35"/>
          </svg>
          <input type="text" placeholder="Inhalte suchen..."
                 [(ngModel)]="searchQuery"
                 class="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#006EC7] focus:border-transparent"/>
        </div>
      </div>

      <!-- Table -->
      <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-200">
                <th class="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Titel</th>
                <th class="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Typ</th>
                <th class="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Status</th>
                <th class="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Autor</th>
                <th class="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Aktualisiert</th>
                <th class="text-right px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Aktionen</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr *ngFor="let entry of filteredEntries()" class="hover:bg-gray-50 transition-colors">
                <td class="px-4 py-3">
                  <p class="font-medium text-gray-900">{{ entry.titel }}</p>
                  <p class="text-xs text-gray-400 mt-0.5">/{{ entry.slug }}</p>
                </td>
                <td class="px-4 py-3">
                  <span class="inline-block px-2 py-0.5 text-xs font-medium rounded-full"
                        [ngClass]="getTypBadgeClass(entry.typ)">
                    {{ getTypLabel(entry.typ) }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full"
                        [ngClass]="getStatusBadgeClass(entry.status)">
                    <span class="w-1.5 h-1.5 rounded-full"
                          [ngClass]="{
                            'bg-green-500': entry.status === 'veroeffentlicht',
                            'bg-yellow-500': entry.status === 'entwurf',
                            'bg-gray-400': entry.status === 'archiviert'
                          }"></span>
                    {{ getStatusLabel(entry.status) }}
                  </span>
                </td>
                <td class="px-4 py-3 text-gray-600">{{ entry.autor }}</td>
                <td class="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{{ entry.aktualisiert }}</td>
                <td class="px-4 py-3 text-right">
                  <div class="flex items-center justify-end gap-1">
                    <button class="p-1.5 text-gray-400 hover:text-[#006EC7] hover:bg-blue-50 rounded transition-colors" title="Bearbeiten">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                    </button>
                    <button class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors" title="Loeschen">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `,
})
export class CmsComponent {
  searchQuery = '';
  activeType = '';

  readonly typeFilters = [
    { label: 'Alle', value: '' },
    { label: 'Seite', value: 'seite' },
    { label: 'News', value: 'news' },
    { label: 'FAQ', value: 'faq' },
    { label: 'Hilfe', value: 'hilfe' },
  ];

  readonly entries = signal<CmsEntry[]>([
    { id: 'cms-1', titel: 'Startseite', slug: 'startseite', typ: 'seite', status: 'veroeffentlicht', autor: 'S. Mueller', aktualisiert: '2026-03-10' },
    { id: 'cms-2', titel: 'Neue Funktionen im Portal Q1/2026', slug: 'news/neue-funktionen-q1-2026', typ: 'news', status: 'veroeffentlicht', autor: 'T. Wagner', aktualisiert: '2026-03-08' },
    { id: 'cms-3', titel: 'Wie erstelle ich einen Batch-Job?', slug: 'faq/batch-job-erstellen', typ: 'faq', status: 'veroeffentlicht', autor: 'S. Mueller', aktualisiert: '2026-03-05' },
    { id: 'cms-4', titel: 'Datenschutzerklaerung', slug: 'datenschutz', typ: 'seite', status: 'veroeffentlicht', autor: 'J. Becker', aktualisiert: '2026-02-28' },
    { id: 'cms-5', titel: 'Release Notes v2.5 (Entwurf)', slug: 'news/release-notes-v25', typ: 'news', status: 'entwurf', autor: 'T. Wagner', aktualisiert: '2026-03-11' },
    { id: 'cms-6', titel: 'API-Dokumentation (veraltet)', slug: 'hilfe/api-dokumentation', typ: 'hilfe', status: 'archiviert', autor: 'M. Schmidt', aktualisiert: '2025-12-15' },
  ]);

  readonly filteredEntries = computed(() => {
    let result = this.entries();
    if (this.activeType) {
      result = result.filter(e => e.typ === this.activeType);
    }
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(e => e.titel.toLowerCase().includes(q) || e.slug.toLowerCase().includes(q));
    }
    return result;
  });

  getTypBadgeClass(typ: string): string {
    switch (typ) {
      case 'seite': return 'bg-blue-100 text-blue-700';
      case 'news': return 'bg-purple-100 text-purple-700';
      case 'faq': return 'bg-teal-100 text-teal-700';
      case 'hilfe': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  getTypLabel(typ: string): string {
    switch (typ) {
      case 'seite': return 'Seite';
      case 'news': return 'News';
      case 'faq': return 'FAQ';
      case 'hilfe': return 'Hilfe';
      default: return typ;
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'veroeffentlicht': return 'bg-green-100 text-green-700';
      case 'entwurf': return 'bg-yellow-100 text-yellow-700';
      case 'archiviert': return 'bg-gray-100 text-gray-500';
      default: return 'bg-gray-100 text-gray-500';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'veroeffentlicht': return 'Veroeffentlicht';
      case 'entwurf': return 'Entwurf';
      case 'archiviert': return 'Archiviert';
      default: return status;
    }
  }
}
