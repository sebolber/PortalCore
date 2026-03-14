import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PortalParameter, ParameterAuditLog } from '../../models/parameter.model';
import { ParameterService } from '../../services/parameter.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-parameter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-[1400px] mx-auto">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-xl sm:text-2xl font-condensed font-semibold text-gray-900">Parameterverwaltung</h1>
        <p class="text-sm text-gray-500 mt-1">Systemparameter und Konfigurationen verwalten</p>
      </div>

      <!-- Tabs -->
      <div class="flex gap-1 mb-6 border-b border-gray-200">
        <button
          (click)="activeTab.set('parameter')"
          class="px-4 py-2.5 text-sm font-medium transition-colors relative"
          [class]="activeTab() === 'parameter'
            ? 'text-primary border-b-2 border-primary'
            : 'text-gray-500 hover:text-gray-700'"
        >
          Parameter
          <span class="ml-1.5 text-xs px-1.5 py-0.5 rounded-full"
            [class]="activeTab() === 'parameter' ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-500'">
            {{ parameters().length }}
          </span>
        </button>
        <button
          (click)="switchToChangelog()"
          class="px-4 py-2.5 text-sm font-medium transition-colors relative"
          [class]="activeTab() === 'changelog'
            ? 'text-primary border-b-2 border-primary'
            : 'text-gray-500 hover:text-gray-700'"
        >
          Aenderungsprotokoll
          <span class="ml-1.5 text-xs px-1.5 py-0.5 rounded-full"
            [class]="activeTab() === 'changelog' ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-500'">
            {{ auditLog().length }}
          </span>
        </button>
      </div>

      <!-- Tab 1: Parameter -->
      @if (activeTab() === 'parameter') {
        <!-- Stats Cards (Schnellfilter) -->
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          @for (stat of paramStats(); track stat.label) {
            <button
              (click)="applyQuickFilter(stat.filterKey)"
              [class]="quickFilterCardClass(stat.filterKey)"
            >
              <div class="text-2xl font-semibold" [style.color]="stat.color">{{ stat.value }}</div>
              <div class="text-xs mt-1" [class]="activeQuickFilter() === stat.filterKey ? 'text-gray-700 font-medium' : 'text-gray-500'">{{ stat.label }}</div>
            </button>
          }
        </div>

        <!-- Filters -->
        <div class="flex flex-wrap gap-3 mb-4">
          <select
            [ngModel]="appFilter()"
            (ngModelChange)="appFilter.set($event); activeQuickFilter.set('')"
            class="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">Alle Apps</option>
            @for (app of appNames(); track app) {
              <option [value]="app">{{ app }}</option>
            }
          </select>

          <select
            [ngModel]="groupFilter()"
            (ngModelChange)="groupFilter.set($event); activeQuickFilter.set('')"
            class="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">Alle Gruppen</option>
            @for (group of groupNames(); track group) {
              <option [value]="group">{{ group }}</option>
            }
          </select>

          <select
            [ngModel]="scopeFilter()"
            (ngModelChange)="scopeFilter.set($event); activeQuickFilter.set('')"
            class="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">Alle (Global + Mandant)</option>
            <option value="global">Nur globale Parameter</option>
            <option value="tenant">Nur mandantenspezifische</option>
          </select>

          <input
            type="text"
            placeholder="Suche nach Schluessel, Label oder Beschreibung..."
            [ngModel]="searchFilter()"
            (ngModelChange)="searchFilter.set($event); activeQuickFilter.set('')"
            class="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-72"
          />

          <select
            [ngModel]="booleanFilter()"
            (ngModelChange)="booleanFilter.set($event); activeQuickFilter.set('')"
            class="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">Alle Flags</option>
            <option value="hotReload">Hot-Reload</option>
            <option value="sensitive">Sensibel</option>
            <option value="required">Pflichtfeld</option>
            <option value="adminOnly">Nur Admin</option>
          </select>
        </div>

        <!-- Error Message -->
        @if (errorMsg()) {
          <div class="mb-4 p-3 bg-error/10 text-error text-sm rounded-lg border border-error/20">
            {{ errorMsg() }}
            <button (click)="errorMsg.set('')" class="ml-2 font-bold">x</button>
          </div>
        }

        <!-- Parameter Table -->
        <div class="bg-white rounded-lg border border-gray-200 shadow-card overflow-hidden overflow-x-auto">
          <table class="w-full text-sm min-w-[1100px]">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-200">
                <th (click)="toggleSort('appName')" class="text-left px-4 py-3 font-medium text-gray-600 cursor-pointer hover:text-gray-900 select-none">
                  <span class="inline-flex items-center gap-1">App <span class="text-xs">{{ sortIndicator('appName') }}</span></span>
                </th>
                <th (click)="toggleSort('group')" class="text-left px-4 py-3 font-medium text-gray-600 cursor-pointer hover:text-gray-900 select-none">
                  <span class="inline-flex items-center gap-1">Gruppe <span class="text-xs">{{ sortIndicator('group') }}</span></span>
                </th>
                <th (click)="toggleSort('scope')" class="text-left px-4 py-3 font-medium text-gray-600 cursor-pointer hover:text-gray-900 select-none">
                  <span class="inline-flex items-center gap-1">Scope <span class="text-xs">{{ sortIndicator('scope') }}</span></span>
                </th>
                <th (click)="toggleSort('key')" class="text-left px-4 py-3 font-medium text-gray-600 cursor-pointer hover:text-gray-900 select-none">
                  <span class="inline-flex items-center gap-1">Schluessel / Label <span class="text-xs">{{ sortIndicator('key') }}</span></span>
                </th>
                <th (click)="toggleSort('value')" class="text-left px-4 py-3 font-medium text-gray-600 cursor-pointer hover:text-gray-900 select-none">
                  <span class="inline-flex items-center gap-1">Wert <span class="text-xs">{{ sortIndicator('value') }}</span></span>
                </th>
                <th (click)="toggleSort('flags')" class="text-left px-4 py-3 font-medium text-gray-600 cursor-pointer hover:text-gray-900 select-none">
                  <span class="inline-flex items-center gap-1">Flags <span class="text-xs">{{ sortIndicator('flags') }}</span></span>
                </th>
                <th class="text-left px-4 py-3 font-medium text-gray-600 w-24"></th>
              </tr>
            </thead>
            <tbody>
              @for (param of filteredParameters(); track param.id) {
                <tr class="border-b border-gray-100 hover:bg-gray-50 align-top">
                  <td class="px-4 py-3 text-xs text-gray-600">{{ param.appName }}</td>
                  <td class="px-4 py-3 text-xs text-gray-600">{{ param.group }}</td>
                  <td class="px-4 py-3">
                    @if (param.tenantId) {
                      <span class="text-xs px-1.5 py-0.5 rounded bg-purple-50 text-purple-600 font-medium" title="Mandantenspezifisch">Mandant: {{ param.tenantId }}</span>
                    } @else {
                      <span class="text-xs px-1.5 py-0.5 rounded bg-blue-50 text-blue-500 font-medium" title="Gilt fuer alle Mandanten">Global</span>
                    }
                  </td>
                  <td class="px-4 py-3">
                    <code class="text-xs font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{{ param.key }}</code>
                    <div class="text-sm font-medium text-gray-900 mt-0.5">{{ param.label }}</div>
                    @if (param.description) {
                      <div class="text-xs text-gray-400 mt-0.5">{{ param.description }}</div>
                    }
                  </td>
                  <td class="px-4 py-3">
                    @if (editingParam() === param.id) {
                      <div class="flex flex-col gap-2">
                        <div class="flex items-center gap-2">
                          @if (param.type === 'BOOLEAN') {
                            <select
                              [ngModel]="editValue()"
                              (ngModelChange)="editValue.set($event)"
                              class="px-2 py-1 text-sm border border-primary rounded bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                            >
                              <option value="true">true</option>
                              <option value="false">false</option>
                            </select>
                          } @else if (param.type === 'SELECT' && param.options) {
                            <select
                              [ngModel]="editValue()"
                              (ngModelChange)="editValue.set($event)"
                              class="px-2 py-1 text-sm border border-primary rounded bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                            >
                              @for (opt of splitOptions(param.options); track opt) {
                                <option [value]="opt">{{ opt }}</option>
                              }
                            </select>
                          } @else if (param.type === 'TEXTAREA') {
                            <textarea
                              [ngModel]="editValue()"
                              (ngModelChange)="editValue.set($event)"
                              class="px-2 py-1 text-sm border border-primary rounded bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 w-48"
                              rows="2"
                            ></textarea>
                          } @else {
                            <input
                              [type]="param.type === 'NUMBER' ? 'number' : param.type === 'PASSWORD' ? 'password' : param.type === 'EMAIL' ? 'email' : param.type === 'DATE' ? 'date' : 'text'"
                              [ngModel]="editValue()"
                              (ngModelChange)="editValue.set($event)"
                              class="px-2 py-1 text-sm border border-primary rounded bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 w-40"
                            />
                          }
                          @if (param.unit) {
                            <span class="text-xs text-gray-400">{{ param.unit }}</span>
                          }
                        </div>
                        <input
                          type="text"
                          placeholder="Grund der Aenderung..."
                          [ngModel]="editGrund()"
                          (ngModelChange)="editGrund.set($event)"
                          class="px-2 py-1 text-xs border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 w-full"
                        />
                        <div class="flex gap-1">
                          <button (click)="saveEdit(param)" [disabled]="saving()" class="px-2 py-1 text-xs bg-primary text-white rounded hover:bg-primary-dark transition-colors disabled:opacity-50">Speichern</button>
                          <button (click)="resetParam(param)" [disabled]="saving()" class="px-2 py-1 text-xs bg-warning/10 text-warning rounded hover:bg-warning/20 transition-colors disabled:opacity-50" title="Auf Standardwert zuruecksetzen">Reset</button>
                          <button (click)="cancelEdit()" class="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors">Abbrechen</button>
                        </div>
                      </div>
                    } @else {
                      <div class="flex items-center gap-2">
                        @if (param.sensitive && !revealedSensitive().has(param.id)) {
                          <span class="font-mono text-sm text-gray-400 tracking-widest">********</span>
                          <button (click)="toggleSensitive(param.id)" class="text-xs text-primary hover:underline">Anzeigen</button>
                        } @else {
                          <span class="font-mono text-sm text-gray-900 bg-gray-50 px-2 py-0.5 rounded break-all">{{ param.value }}</span>
                          @if (param.sensitive) {
                            <button (click)="toggleSensitive(param.id)" class="text-xs text-primary hover:underline">Verbergen</button>
                          }
                        }
                      </div>
                      @if (param.lastModifiedBy) {
                        <div class="text-[10px] text-gray-400 mt-1">
                          {{ param.lastModified | date:'dd.MM.yyyy HH:mm' }} von {{ param.lastModifiedBy }}
                        </div>
                      }
                    }
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex flex-wrap gap-1">
                      @if (param.hotReload) {
                        <span class="text-xs px-1.5 py-0.5 rounded bg-warning/10 text-warning font-medium">Hot</span>
                      }
                      @if (param.required) {
                        <span class="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">Pflicht</span>
                      }
                      @if (param.sensitive) {
                        <span class="text-xs px-1.5 py-0.5 rounded bg-error/10 text-error font-medium">Sensibel</span>
                      }
                      @if (param.adminOnly) {
                        <span class="text-xs px-1.5 py-0.5 rounded bg-red-50 text-red-600 font-medium">Admin</span>
                      }
                    </div>
                  </td>
                  <td class="px-4 py-3">
                    @if (editingParam() !== param.id && (!param.adminOnly || authService.isSuperAdmin())) {
                      <button (click)="startEdit(param)" class="text-xs text-primary hover:underline">Bearbeiten</button>
                    }
                  </td>
                </tr>
              }
              @if (filteredParameters().length === 0 && !loading()) {
                <tr><td colspan="7" class="px-4 py-12 text-center text-gray-400">Keine Parameter gefunden.</td></tr>
              }
              @if (loading()) {
                <tr><td colspan="7" class="px-4 py-12 text-center text-gray-400">Lade Parameter...</td></tr>
              }
            </tbody>
          </table>
        </div>

        <div class="mt-2 text-xs text-gray-400">
          {{ filteredParameters().length }} von {{ parameters().length }} Parametern
        </div>
      }

      <!-- Tab 2: Aenderungsprotokoll -->
      @if (activeTab() === 'changelog') {
        <!-- Audit Log Filters -->
        <div class="flex flex-wrap gap-3 mb-4">
          <select
            [ngModel]="auditAppFilter()"
            (ngModelChange)="auditAppFilter.set($event); loadAuditLog()"
            class="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">Alle Apps</option>
            @for (app of appNames(); track app) {
              <option [value]="app">{{ app }}</option>
            }
          </select>
        </div>

        <div class="bg-white rounded-lg border border-gray-200 shadow-card overflow-hidden overflow-x-auto">
          <table class="w-full text-sm min-w-[700px]">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-200">
                <th class="text-left px-4 py-3 font-medium text-gray-600">Zeitpunkt</th>
                <th class="text-left px-4 py-3 font-medium text-gray-600">Parameter</th>
                <th class="text-left px-4 py-3 font-medium text-gray-600">App</th>
                <th class="text-left px-4 py-3 font-medium text-gray-600">Alter Wert</th>
                <th class="text-left px-4 py-3 font-medium text-gray-600">Neuer Wert</th>
                <th class="text-left px-4 py-3 font-medium text-gray-600">Benutzer</th>
                <th class="text-left px-4 py-3 font-medium text-gray-600">Grund</th>
              </tr>
            </thead>
            <tbody>
              @for (entry of auditLog(); track entry.id) {
                <tr class="border-b border-gray-100 hover:bg-gray-50">
                  <td class="px-4 py-3 text-gray-500 text-xs font-mono">{{ entry.geaendertAm | date:'dd.MM.yyyy HH:mm' }}</td>
                  <td class="px-4 py-3">
                    <code class="text-xs font-mono text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded">{{ entry.paramKey }}</code>
                  </td>
                  <td class="px-4 py-3 text-gray-600 text-xs">{{ entry.appName }}</td>
                  <td class="px-4 py-3">
                    <span class="font-mono text-xs text-error bg-error/5 px-1.5 py-0.5 rounded">{{ entry.alterWert }}</span>
                  </td>
                  <td class="px-4 py-3">
                    <span class="font-mono text-xs text-success bg-success/5 px-1.5 py-0.5 rounded">{{ entry.neuerWert }}</span>
                  </td>
                  <td class="px-4 py-3 text-gray-600 text-xs">{{ entry.geaendertVon }}</td>
                  <td class="px-4 py-3 text-gray-500 text-xs">{{ entry.grund }}</td>
                </tr>
              }
              @if (auditLog().length === 0 && !loadingAudit()) {
                <tr><td colspan="7" class="px-4 py-8 text-center text-gray-400">Keine Aenderungen vorhanden.</td></tr>
              }
              @if (loadingAudit()) {
                <tr><td colspan="7" class="px-4 py-8 text-center text-gray-400">Lade Aenderungsprotokoll...</td></tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
})
export class ParameterComponent implements OnInit {
  readonly activeTab = signal<'parameter' | 'changelog'>('parameter');
  readonly appFilter = signal('');
  readonly searchFilter = signal('');
  readonly scopeFilter = signal('');
  readonly auditAppFilter = signal('');
  readonly groupFilter = signal('');
  readonly booleanFilter = signal('');
  readonly activeQuickFilter = signal<string>('');
  readonly sortColumn = signal<string>('appName');
  readonly sortDirection = signal<'asc' | 'desc'>('asc');
  readonly editingParam = signal<string | null>(null);
  readonly editValue = signal('');
  readonly editGrund = signal('');
  readonly revealedSensitive = signal<Set<string>>(new Set());
  readonly parameters = signal<PortalParameter[]>([]);
  readonly auditLog = signal<ParameterAuditLog[]>([]);
  readonly loading = signal(false);
  readonly loadingAudit = signal(false);
  readonly saving = signal(false);
  readonly errorMsg = signal('');

