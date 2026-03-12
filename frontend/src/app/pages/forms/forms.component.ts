import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface PortalForm {
  id: string;
  name: string;
  typ: 'antrag' | 'erfassung' | 'konfiguration' | 'umfrage';
  felder: number;
  einreichungen: number;
  version: string;
  status: 'aktiv' | 'entwurf' | 'archiviert';
}

@Component({
  selector: 'app-forms',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6" style="font-family: 'Fira Sans', sans-serif">

      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Formulare</h1>
          <p class="text-sm text-gray-500 mt-1">Formulare erstellen und verwalten</p>
        </div>
        <button class="px-4 py-2 text-sm font-medium text-white bg-[#006EC7] hover:bg-[#005ba3] rounded-lg transition-colors flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
          </svg>
          Neues Formular
        </button>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white border border-gray-200 rounded-xl p-4">
          <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">Formulare</p>
          <p class="text-2xl font-bold text-gray-900 mt-1">{{ forms().length }}</p>
        </div>
        <div class="bg-white border border-gray-200 rounded-xl p-4">
          <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">Aktiv</p>
          <p class="text-2xl font-bold text-green-600 mt-1">{{ activeCount() }}</p>
        </div>
        <div class="bg-white border border-gray-200 rounded-xl p-4">
          <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">Entwurf</p>
          <p class="text-2xl font-bold text-yellow-600 mt-1">{{ draftCount() }}</p>
        </div>
        <div class="bg-white border border-gray-200 rounded-xl p-4">
          <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">Einreichungen</p>
          <p class="text-2xl font-bold text-[#006EC7] mt-1">{{ totalSubmissions() }}</p>
        </div>
      </div>

      <!-- Search -->
      <div class="relative">
        <svg class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35"/>
        </svg>
        <input type="text" placeholder="Formulare suchen..."
               [(ngModel)]="searchQuery"
               class="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#006EC7] focus:border-transparent"/>
      </div>

      <!-- Form Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div *ngFor="let form of filteredForms()"
             class="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all duration-200 group">
          <div class="flex items-start justify-between mb-3">
            <!-- Icon -->
            <div class="w-10 h-10 rounded-lg flex items-center justify-center"
                 [ngClass]="getTypIconBg(form.typ)">
              <!-- Antrag -->
              <svg *ngIf="form.typ === 'antrag'" class="w-5 h-5" [ngClass]="getTypIconColor(form.typ)" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <!-- Erfassung -->
              <svg *ngIf="form.typ === 'erfassung'" class="w-5 h-5" [ngClass]="getTypIconColor(form.typ)" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
              <!-- Konfiguration -->
              <svg *ngIf="form.typ === 'konfiguration'" class="w-5 h-5" [ngClass]="getTypIconColor(form.typ)" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <circle cx="12" cy="12" r="3"/><path stroke-linecap="round" stroke-linejoin="round" d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
              </svg>
              <!-- Umfrage -->
              <svg *ngIf="form.typ === 'umfrage'" class="w-5 h-5" [ngClass]="getTypIconColor(form.typ)" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
              </svg>
            </div>
            <!-- Type badge -->
            <span class="px-2 py-0.5 text-[10px] font-medium rounded-full"
                  [ngClass]="getTypBadgeClass(form.typ)">
              {{ getTypLabel(form.typ) }}
            </span>
          </div>

          <h3 class="text-sm font-semibold text-gray-900">{{ form.name }}</h3>

          <div class="flex items-center gap-4 mt-3 text-xs text-gray-500">
            <span class="flex items-center gap-1">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h7"/>
              </svg>
              {{ form.felder }} Felder
            </span>
            <span class="flex items-center gap-1">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              {{ form.einreichungen }} Einr.
            </span>
            <span class="text-gray-400">v{{ form.version }}</span>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
            <button class="flex-1 px-3 py-1.5 text-xs font-medium text-[#006EC7] bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
              Bearbeiten
            </button>
            <button class="px-3 py-1.5 text-xs font-medium text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
              Vorschau
            </button>
            <button class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

    </div>
  `,
})
export class FormsComponent {
  searchQuery = '';

  readonly forms = signal<PortalForm[]>([
    { id: 'f-1', name: 'Kostenuebernahme-Antrag', typ: 'antrag', felder: 24, einreichungen: 89, version: '2.1', status: 'aktiv' },
    { id: 'f-2', name: 'Patientendaten-Erfassung', typ: 'erfassung', felder: 18, einreichungen: 56, version: '1.3', status: 'aktiv' },
    { id: 'f-3', name: 'Systemkonfiguration SMTP', typ: 'konfiguration', felder: 8, einreichungen: 3, version: '1.0', status: 'aktiv' },
    { id: 'f-4', name: 'Mitarbeiterzufriedenheit 2026', typ: 'umfrage', felder: 15, einreichungen: 42, version: '1.0', status: 'aktiv' },
    { id: 'f-5', name: 'Leistungserbringer-Registrierung', typ: 'antrag', felder: 32, einreichungen: 34, version: '3.0', status: 'aktiv' },
    { id: 'f-6', name: 'Feedback-Formular (Entwurf)', typ: 'umfrage', felder: 10, einreichungen: 0, version: '0.1', status: 'entwurf' },
  ]);

  readonly activeCount = computed(() => this.forms().filter(f => f.status === 'aktiv').length);
  readonly draftCount = computed(() => this.forms().filter(f => f.status === 'entwurf').length);
  readonly totalSubmissions = computed(() => this.forms().reduce((sum, f) => sum + f.einreichungen, 0));

  readonly filteredForms = computed(() => {
    if (!this.searchQuery) return this.forms();
    const q = this.searchQuery.toLowerCase();
    return this.forms().filter(f => f.name.toLowerCase().includes(q));
  });

  getTypBadgeClass(typ: string): string {
    switch (typ) {
      case 'antrag': return 'bg-blue-100 text-blue-700';
      case 'erfassung': return 'bg-green-100 text-green-700';
      case 'konfiguration': return 'bg-orange-100 text-orange-700';
      case 'umfrage': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  getTypLabel(typ: string): string {
    switch (typ) {
      case 'antrag': return 'Antrag';
      case 'erfassung': return 'Erfassung';
      case 'konfiguration': return 'Konfiguration';
      case 'umfrage': return 'Umfrage';
      default: return typ;
    }
  }

  getTypIconBg(typ: string): string {
    switch (typ) {
      case 'antrag': return 'bg-blue-50';
      case 'erfassung': return 'bg-green-50';
      case 'konfiguration': return 'bg-orange-50';
      case 'umfrage': return 'bg-purple-50';
      default: return 'bg-gray-50';
    }
  }

  getTypIconColor(typ: string): string {
    switch (typ) {
      case 'antrag': return 'text-blue-500';
      case 'erfassung': return 'text-green-500';
      case 'konfiguration': return 'text-orange-500';
      case 'umfrage': return 'text-purple-500';
      default: return 'text-gray-500';
    }
  }
}
