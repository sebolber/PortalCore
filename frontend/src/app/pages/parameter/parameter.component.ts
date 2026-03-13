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
        <!-- Stats Cards -->
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          @for (stat of paramStats(); track stat.label) {
            <div class="bg-white rounded-lg border border-gray-200 p-4 shadow-card">
              <div class="text-2xl font-semibold" [style.color]="stat.color">{{ stat.value }}</div>
              <div class="text-xs text-gray-500 mt-1">{{ stat.label }}</div>
            </div>
          }
        </div>

        <!-- Filters -->
        <div class="flex flex-wrap gap-3 mb-4">
          <select
            [ngModel]="appFilter()"
            (ngModelChange)="appFilter.set($event)"
            class="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">Alle Apps</option>
            @for (app of appNames(); track app) {
              <option [value]="app">{{ app }}</option>
            }
          </select>

          <input
            type="text"
            placeholder="Suche nach Schluessel, Label oder Beschreibung..."
            [ngModel]="searchFilter()"
            (ngModelChange)="searchFilter.set($event)"
            class="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-72"
          />

          <select
            [ngModel]="typeFilter()"
            (ngModelChange)="typeFilter.set($event)"
            class="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">Alle Typen</option>
            <option value="STRING">STRING</option>
            <option value="NUMBER">NUMBER</option>
            <option value="BOOLEAN">BOOLEAN</option>
            <option value="EMAIL">EMAIL</option>
            <option value="URL">URL</option>
            <option value="SELECT">SELECT</option>
            <option value="DATE">DATE</option>
            <option value="PASSWORD">PASSWORD</option>
            <option value="TEXTAREA">TEXTAREA</option>
          </select>

          <select
            [ngModel]="scopeFilter()"
            (ngModelChange)="scopeFilter.set($event)"
            class="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">Alle (Global + Mandant)</option>
            <option value="global">Nur globale Parameter</option>
            <option value="tenant">Nur mandantenspezifische</option>
          </select>
        </div>

        <!-- Error Message -->
        @if (errorMsg()) {
          <div class="mb-4 p-3 bg-error/10 text-error text-sm rounded-lg border border-error/20">
            {{ errorMsg() }}
            <button (click)="errorMsg.set('')" class="ml-2 font-bold">x</button>
          </div>
        }

        <!-- Grouped Parameters -->
        @for (appGroup of groupedParameters(); track appGroup.appName) {
          <div class="mb-6">
            <h3 class="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-primary"></span>
              {{ appGroup.appName }}
              <span class="text-xs text-gray-400 font-normal">({{ appGroup.count }} Parameter)</span>
            </h3>

            @for (group of appGroup.groups; track group.groupName) {
              <div class="ml-4 mb-4">
                <button
                  (click)="toggleGroup(appGroup.appName + ':' + group.groupName)"
                  class="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 hover:text-gray-700 cursor-pointer"
                >
                  <svg class="w-4 h-4 transition-transform" [class.rotate-90]="expandedGroups().has(appGroup.appName + ':' + group.groupName)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                  {{ group.groupName }}
                  <span class="text-gray-400">({{ group.params.length }})</span>
                </button>

                @if (expandedGroups().has(appGroup.appName + ':' + group.groupName)) {
                  <div class="space-y-2 ml-6">
                    @for (param of group.params; track param.id) {
                      <div class="bg-white rounded-lg border border-gray-200 p-4 shadow-card">
                        <div class="flex items-start justify-between gap-4">
                          <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-2 mb-1 flex-wrap">
                              <code class="text-xs font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{{ param.key }}</code>
                              <span class="text-xs px-1.5 py-0.5 rounded font-medium"
                                [class]="typeClass(param.type)">{{ param.type }}</span>
                              @if (param.hotReload) {
                                <span class="text-xs px-1.5 py-0.5 rounded bg-warning/10 text-warning font-medium" title="Hot-Reload faehig">Hot</span>
                              }
                              @if (param.required) {
                                <span class="text-xs text-error font-bold">*</span>
                              }
                              @if (param.sensitive) {
                                <span class="text-xs px-1.5 py-0.5 rounded bg-error/10 text-error font-medium">Sensibel</span>
                              }
                              @if (param.adminOnly) {
                                <span class="text-xs px-1.5 py-0.5 rounded bg-red-50 text-red-600 font-medium" title="Nur Administratoren duerfen diesen Parameter aendern">Nur Admin</span>
                              }
                              @if (param.tenantId) {
                                <span class="text-xs px-1.5 py-0.5 rounded bg-purple-50 text-purple-600 font-medium" title="Mandantenspezifisch">Mandant: {{ param.tenantId }}</span>
                              } @else {
                                <span class="text-xs px-1.5 py-0.5 rounded bg-blue-50 text-blue-500 font-medium" title="Gilt fuer alle Mandanten">Global</span>
                              }
                            </div>
                            <div class="text-sm font-medium text-gray-900">{{ param.label }}</div>
                            @if (param.description) {
                              <div class="text-xs text-gray-400 mt-0.5">{{ param.description }}</div>
                            }
                            @if (param.gueltigVon || param.gueltigBis) {
                              <div class="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                                @if (param.gueltigVon && param.gueltigVon !== '1970-01-01T00:00:00') {
                                  <span>ab {{ param.gueltigVon | date:'dd.MM.yyyy' }}</span>
                                }
                                @if (param.gueltigBis && param.gueltigBis !== '9999-12-31T23:59:59') {
                                  <span>bis {{ param.gueltigBis | date:'dd.MM.yyyy' }}</span>
                                }
                                @if ((!param.gueltigVon || param.gueltigVon === '1970-01-01T00:00:00') && (!param.gueltigBis || param.gueltigBis === '9999-12-31T23:59:59')) {
                                  <span>Unbegrenzt gueltig</span>
                                }
                              </div>
                            }
                          </div>

                          <div class="flex items-center gap-2 shrink-0">
                            @if (editingParam() === param.id) {
                              <!-- Edit Mode -->
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
                                      class="px-2 py-1 text-sm border border-primary rounded bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 w-64"
                                      rows="2"
                                    ></textarea>
                                  } @else {
                                    <input
                                      [type]="param.type === 'NUMBER' ? 'number' : param.type === 'PASSWORD' ? 'password' : param.type === 'EMAIL' ? 'email' : param.type === 'DATE' ? 'date' : 'text'"
                                      [ngModel]="editValue()"
                                      (ngModelChange)="editValue.set($event)"
                                      class="px-2 py-1 text-sm border border-primary rounded bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 w-48"
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
                              <!-- Display Mode -->
                              <div class="flex items-center gap-2">
                                @if (param.sensitive && !revealedSensitive().has(param.id)) {
                                  <span class="font-mono text-sm text-gray-400 tracking-widest">********</span>
                                  <button (click)="toggleSensitive(param.id)" class="text-xs text-primary hover:underline">Anzeigen</button>
                                } @else {
                                  <span class="font-mono text-sm text-gray-900 bg-gray-50 px-2 py-0.5 rounded">{{ param.value }}</span>
                                  @if (param.sensitive) {
                                    <button (click)="toggleSensitive(param.id)" class="text-xs text-primary hover:underline">Verbergen</button>
                                  }
                                }
                                @if (param.unit) {
                                  <span class="text-xs text-gray-400">{{ param.unit }}</span>
                                }
                                @if (!param.adminOnly || authService.isSuperAdmin()) {
                                  <button (click)="startEdit(param)" class="ml-2 text-xs text-primary hover:underline">Bearbeiten</button>
                                }
                              </div>
                            }
                          </div>
                        </div>
                        @if (param.lastModifiedBy) {
                          <div class="mt-2 text-[10px] text-gray-400">
                            Zuletzt geaendert: {{ param.lastModified | date:'dd.MM.yyyy HH:mm' }} von {{ param.lastModifiedBy }}
                          </div>
                        }
                      </div>
                    }
                  </div>
                }
              </div>
            }
          </div>
        }

        @if (groupedParameters().length === 0 && !loading()) {
          <div class="text-center text-gray-400 py-12">Keine Parameter gefunden.</div>
        }

        @if (loading()) {
          <div class="text-center text-gray-400 py-12">Lade Parameter...</div>
        }
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
  readonly typeFilter = signal('');
  readonly scopeFilter = signal('');
  readonly auditAppFilter = signal('');
  readonly expandedGroups = signal<Set<string>>(new Set());
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
      { label: 'Total', value: params.length, color: '#006EC7' },
      { label: 'Apps', value: apps.size, color: '#461EBE' },
      { label: 'Gruppen', value: groups.size, color: '#28DCAA' },
      { label: 'Aenderungen', value: this.auditLog().length, color: '#FF9868' },
      { label: 'Hot-Reload', value: hotReload, color: '#FFC107' },
      { label: 'Sensibel', value: sensitive, color: '#CC3333' },
    ];
  });

  readonly appNames = computed(() => {
    const names = new Set(this.parameters().map(p => p.appName));
    return Array.from(names).sort();
  });

  readonly groupedParameters = computed(() => {
    let params = this.parameters();
    const appF = this.appFilter();
    const search = this.searchFilter().toLowerCase();
    const typeF = this.typeFilter();
    const scopeF = this.scopeFilter();

    if (appF) params = params.filter(p => p.appName === appF);
    if (typeF) params = params.filter(p => p.type === typeF);
    if (scopeF === 'global') params = params.filter(p => !p.tenantId);
    if (scopeF === 'tenant') params = params.filter(p => !!p.tenantId);
    if (search) {
      params = params.filter(p =>
        p.key.toLowerCase().includes(search) ||
        p.label.toLowerCase().includes(search) ||
        (p.description && p.description.toLowerCase().includes(search))
      );
    }

    const byApp = new Map<string, Map<string, PortalParameter[]>>();
    for (const p of params) {
      if (!byApp.has(p.appName)) byApp.set(p.appName, new Map());
      const appMap = byApp.get(p.appName)!;
      if (!appMap.has(p.group)) appMap.set(p.group, []);
      appMap.get(p.group)!.push(p);
    }

    return Array.from(byApp.entries()).map(([appName, groups]) => ({
      appName,
      count: Array.from(groups.values()).reduce((sum, g) => sum + g.length, 0),
      groups: Array.from(groups.entries()).map(([groupName, params]) => ({ groupName, params })),
    }));
  });

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

  toggleGroup(key: string): void {
    const current = new Set(this.expandedGroups());
    if (current.has(key)) {
      current.delete(key);
    } else {
      current.add(key);
    }
    this.expandedGroups.set(current);
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

  typeClass(type: string): string {
    switch (type) {
      case 'STRING': return 'bg-primary/10 text-primary';
      case 'NUMBER': return 'bg-accent-turquoise/10 text-accent-turquoise';
      case 'BOOLEAN': return 'bg-warning/10 text-warning';
      case 'EMAIL': return 'bg-info/10 text-info';
      case 'URL': return 'bg-accent-violet/10 text-accent-violet';
      case 'SELECT': return 'bg-accent-orange/10 text-accent-orange';
      case 'PASSWORD': return 'bg-error/10 text-error';
      case 'DATE': return 'bg-accent-green/10 text-accent-green';
      case 'TEXTAREA': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-500';
    }
  }
}