  constructor(
    private parameterService: ParameterService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadParameters();
  }

  readonly paramStats = computed(() => {
    const params = this.parameters();
    const apps = new Set(params.map(p => p.appName));
    const groups = new Set(params.map(p => p.group));
    const hotReload = params.filter(p => p.hotReload).length;
    const sensitive = params.filter(p => p.sensitive).length;
    return [
      { label: 'Total', value: params.length, color: '#006EC7', filterKey: 'total', ringClass: 'primary/20', bgClass: 'primary/5' },
      { label: 'Apps', value: apps.size, color: '#461EBE', filterKey: 'apps', ringClass: 'accent-violet/20', bgClass: 'accent-violet/5' },
      { label: 'Gruppen', value: groups.size, color: '#28DCAA', filterKey: 'groups', ringClass: 'accent-turquoise/20', bgClass: 'accent-turquoise/5' },
      { label: 'Aenderungen', value: this.auditLog().length, color: '#FF9868', filterKey: 'changes', ringClass: 'accent-orange/20', bgClass: 'accent-orange/5' },
      { label: 'Hot-Reload', value: hotReload, color: '#FFC107', filterKey: 'hotReload', ringClass: 'warning/20', bgClass: 'warning/5' },
      { label: 'Sensibel', value: sensitive, color: '#CC3333', filterKey: 'sensitive', ringClass: 'error/20', bgClass: 'error/5' },
    ];
  });

