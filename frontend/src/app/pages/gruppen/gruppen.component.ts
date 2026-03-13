import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GruppenService } from '../../services/gruppen.service';
import { AuthService } from '../../services/auth.service';
import { Gruppe, GruppenBerechtigung } from '../../models/user.model';

@Component({
  selector: 'app-gruppen',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-4 sm:p-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 class="text-xl sm:text-2xl font-bold text-gray-900" style="font-family: 'Fira Sans Condensed', sans-serif">
            Gruppenverwaltung
          </h1>
          <p class="text-sm text-gray-500 mt-1">Berechtigungsgruppen und Use-Case-Rechte verwalten</p>
        </div>
        <button *ngIf="authService.darfSchreiben('gruppen')"
                (click)="showCreateDialog = true"
                class="px-4 py-2 bg-[#006EC7] text-white rounded-lg hover:bg-[#005ba3] transition-colors shrink-0">
          Neue Gruppe
        </button>
      </div>

      <!-- Suchfeld -->
      <div class="mb-4">
        <input type="text" [(ngModel)]="searchTerm" placeholder="Gruppen durchsuchen..."
               class="w-full sm:w-80 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006EC7] focus:border-transparent outline-none" />
      </div>

      <!-- Gruppen Liste -->
      <div class="space-y-4">
        <div *ngFor="let gruppe of filteredGruppen()"
             class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <!-- Gruppen-Header -->
          <div class="p-4 sm:p-6 cursor-pointer" (click)="toggleGruppe(gruppe.id)">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                     [style.background-color]="gruppe.farbe || '#006EC7'">
                  {{ gruppe.name.substring(0, 2).toUpperCase() }}
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900">{{ gruppe.name }}</h3>
                  <p class="text-sm text-gray-500">{{ gruppe.beschreibung }}</p>
                </div>
                <span *ngIf="gruppe.systemGruppe"
                      class="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600">System</span>
              </div>
              <div class="flex items-center gap-3">
                <span class="text-sm text-gray-500">{{ gruppe.berechtigungen?.length || 0 }} Use Cases</span>
                <svg class="w-5 h-5 text-gray-400 transition-transform" [class.rotate-180]="expandedGruppe === gruppe.id"
                     fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
                </svg>
              </div>
            </div>
          </div>

          <!-- Berechtigungen (aufgeklappt) -->
          <div *ngIf="expandedGruppe === gruppe.id" class="border-t border-gray-200">
            <div class="overflow-x-auto">
              <table class="w-full text-sm min-w-[600px]">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-3 text-left font-medium text-gray-500">Use Case</th>
                    <th class="px-4 py-3 text-center font-medium text-gray-500 w-20">Anzeigen</th>
                    <th class="px-4 py-3 text-center font-medium text-gray-500 w-20">Lesen</th>
                    <th class="px-4 py-3 text-center font-medium text-gray-500 w-20">Schreiben</th>
                    <th class="px-4 py-3 text-center font-medium text-gray-500 w-20">Loeschen</th>
                    <th *ngIf="authService.darfSchreiben('gruppen')" class="px-4 py-3 w-16"></th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr *ngFor="let b of gruppe.berechtigungen" class="hover:bg-gray-50">
                    <td class="px-4 py-3">
                      <div class="font-medium text-gray-900">{{ b.useCaseLabel }}</div>
                      <div class="text-xs text-gray-400">
                        {{ b.useCase }}
                        <span *ngIf="b.appId && b.appId !== 'portal'"
                              class="ml-1 px-1.5 py-0.5 bg-purple-50 text-purple-600 rounded text-[10px] font-medium">
                          App: {{ b.appId }}
                        </span>
                      </div>
                    </td>
                    <td class="px-4 py-3 text-center">
                      <input type="checkbox" [checked]="b.anzeigen"
                             (change)="togglePermission(gruppe, b, 'anzeigen')"
                             [disabled]="!authService.darfSchreiben('gruppen') || gruppe.systemGruppe"
                             class="rounded border-gray-300 text-[#006EC7] focus:ring-[#006EC7]" />
                    </td>
                    <td class="px-4 py-3 text-center">
                      <input type="checkbox" [checked]="b.lesen"
                             (change)="togglePermission(gruppe, b, 'lesen')"
                             [disabled]="!authService.darfSchreiben('gruppen') || gruppe.systemGruppe"
                             class="rounded border-gray-300 text-[#006EC7] focus:ring-[#006EC7]" />
                    </td>
                    <td class="px-4 py-3 text-center">
                      <input type="checkbox" [checked]="b.schreiben"
                             (change)="togglePermission(gruppe, b, 'schreiben')"
                             [disabled]="!authService.darfSchreiben('gruppen') || gruppe.systemGruppe"
                             class="rounded border-gray-300 text-[#006EC7] focus:ring-[#006EC7]" />
                    </td>
                    <td class="px-4 py-3 text-center">
                      <input type="checkbox" [checked]="b.loeschen"
                             (change)="togglePermission(gruppe, b, 'loeschen')"
                             [disabled]="!authService.darfSchreiben('gruppen') || gruppe.systemGruppe"
                             class="rounded border-gray-300 text-[#006EC7] focus:ring-[#006EC7]" />
                    </td>
                    <td *ngIf="authService.darfSchreiben('gruppen')" class="px-4 py-3 text-center">
                      <button *ngIf="!gruppe.systemGruppe" (click)="deleteBerechtigung(gruppe, b)"
                              class="text-red-400 hover:text-red-600">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Use Case hinzufuegen -->
            <div *ngIf="authService.darfSchreiben('gruppen') && !gruppe.systemGruppe" class="p-4 bg-gray-50 border-t border-gray-200">
              <div class="flex flex-col sm:flex-row gap-2">
                <input type="text" [(ngModel)]="newUseCaseKey" placeholder="use-case-key"
                       class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#006EC7] outline-none" />
                <input type="text" [(ngModel)]="newUseCaseLabel" placeholder="Anzeigename"
                       class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#006EC7] outline-none" />
                <button (click)="addBerechtigung(gruppe)"
                        [disabled]="!newUseCaseKey || !newUseCaseLabel"
                        class="px-4 py-2 bg-[#006EC7] text-white rounded-lg text-sm hover:bg-[#005ba3] disabled:opacity-50 shrink-0">
                  Hinzufuegen
                </button>
              </div>
            </div>

            <!-- Zugeordnete Benutzer -->
            <div class="p-4 border-t border-gray-200">
              <h4 class="text-sm font-semibold text-gray-700 mb-2">Zugeordnete Benutzer ({{ gruppe.benutzer?.length || 0 }})</h4>
              <div class="flex flex-wrap gap-2">
                <span *ngFor="let user of gruppe.benutzer"
                      class="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                  {{ user.vorname }} {{ user.nachname }}
                  <button *ngIf="authService.darfSchreiben('gruppen')"
                          (click)="removeUserFromGroup(gruppe, user.id)"
                          class="ml-1 text-blue-400 hover:text-blue-600">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </span>
                <span *ngIf="!gruppe.benutzer?.length" class="text-sm text-gray-400">Keine Benutzer zugeordnet</span>
              </div>
            </div>

            <!-- Aktionen -->
            <div *ngIf="authService.darfSchreiben('gruppen') && !gruppe.systemGruppe"
                 class="p-4 border-t border-gray-200 flex justify-end gap-2">
              <button (click)="deleteGruppe(gruppe)" class="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm transition-colors">
                Gruppe loeschen
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Neue Gruppe Dialog -->
      <div *ngIf="showCreateDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
          <h2 class="text-lg font-bold text-gray-900 mb-4">Neue Gruppe erstellen</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input type="text" [(ngModel)]="newGruppe.name"
                     class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006EC7] outline-none" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
              <textarea [(ngModel)]="newGruppe.beschreibung" rows="3"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006EC7] outline-none"></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Farbe</label>
              <input type="color" [(ngModel)]="newGruppe.farbe" class="w-12 h-8 rounded cursor-pointer" />
            </div>
          </div>
          <div class="flex justify-end gap-2 mt-6">
            <button (click)="showCreateDialog = false" class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Abbrechen</button>
            <button (click)="createGruppe()" [disabled]="!newGruppe.name"
                    class="px-4 py-2 bg-[#006EC7] text-white rounded-lg hover:bg-[#005ba3] disabled:opacity-50">Erstellen</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class GruppenComponent implements OnInit {
  gruppen = signal<Gruppe[]>([]);
  expandedGruppe: string | null = null;
  searchTerm = '';
  showCreateDialog = false;
  newGruppe = { name: '', beschreibung: '', farbe: '#006EC7' };
  newUseCaseKey = '';
  newUseCaseLabel = '';

  constructor(
    private gruppenService: GruppenService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadGruppen();
  }

  loadGruppen(): void {
    this.gruppenService.getAll().subscribe({
      next: (data) => this.gruppen.set(data),
      error: () => {}
    });
  }

  filteredGruppen(): Gruppe[] {
    if (!this.searchTerm) return this.gruppen();
    const term = this.searchTerm.toLowerCase();
    return this.gruppen().filter(g =>
      g.name.toLowerCase().includes(term) || g.beschreibung?.toLowerCase().includes(term)
    );
  }

  toggleGruppe(id: string): void {
    this.expandedGruppe = this.expandedGruppe === id ? null : id;
  }

  createGruppe(): void {
    this.gruppenService.create(this.newGruppe).subscribe({
      next: () => {
        this.showCreateDialog = false;
        this.newGruppe = { name: '', beschreibung: '', farbe: '#006EC7' };
        this.loadGruppen();
      }
    });
  }

  deleteGruppe(gruppe: Gruppe): void {
    if (confirm('Gruppe "' + gruppe.name + '" wirklich loeschen?')) {
      this.gruppenService.delete(gruppe.id).subscribe({ next: () => this.loadGruppen() });
    }
  }

  togglePermission(gruppe: Gruppe, b: GruppenBerechtigung, field: 'anzeigen' | 'lesen' | 'schreiben' | 'loeschen'): void {
    const updated = { ...b, [field]: !b[field] };
    this.gruppenService.updateBerechtigung(gruppe.id, b.id, updated).subscribe({
      next: () => this.loadGruppen()
    });
  }

  addBerechtigung(gruppe: Gruppe): void {
    this.gruppenService.addBerechtigung(gruppe.id, {
      useCase: this.newUseCaseKey,
      useCaseLabel: this.newUseCaseLabel,
      anzeigen: true,
      lesen: true,
      schreiben: false,
      loeschen: false
    }).subscribe({
      next: () => {
        this.newUseCaseKey = '';
        this.newUseCaseLabel = '';
        this.loadGruppen();
      }
    });
  }

  deleteBerechtigung(gruppe: Gruppe, b: GruppenBerechtigung): void {
    this.gruppenService.deleteBerechtigung(gruppe.id, b.id).subscribe({
      next: () => this.loadGruppen()
    });
  }

  removeUserFromGroup(gruppe: Gruppe, userId: string): void {
    this.gruppenService.removeUser(gruppe.id, userId).subscribe({
      next: () => this.loadGruppen()
    });
  }
}
