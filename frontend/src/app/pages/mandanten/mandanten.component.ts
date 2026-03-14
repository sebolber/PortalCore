import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Tenant } from '../../models/tenant.model';

@Component({
  selector: 'app-mandanten',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-4 sm:p-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 class="text-xl sm:text-2xl font-bold text-gray-900" style="font-family: 'Fira Sans Condensed', sans-serif">
            Mandantenverwaltung
          </h1>
          <p class="text-sm text-gray-500 mt-1">Organisationseinheiten verwalten</p>
        </div>
        <button *ngIf="authService.darfSchreiben('mandanten')"
                (click)="openDialog()"
                class="px-4 py-2 bg-[#006EC7] text-white rounded-lg hover:bg-[#005ba3] transition-colors shrink-0">
          Neuer Mandant
        </button>
      </div>

      <!-- Suchfeld -->
      <div class="mb-4">
        <input type="text" [(ngModel)]="searchTerm" placeholder="Mandanten durchsuchen..."
               class="w-full sm:w-80 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006EC7] focus:border-transparent outline-none" />
      </div>

      <!-- Fehlermeldung -->
      <div *ngIf="deleteError()" class="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center justify-between">
        <span>{{ deleteError() }}</span>
        <button (click)="deleteError.set('')" class="text-red-400 hover:text-red-600 ml-4">&times;</button>
      </div>

      <!-- Mandanten-Karten -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div *ngFor="let t of filteredTenants()"
             class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-lg bg-[#006EC7] flex items-center justify-center text-white font-bold">
                {{ t.shortName }}
              </div>
              <div>
                <h3 class="font-semibold text-gray-900">{{ t.name }}</h3>
                <p class="text-sm text-gray-500">{{ t.id }}</p>
              </div>
            </div>
            <span [class]="t.aktiv !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
                  class="px-2 py-0.5 text-xs font-medium rounded-full">
              {{ t.aktiv !== false ? 'Aktiv' : 'Inaktiv' }}
            </span>
          </div>

          <!-- Adresse -->
          <div *ngIf="t.strasse" class="text-sm text-gray-600 mb-3">
            <div class="flex items-start gap-2">
              <svg class="w-4 h-4 mt-0.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              <span>{{ t.strasse }} {{ t.hausnummer }}, {{ t.plz }} {{ t.ort }}</span>
            </div>
          </div>

          <!-- Kontakt -->
          <div class="space-y-1 text-sm text-gray-600">
            <div *ngIf="t.telefon" class="flex items-center gap-2">
              <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
              </svg>
              {{ t.telefon }}
            </div>
            <div *ngIf="t.email" class="flex items-center gap-2">
              <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
              {{ t.email }}
            </div>
            <div *ngIf="t.ansprechpartner" class="flex items-center gap-2">
              <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              {{ t.ansprechpartner }}
            </div>
          </div>

          <!-- Aktionen -->
          <div *ngIf="authService.darfSchreiben('mandanten')" class="flex gap-2 mt-4 pt-4 border-t border-gray-100">
            <button (click)="openDialog(t)" class="px-3 py-1.5 text-sm text-[#006EC7] hover:bg-blue-50 rounded-lg transition-colors">
              Bearbeiten
            </button>
            <button (click)="deleteTenant(t)" class="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
              Loeschen
            </button>
          </div>
        </div>
      </div>

      <!-- Dialog -->
      <div *ngIf="showDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
          <h2 class="text-lg font-bold text-gray-900 mb-4">
            {{ editingTenant ? 'Mandant bearbeiten' : 'Neuer Mandant' }}
          </h2>
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input type="text" [(ngModel)]="form.name"
                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006EC7] outline-none" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Kurzname *</label>
                <input type="text" [(ngModel)]="form.shortName"
                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006EC7] outline-none" />
              </div>
            </div>
            <hr class="border-gray-200" />
            <h3 class="text-sm font-semibold text-gray-700">Anschrift</h3>
            <div class="grid grid-cols-3 gap-4">
              <div class="col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Strasse</label>
                <input type="text" [(ngModel)]="form.strasse"
                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006EC7] outline-none" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Hausnr.</label>
                <input type="text" [(ngModel)]="form.hausnummer"
                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006EC7] outline-none" />
              </div>
            </div>
            <div class="grid grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">PLZ</label>
                <input type="text" [(ngModel)]="form.plz"
                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006EC7] outline-none" />
              </div>
              <div class="col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Ort</label>
                <input type="text" [(ngModel)]="form.ort"
                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006EC7] outline-none" />
              </div>
            </div>
            <hr class="border-gray-200" />
            <h3 class="text-sm font-semibold text-gray-700">Kontaktdaten</h3>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                <input type="text" [(ngModel)]="form.telefon"
                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006EC7] outline-none" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">E-Mail</label>
                <input type="email" [(ngModel)]="form.email"
                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006EC7] outline-none" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Webseite</label>
                <input type="text" [(ngModel)]="form.webseite"
                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006EC7] outline-none" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Ansprechpartner</label>
                <input type="text" [(ngModel)]="form.ansprechpartner"
                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006EC7] outline-none" />
              </div>
            </div>
          </div>
          <div class="flex justify-end gap-2 mt-6">
            <button (click)="showDialog = false" class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Abbrechen</button>
            <button (click)="saveTenant()" [disabled]="!form.name || !form.shortName"
                    class="px-4 py-2 bg-[#006EC7] text-white rounded-lg hover:bg-[#005ba3] disabled:opacity-50">Speichern</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class MandantenComponent implements OnInit {
  tenants = signal<Tenant[]>([]);
  searchTerm = '';
  showDialog = false;
  editingTenant: Tenant | null = null;
  form: Partial<Tenant> = {};

  constructor(private http: HttpClient, public authService: AuthService) {}

  ngOnInit(): void {
    this.loadTenants();
  }

  loadTenants(): void {
    this.http.get<Tenant[]>(`${API_URL}/tenants`).subscribe({
      next: (data) => this.tenants.set(data)
    });
  }

  filteredTenants(): Tenant[] {
    if (!this.searchTerm) return this.tenants();
    const term = this.searchTerm.toLowerCase();
    return this.tenants().filter(t =>
      t.name.toLowerCase().includes(term) || t.shortName.toLowerCase().includes(term) ||
      t.ort?.toLowerCase().includes(term)
    );
  }

  openDialog(tenant?: Tenant): void {
    this.editingTenant = tenant || null;
    this.form = tenant ? { ...tenant } : { land: 'Deutschland', aktiv: true };
    this.showDialog = true;
  }

  saveTenant(): void {
    if (this.editingTenant) {
      this.http.put(`${API_URL}/tenants/${this.editingTenant.id}`, this.form).subscribe({
        next: () => { this.showDialog = false; this.loadTenants(); }
      });
    } else {
      const id = 't-' + (this.form.shortName || 'new').toLowerCase().replace(/\s+/g, '-');
      this.http.post(`${API_URL}/tenants`, { ...this.form, id }).subscribe({
        next: () => { this.showDialog = false; this.loadTenants(); }
      });
    }
  }

  deleteError = signal<string>('');

  deleteTenant(t: Tenant): void {
    if (confirm('Mandant "' + t.name + '" wirklich loeschen?')) {
      this.deleteError.set('');
      this.http.delete(`${API_URL}/tenants/${t.id}`).subscribe({
        next: () => this.loadTenants(),
        error: (err) => {
          this.deleteError.set(err.error?.message || 'Mandant konnte nicht geloescht werden.');
        }
      });
    }
  }
}