  readonly appNames = computed(() => {
    const names = new Set(this.parameters().map(p => p.appName));
    return Array.from(names).sort();
  });

  readonly groupNames = computed(() => {
    let params = this.parameters();
    const appF = this.appFilter();
    if (appF) params = params.filter(p => p.appName === appF);
    const names = new Set(params.map(p => p.group));
    return Array.from(names).sort();
  });

  readonly filteredParameters = computed(() => {
    let params = this.parameters();
    const appF = this.appFilter();
    const groupF = this.groupFilter();
    const search = this.searchFilter().toLowerCase();
    const scopeF = this.scopeFilter();
    const boolF = this.booleanFilter();

    if (appF) params = params.filter(p => p.appName === appF);
    if (groupF) params = params.filter(p => p.group === groupF);
    if (scopeF === 'global') params = params.filter(p => !p.tenantId);
    if (scopeF === 'tenant') params = params.filter(p => !!p.tenantId);
    if (boolF === 'hotReload') params = params.filter(p => p.hotReload);
    if (boolF === 'sensitive') params = params.filter(p => p.sensitive);
    if (boolF === 'required') params = params.filter(p => p.required);
    if (boolF === 'adminOnly') params = params.filter(p => p.adminOnly);
    if (search) {
      params = params.filter(p =>
        p.key.toLowerCase().includes(search) ||
        p.label.toLowerCase().includes(search) ||
        (p.description && p.description.toLowerCase().includes(search)) ||
        p.appName.toLowerCase().includes(search) ||
        p.group.toLowerCase().includes(search) ||
        p.value.toLowerCase().includes(search)
      );
    }

    // Sortierung
    const col = this.sortColumn();
    const dir = this.sortDirection() === 'asc' ? 1 : -1;
    params = [...params].sort((a, b) => {
      const valA = this.getSortValue(a, col);
      const valB = this.getSortValue(b, col);
      return valA.localeCompare(valB) * dir;
    });

    return params;
  });

