import { Component, computed, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Berechtigung } from '../../models/user.model';

interface PermissionGroup {
  appName: string;
  groups: { gruppe: string; permissions: Berechtigung[] }[];
}

@Component({
  selector: 'app-berechtigungen-tab',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="mb-4">
      <select
        [ngModel]="permAppFilter()"
        (ngModelChange)="permAppFilter.set($event)"
        class="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
      >
        <option value="">Alle Apps</option>
        @for (app of permAppNames(); track app) {
          <option [value]="app">{{ app }}</option>
        }
      </select>
    </div>

    @for (group of groupedPermissions(); track group.appName) {
      <div class="mb-6">
        <h3 class="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-primary"></span>
          {{ group.appName }}
        </h3>
        @for (subGroup of group.groups; track subGroup.gruppe) {
          <div class="ml-4 mb-3">
            <h4 class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">{{ subGroup.gruppe }}</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              @for (perm of subGroup.permissions; track perm.id) {
                <div class="bg-white rounded-lg border border-gray-200 p-3 text-sm">
                  <div class="flex items-center justify-between mb-1">
                    <code class="text-xs font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{{ perm.key }}</code>
                    <span class="px-1.5 py-0.5 rounded text-[10px] font-medium" [class]="typClass(perm.typ)">{{ perm.typ }}</span>
                  </div>
                  <div class="text-gray-900 font-medium">{{ perm.label }}</div>
                </div>
              }
            </div>
          </div>
        }
      </div>
    }
  `,
})
export class BerechtigungenTabComponent {
  @Input() berechtigungen: Berechtigung[] = [];

  readonly permAppFilter = signal('');

  readonly permAppNames = computed(() => {
    const names = new Set(this.berechtigungen.map(b => b.appName));
    return Array.from(names);
  });

  readonly groupedPermissions = computed((): PermissionGroup[] => {
    let perms = this.berechtigungen;
    const appFilter = this.permAppFilter();
    if (appFilter) {
      perms = perms.filter(p => p.appName === appFilter);
    }
    const byApp = new Map<string, Map<string, Berechtigung[]>>();
    for (const p of perms) {
      if (!byApp.has(p.appName)) byApp.set(p.appName, new Map());
      const appMap = byApp.get(p.appName)!;
      if (!appMap.has(p.gruppe)) appMap.set(p.gruppe, []);
      appMap.get(p.gruppe)!.push(p);
    }
    return Array.from(byApp.entries()).map(([appName, groups]) => ({
      appName,
      groups: Array.from(groups.entries()).map(([gruppe, permissions]) => ({ gruppe, permissions })),
    }));
  });

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
