import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortalRolle, Berechtigung, PortalUser } from '../../models/user.model';

@Component({
  selector: 'app-rollen-tab',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-3">
      @for (rolle of rollen; track rolle.id) {
        <div class="bg-white rounded-lg border border-gray-200 shadow-card overflow-hidden">
          <div
            class="flex items-center gap-4 px-4 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
            (click)="toggleRolle(rolle.id)"
          >
            <div class="w-1.5 h-10 rounded-full shrink-0" [style.background-color]="rolle.farbe"></div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <span class="font-medium text-gray-900">{{ rolle.name }}</span>
                @if (rolle.systemRolle) {
                  <span class="text-xs px-1.5 py-0.5 bg-primary/10 text-primary rounded font-medium">System</span>
                }
              </div>
              <p class="text-xs text-gray-500 mt-0.5">{{ rolle.beschreibung }}</p>
            </div>
            <div class="flex items-center gap-6 text-sm text-gray-500 shrink-0">
              <div class="text-center">
                <div class="font-semibold text-gray-900">{{ rolle.hierarchie }}</div>
                <div class="text-xs">Hierarchie</div>
              </div>
              <div class="text-center">
                <div class="font-semibold text-gray-900">{{ rolle.benutzerAnzahl }}</div>
                <div class="text-xs">Benutzer</div>
              </div>
              <div class="text-center">
                <div class="font-semibold text-gray-900">{{ rolle.berechtigungIds.length }}</div>
                <div class="text-xs">Berechtigungen</div>
              </div>
              <svg class="w-5 h-5 text-gray-400 transition-transform" [class.rotate-180]="expandedRollen.has(rolle.id)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </div>
          </div>

          @if (expandedRollen.has(rolle.id)) {
            <div class="border-t border-gray-200 px-6 py-4 bg-gray-50/50">
              <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Berechtigungen</h4>
              <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-4">
                @for (permId of rolle.berechtigungIds; track permId) {
                  @if (getBerechtigungById(permId); as perm) {
                    <div class="text-xs px-2.5 py-1.5 bg-white rounded border border-gray-200 flex items-center justify-between">
                      <span class="text-gray-700">{{ perm.label }}</span>
                      <span class="px-1.5 py-0.5 rounded text-[10px] font-medium"
                        [class]="typClass(perm.typ)">{{ perm.typ }}</span>
                    </div>
                  }
                }
              </div>
              <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Zugewiesene Benutzer</h4>
              <div class="flex flex-wrap gap-2">
                @for (user of getUsersByRolle(rolle.id); track user.id) {
                  <div class="flex items-center gap-2 text-xs bg-white rounded-full border border-gray-200 pl-1 pr-3 py-1">
                    <div class="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-semibold">
                      {{ user.initialen }}
                    </div>
                    {{ user.vorname }} {{ user.nachname }}
                  </div>
                }
                @if (getUsersByRolle(rolle.id).length === 0) {
                  <span class="text-xs text-gray-400 italic">Keine Benutzer zugewiesen</span>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class RollenTabComponent {
  @Input() rollen: PortalRolle[] = [];
  @Input() berechtigungen: Berechtigung[] = [];
  @Input() users: PortalUser[] = [];

  expandedRollen = new Set<string>();

  toggleRolle(id: string): void {
    if (this.expandedRollen.has(id)) {
      this.expandedRollen.delete(id);
    } else {
      this.expandedRollen.add(id);
    }
  }

  getBerechtigungById(id: string): Berechtigung | undefined {
    return this.berechtigungen.find(b => b.id === id);
  }

  getUsersByRolle(rolleId: string): PortalUser[] {
    return this.users.filter(u => u.rollenIds.includes(rolleId));
  }

  typClass(typ: string): string {
    switch (typ) {
      case 'lesen': return 'bg-primary/10 text-primary';
      case 'schreiben': return 'bg-success/10 text-success';
      case 'loeschen': return 'bg-error/10 text-error';
      case 'admin': return 'bg-warning/10 text-warning';
      default: return 'bg-gray-100 text-gray-500';
    }
  }
}