  quickFilterCardClass(filterKey: string): string {
    const base = 'bg-white rounded-lg border-2 p-4 shadow-card text-left transition-all cursor-pointer hover:shadow-md';
    if (this.activeQuickFilter() !== filterKey) {
      return base + ' border-gray-200 hover:border-gray-300';
    }
    const activeMap: Record<string, string> = {
      total: 'border-primary ring-2 ring-primary/20 bg-primary/5',
      apps: 'border-accent-violet ring-2 ring-accent-violet/20 bg-accent-violet/5',
      groups: 'border-accent-turquoise ring-2 ring-accent-turquoise/20 bg-accent-turquoise/5',
      changes: 'border-accent-orange ring-2 ring-accent-orange/20 bg-accent-orange/5',
      hotReload: 'border-warning ring-2 ring-warning/20 bg-warning/5',
      sensitive: 'border-error ring-2 ring-error/20 bg-error/5',
    };
    return base + ' ' + (activeMap[filterKey] || 'border-gray-200');
  }

  toggleSort(column: string): void {
    if (this.sortColumn() === column) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
  }

  sortIndicator(column: string): string {
    if (this.sortColumn() !== column) return '';
    return this.sortDirection() === 'asc' ? '\u25B2' : '\u25BC';
  }

  private getSortValue(param: PortalParameter, column: string): string {
    switch (column) {
      case 'appName': return param.appName || '';
      case 'group': return param.group || '';
      case 'scope': return param.tenantId ? `1:${param.tenantId}` : '0:global';
      case 'key': return param.key || '';
      case 'value': return param.value || '';
      case 'flags':
        return [
          param.hotReload ? 'hot' : '',
          param.required ? 'pflicht' : '',
          param.sensitive ? 'sensibel' : '',
          param.adminOnly ? 'admin' : '',
        ].filter(Boolean).join(',') || 'zzz';
      default: return '';
    }
  }

  applyQuickFilter(filterKey: string): void {
    // Toggle: erneuter Klick auf gleiche Kachel hebt Filter auf
    if (this.activeQuickFilter() === filterKey) {
      this.activeQuickFilter.set('');
      this.clearAllFilters();
      return;
    }

    this.activeQuickFilter.set(filterKey);
    this.clearAllFilters();

    switch (filterKey) {
      case 'total':
        // Alle anzeigen (keine Filter)
        break;
      case 'apps':
        // Zeige alle - kein spezifischer Filter, nur Highlight
        break;
      case 'groups':
        // Zeige alle - kein spezifischer Filter, nur Highlight
        break;
      case 'changes':
        this.switchToChangelog();
        return;
      case 'hotReload':
        this.booleanFilter.set('hotReload');
        break;
      case 'sensitive':
        this.booleanFilter.set('sensitive');
        break;
    }
  }

  private clearAllFilters(): void {
    this.appFilter.set('');
    this.groupFilter.set('');
    this.scopeFilter.set('');
    this.booleanFilter.set('');
    this.searchFilter.set('');
  }

  loadParameters(): void {
    this.loading.set(true);
    this.parameterService.getAll().subscribe({
      next: (params) => {
        this.parameters.set(params);
        this.loading.set(false);
      },
      error: () => {
        this.errorMsg.set('Fehler beim Laden der Parameter.');
        this.loading.set(false);
      }
    });
  }

  loadAuditLog(): void {
    this.loadingAudit.set(true);
    const appId = this.auditAppFilter() || undefined;
    this.parameterService.getAuditLog(appId).subscribe({
      next: (log) => {
        this.auditLog.set(log);
        this.loadingAudit.set(false);
      },
      error: () => {
        this.loadingAudit.set(false);
      }
    });
  }

  switchToChangelog(): void {
    this.activeTab.set('changelog');
    if (this.auditLog().length === 0) {
      this.loadAuditLog();
    }
  }

  startEdit(param: PortalParameter): void {
    this.editingParam.set(param.id);
    this.editValue.set(param.value);
    this.editGrund.set('');
  }

  cancelEdit(): void {
    this.editingParam.set(null);
    this.editValue.set('');
    this.editGrund.set('');
  }

  saveEdit(param: PortalParameter): void {
    const newValue = this.editValue();
    const grund = this.editGrund();
    if (newValue === param.value) {
      this.cancelEdit();
      return;
    }
    this.saving.set(true);
    this.errorMsg.set('');
    this.parameterService.updateValue(param.id, newValue, grund).subscribe({
      next: (updated) => {
        this.parameters.update(params => params.map(p => p.id === updated.id ? updated : p));
        this.saving.set(false);
        this.cancelEdit();
      },
      error: (err) => {
        this.errorMsg.set(err.error?.error || 'Fehler beim Speichern.');
        this.saving.set(false);
      }
    });
  }

  resetParam(param: PortalParameter): void {
    this.saving.set(true);
    this.errorMsg.set('');
    this.parameterService.resetToDefault(param.id).subscribe({
      next: (updated) => {
        this.parameters.update(params => params.map(p => p.id === updated.id ? updated : p));
        this.saving.set(false);
        this.cancelEdit();
      },
      error: (err) => {
        this.errorMsg.set(err.error?.error || 'Fehler beim Zuruecksetzen.');
        this.saving.set(false);
      }
    });
  }

  toggleSensitive(id: string): void {
    const current = new Set(this.revealedSensitive());
    if (current.has(id)) {
      current.delete(id);
    } else {
      current.add(id);
    }
    this.revealedSensitive.set(current);
  }

  splitOptions(options: string): string[] {
    return options.split(',').map(o => o.trim());
  }

}
