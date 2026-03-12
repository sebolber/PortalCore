import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PortalParameter } from '../../models/parameter.model';

interface ParameterChange {
  id: string;
  timestamp: string;
  parameterKey: string;
  appName: string;
  oldValue: string;
  newValue: string;
  user: string;
  reason: string;
}

@Component({
  selector: 'app-parameter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 max-w-[1400px] mx-auto">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-2xl font-condensed font-semibold text-gray-900">Parameterverwaltung</h1>
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
            32
          </span>
        </button>
        <button
          (click)="activeTab.set('changelog')"
          class="px-4 py-2.5 text-sm font-medium transition-colors relative"
          [class]="activeTab() === 'changelog'
            ? 'text-primary border-b-2 border-primary'
            : 'text-gray-500 hover:text-gray-700'"
        >
          Aenderungsprotokoll
          <span class="ml-1.5 text-xs px-1.5 py-0.5 rounded-full"
            [class]="activeTab() === 'changelog' ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-500'">
            {{ changeLog.length }}
          </span>
        </button>
      </div>

      <!-- Tab 1: Parameter -->
      @if (activeTab() === 'parameter') {
        <!-- Stats Cards -->
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          @for (stat of paramStats; track stat.label) {
            <div class="bg-white rounded-lg border border-gray-200 p-4 shadow-card">
              <div class="text-2xl font-semibold" [style.color]="stat.color">{{ stat.value }}</div>
              <div class="text-xs text-gray-500 mt-1">{{ stat.label }}</div>
            </div>
          }
        </div>

        <!-- App Filter -->
        <div class="mb-4">
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
        </div>

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
                            </div>
                            <div class="text-sm font-medium text-gray-900">{{ param.label }}</div>
                            @if (param.description) {
                              <div class="text-xs text-gray-400 mt-0.5">{{ param.description }}</div>
                            }
                          </div>

                          <div class="flex items-center gap-2 shrink-0">
                            @if (editingParam() === param.id) {
                              <!-- Edit Mode -->
                              @if (param.type === 'boolean') {
                                <select
                                  [ngModel]="editValue()"
                                  (ngModelChange)="editValue.set($event)"
                                  class="px-2 py-1 text-sm border border-primary rounded bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                                >
                                  <option value="true">true</option>
                                  <option value="false">false</option>
                                </select>
                              } @else if (param.type === 'select' && param.options) {
                                <select
                                  [ngModel]="editValue()"
                                  (ngModelChange)="editValue.set($event)"
                                  class="px-2 py-1 text-sm border border-primary rounded bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                                >
                                  @for (opt of param.options; track opt) {
                                    <option [value]="opt">{{ opt }}</option>
                                  }
                                </select>
                              } @else if (param.type === 'textarea') {
                                <textarea
                                  [ngModel]="editValue()"
                                  (ngModelChange)="editValue.set($event)"
                                  class="px-2 py-1 text-sm border border-primary rounded bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 w-64"
                                  rows="2"
                                ></textarea>
                              } @else {
                                <input
                                  [type]="param.type === 'number' ? 'number' : param.type === 'password' ? 'password' : 'text'"
                                  [ngModel]="editValue()"
                                  (ngModelChange)="editValue.set($event)"
                                  class="px-2 py-1 text-sm border border-primary rounded bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 w-48"
                                />
                              }
                              @if (param.unit) {
                                <span class="text-xs text-gray-400">{{ param.unit }}</span>
                              }
                              <button (click)="saveEdit(param)" class="px-2 py-1 text-xs bg-primary text-white rounded hover:bg-primary-dark transition-colors">Speichern</button>
                              <button (click)="cancelEdit()" class="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors">Abbrechen</button>
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
                                <button (click)="startEdit(param)" class="ml-2 text-xs text-primary hover:underline">Bearbeiten</button>
                              </div>
                            }
                          </div>
                        </div>
                      </div>
                    }
                  </div>
                }
              </div>
            }
          </div>
        }
      }

      <!-- Tab 2: Aenderungsprotokoll -->
      @if (activeTab() === 'changelog') {
        <div class="bg-white rounded-lg border border-gray-200 shadow-card overflow-hidden">
          <table class="w-full text-sm">
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
              @for (entry of changeLog; track entry.id) {
                <tr class="border-b border-gray-100 hover:bg-gray-50">
                  <td class="px-4 py-3 text-gray-500 text-xs font-mono">{{ entry.timestamp }}</td>
                  <td class="px-4 py-3">
                    <code class="text-xs font-mono text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded">{{ entry.parameterKey }}</code>
                  </td>
                  <td class="px-4 py-3 text-gray-600 text-xs">{{ entry.appName }}</td>
                  <td class="px-4 py-3">
                    <span class="font-mono text-xs text-error bg-error/5 px-1.5 py-0.5 rounded">{{ entry.oldValue }}</span>
                  </td>
                  <td class="px-4 py-3">
                    <span class="font-mono text-xs text-success bg-success/5 px-1.5 py-0.5 rounded">{{ entry.newValue }}</span>
                  </td>
                  <td class="px-4 py-3 text-gray-600 text-xs">{{ entry.user }}</td>
                  <td class="px-4 py-3 text-gray-500 text-xs">{{ entry.reason }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
})
export class ParameterComponent {
  readonly activeTab = signal<'parameter' | 'changelog'>('parameter');
  readonly appFilter = signal('');
  readonly expandedGroups = signal<Set<string>>(new Set());
  readonly editingParam = signal<string | null>(null);
  readonly editValue = signal('');
  readonly revealedSensitive = signal<Set<string>>(new Set());

  readonly paramStats = [
    { label: 'Total', value: 32, color: '#006EC7' },
    { label: 'Apps', value: 6, color: '#461EBE' },
    { label: 'Gruppen', value: 12, color: '#28DCAA' },
    { label: 'Aenderungen', value: 47, color: '#FF9868' },
    { label: 'Hot-Reload', value: 8, color: '#FFC107' },
    { label: 'Sensibel', value: 2, color: '#CC3333' },
  ];

  readonly parameters: PortalParameter[] = [
    // Portal - Allgemein
    { id: 'pm1', key: 'portal.name', label: 'Portal Name', description: 'Anzeigename des Portals', appId: 'portal', appName: 'Portal', group: 'Allgemein', type: 'string', value: 'Health Portal', defaultValue: 'Health Portal', required: true, validationRules: [], sensitive: false, hotReload: true, lastModified: '2026-03-10', lastModifiedBy: 'Anna Schneider', createdAt: '2025-01-01' },
    { id: 'pm2', key: 'portal.version', label: 'Portal Version', description: 'Aktuelle Version', appId: 'portal', appName: 'Portal', group: 'Allgemein', type: 'string', value: '2.4.1', defaultValue: '1.0.0', required: true, validationRules: [], sensitive: false, hotReload: false, lastModified: '2026-03-01', lastModifiedBy: 'System', createdAt: '2025-01-01' },
    { id: 'pm3', key: 'portal.maintenance', label: 'Wartungsmodus', description: 'Wartungsmodus aktivieren', appId: 'portal', appName: 'Portal', group: 'Allgemein', type: 'boolean', value: 'false', defaultValue: 'false', required: false, validationRules: [], sensitive: false, hotReload: true, lastModified: '2026-02-15', lastModifiedBy: 'Anna Schneider', createdAt: '2025-01-01' },
    { id: 'pm4', key: 'portal.language', label: 'Standardsprache', description: 'Standard-Spracheinstellung', appId: 'portal', appName: 'Portal', group: 'Allgemein', type: 'select', value: 'de', defaultValue: 'de', required: true, validationRules: [], options: ['de', 'en', 'fr'], sensitive: false, hotReload: true, lastModified: '2026-01-10', lastModifiedBy: 'Anna Schneider', createdAt: '2025-01-01' },
    // Portal - Session
    { id: 'pm5', key: 'portal.session.timeout', label: 'Session Timeout', description: 'Timeout in Minuten', appId: 'portal', appName: 'Portal', group: 'Session', type: 'number', value: '30', defaultValue: '30', required: true, validationRules: [], unit: 'min', sensitive: false, hotReload: true, lastModified: '2026-03-05', lastModifiedBy: 'Anna Schneider', createdAt: '2025-01-01' },
    { id: 'pm6', key: 'portal.session.maxConcurrent', label: 'Max. gleichzeitige Sessions', description: 'Pro Benutzer', appId: 'portal', appName: 'Portal', group: 'Session', type: 'number', value: '3', defaultValue: '3', required: true, validationRules: [], sensitive: false, hotReload: false, lastModified: '2026-02-20', lastModifiedBy: 'Anna Schneider', createdAt: '2025-01-01' },
    // Portal - E-Mail
    { id: 'pm7', key: 'portal.email.sender', label: 'Absender E-Mail', description: 'Standard-Absenderadresse', appId: 'portal', appName: 'Portal', group: 'E-Mail', type: 'email', value: 'noreply@health-portal.de', defaultValue: 'noreply@health-portal.de', required: true, validationRules: [], sensitive: false, hotReload: false, lastModified: '2026-01-15', lastModifiedBy: 'Anna Schneider', createdAt: '2025-01-01' },
    { id: 'pm8', key: 'portal.email.smtp.password', label: 'SMTP Passwort', description: 'SMTP-Server Passwort', appId: 'portal', appName: 'Portal', group: 'E-Mail', type: 'password', value: 'smtp-secret-2026', defaultValue: '', required: true, validationRules: [], sensitive: true, hotReload: false, lastModified: '2026-03-01', lastModifiedBy: 'Anna Schneider', createdAt: '2025-01-01' },
    // SMILE KH - Fallmanagement
    { id: 'pm9', key: 'smile.fall.maxDauer', label: 'Max. Falldauer', description: 'Maximale Bearbeitungsdauer', appId: 'smile', appName: 'SMILE KH', group: 'Fallmanagement', type: 'number', value: '90', defaultValue: '90', required: true, validationRules: [], unit: 'Tage', sensitive: false, hotReload: false, lastModified: '2026-02-10', lastModifiedBy: 'Thomas Fischer', createdAt: '2025-03-01' },
    { id: 'pm10', key: 'smile.fall.autoClose', label: 'Auto-Schliessung', description: 'Faelle automatisch schliessen', appId: 'smile', appName: 'SMILE KH', group: 'Fallmanagement', type: 'boolean', value: 'true', defaultValue: 'false', required: false, validationRules: [], sensitive: false, hotReload: true, lastModified: '2026-03-08', lastModifiedBy: 'Laura Mueller', createdAt: '2025-03-01' },
    { id: 'pm11', key: 'smile.fall.prioritaet', label: 'Standard-Prioritaet', description: 'Standardmaessige Fallprioritaet', appId: 'smile', appName: 'SMILE KH', group: 'Fallmanagement', type: 'select', value: 'mittel', defaultValue: 'mittel', required: true, validationRules: [], options: ['niedrig', 'mittel', 'hoch', 'kritisch'], sensitive: false, hotReload: true, lastModified: '2026-01-20', lastModifiedBy: 'Thomas Fischer', createdAt: '2025-03-01' },
    // SMILE KH - Pruefung
    { id: 'pm12', key: 'smile.pruefung.frist', label: 'Pruefungsfrist', description: 'Standard-Pruefungsfrist', appId: 'smile', appName: 'SMILE KH', group: 'Pruefung', type: 'number', value: '14', defaultValue: '14', required: true, validationRules: [], unit: 'Tage', sensitive: false, hotReload: false, lastModified: '2026-02-28', lastModifiedBy: 'Thomas Fischer', createdAt: '2025-03-01' },
    { id: 'pm13', key: 'smile.pruefung.vierAugen', label: 'Vier-Augen-Prinzip', description: 'Vier-Augen-Prinzip bei Freigabe', appId: 'smile', appName: 'SMILE KH', group: 'Pruefung', type: 'boolean', value: 'true', defaultValue: 'true', required: false, validationRules: [], sensitive: false, hotReload: false, lastModified: '2026-01-05', lastModifiedBy: 'Anna Schneider', createdAt: '2025-03-01' },
    // Abrechnung - Rechnungen
    { id: 'pm14', key: 'abrechnung.zahlungsziel', label: 'Zahlungsziel', description: 'Standard-Zahlungsziel', appId: 'abrechnung', appName: 'Abrechnung', group: 'Rechnungen', type: 'number', value: '30', defaultValue: '30', required: true, validationRules: [], unit: 'Tage', sensitive: false, hotReload: false, lastModified: '2026-02-01', lastModifiedBy: 'Sandra Becker', createdAt: '2025-04-01' },
    { id: 'pm15', key: 'abrechnung.mwst', label: 'Mehrwertsteuersatz', description: 'Standard MwSt-Satz', appId: 'abrechnung', appName: 'Abrechnung', group: 'Rechnungen', type: 'number', value: '19', defaultValue: '19', required: true, validationRules: [], unit: '%', sensitive: false, hotReload: false, lastModified: '2026-01-01', lastModifiedBy: 'Sandra Becker', createdAt: '2025-04-01' },
    { id: 'pm16', key: 'abrechnung.waehrung', label: 'Waehrung', description: 'Standard-Waehrung', appId: 'abrechnung', appName: 'Abrechnung', group: 'Rechnungen', type: 'select', value: 'EUR', defaultValue: 'EUR', required: true, validationRules: [], options: ['EUR', 'CHF'], sensitive: false, hotReload: false, lastModified: '2025-12-01', lastModifiedBy: 'Anna Schneider', createdAt: '2025-04-01' },
    // Abrechnung - Export
    { id: 'pm17', key: 'abrechnung.export.format', label: 'Export-Format', description: 'Standard-Exportformat', appId: 'abrechnung', appName: 'Abrechnung', group: 'Export', type: 'select', value: 'CSV', defaultValue: 'CSV', required: true, validationRules: [], options: ['CSV', 'XLSX', 'PDF', 'XML'], sensitive: false, hotReload: true, lastModified: '2026-03-02', lastModifiedBy: 'Sandra Becker', createdAt: '2025-04-01' },
    { id: 'pm18', key: 'abrechnung.export.maxRows', label: 'Max. Exportzeilen', description: 'Maximale Anzahl Zeilen pro Export', appId: 'abrechnung', appName: 'Abrechnung', group: 'Export', type: 'number', value: '50000', defaultValue: '10000', required: true, validationRules: [], sensitive: false, hotReload: true, lastModified: '2026-02-15', lastModifiedBy: 'Sandra Becker', createdAt: '2025-04-01' },
    // WB-Foerderung - Antraege
    { id: 'pm19', key: 'wb.antrag.maxBetrag', label: 'Max. Foerderbetrag', description: 'Maximaler Foerderbetrag pro Antrag', appId: 'wb', appName: 'WB-Foerderung', group: 'Antraege', type: 'number', value: '25000', defaultValue: '15000', required: true, validationRules: [], unit: 'EUR', sensitive: false, hotReload: false, lastModified: '2026-03-01', lastModifiedBy: 'Anna Schneider', createdAt: '2025-06-01' },
    { id: 'pm20', key: 'wb.antrag.bearbeitungsFrist', label: 'Bearbeitungsfrist', description: 'Frist fuer Antragsbearbeitung', appId: 'wb', appName: 'WB-Foerderung', group: 'Antraege', type: 'number', value: '21', defaultValue: '14', required: true, validationRules: [], unit: 'Tage', sensitive: false, hotReload: false, lastModified: '2026-02-20', lastModifiedBy: 'Anna Schneider', createdAt: '2025-06-01' },
    { id: 'pm21', key: 'wb.antrag.autoGenehmigung', label: 'Auto-Genehmigung', description: 'Automatische Genehmigung unter Schwellwert', appId: 'wb', appName: 'WB-Foerderung', group: 'Antraege', type: 'boolean', value: 'false', defaultValue: 'false', required: false, validationRules: [], sensitive: false, hotReload: true, lastModified: '2026-01-15', lastModifiedBy: 'Anna Schneider', createdAt: '2025-06-01' },
    // WB-Foerderung - Berichte
    { id: 'pm22', key: 'wb.bericht.intervall', label: 'Berichtsintervall', description: 'Standard-Berichtsintervall', appId: 'wb', appName: 'WB-Foerderung', group: 'Berichte', type: 'select', value: 'monatlich', defaultValue: 'monatlich', required: true, validationRules: [], options: ['wochentlich', 'monatlich', 'quartalsweise'], sensitive: false, hotReload: false, lastModified: '2026-01-10', lastModifiedBy: 'Anna Schneider', createdAt: '2025-06-01' },
    // API Gateway - Allgemein
    { id: 'pm23', key: 'api.rateLimit', label: 'Rate Limit', description: 'Maximale Anfragen pro Minute', appId: 'api', appName: 'API Gateway', group: 'Allgemein', type: 'number', value: '1000', defaultValue: '500', required: true, validationRules: [], unit: 'req/min', sensitive: false, hotReload: true, lastModified: '2026-03-10', lastModifiedBy: 'Michael Braun', createdAt: '2025-07-01' },
    { id: 'pm24', key: 'api.timeout', label: 'Request Timeout', description: 'Standard Request Timeout', appId: 'api', appName: 'API Gateway', group: 'Allgemein', type: 'number', value: '30', defaultValue: '30', required: true, validationRules: [], unit: 'sek', sensitive: false, hotReload: true, lastModified: '2026-02-25', lastModifiedBy: 'Michael Braun', createdAt: '2025-07-01' },
    { id: 'pm25', key: 'api.cors.origins', label: 'CORS Origins', description: 'Erlaubte CORS Origins', appId: 'api', appName: 'API Gateway', group: 'Allgemein', type: 'string', value: 'https://portal.health-portal.de', defaultValue: '*', required: true, validationRules: [], sensitive: false, hotReload: false, lastModified: '2026-01-20', lastModifiedBy: 'Michael Braun', createdAt: '2025-07-01' },
    // API Gateway - Sicherheit
    { id: 'pm26', key: 'api.auth.tokenExpiry', label: 'Token Gueltigkeitsdauer', description: 'JWT Token Ablaufzeit', appId: 'api', appName: 'API Gateway', group: 'Sicherheit', type: 'number', value: '3600', defaultValue: '3600', required: true, validationRules: [], unit: 'sek', sensitive: false, hotReload: false, lastModified: '2026-02-10', lastModifiedBy: 'Michael Braun', createdAt: '2025-07-01' },
    { id: 'pm27', key: 'api.auth.secret', label: 'JWT Secret', description: 'Geheimer Schluessel fuer JWT', appId: 'api', appName: 'API Gateway', group: 'Sicherheit', type: 'password', value: 'super-secret-jwt-key-2026', defaultValue: '', required: true, validationRules: [], sensitive: true, hotReload: false, lastModified: '2026-03-01', lastModifiedBy: 'Anna Schneider', createdAt: '2025-07-01' },
    // Arztregister - Suche
    { id: 'pm28', key: 'arzt.suche.maxResults', label: 'Max. Suchergebnisse', description: 'Maximale Anzahl Suchergebnisse', appId: 'arzt', appName: 'Arztregister', group: 'Suche', type: 'number', value: '100', defaultValue: '50', required: true, validationRules: [], sensitive: false, hotReload: true, lastModified: '2026-03-05', lastModifiedBy: 'Daniel Hartmann', createdAt: '2025-09-01' },
    { id: 'pm29', key: 'arzt.suche.fuzzy', label: 'Unscharfe Suche', description: 'Unscharfe Suche aktivieren', appId: 'arzt', appName: 'Arztregister', group: 'Suche', type: 'boolean', value: 'true', defaultValue: 'false', required: false, validationRules: [], sensitive: false, hotReload: true, lastModified: '2026-02-28', lastModifiedBy: 'Daniel Hartmann', createdAt: '2025-09-01' },
    // Arztregister - Daten
    { id: 'pm30', key: 'arzt.daten.syncIntervall', label: 'Sync-Intervall', description: 'Datenabgleich-Intervall', appId: 'arzt', appName: 'Arztregister', group: 'Daten', type: 'number', value: '24', defaultValue: '24', required: true, validationRules: [], unit: 'Stunden', sensitive: false, hotReload: false, lastModified: '2026-01-15', lastModifiedBy: 'Daniel Hartmann', createdAt: '2025-09-01' },
    { id: 'pm31', key: 'arzt.daten.quelle', label: 'Datenquelle', description: 'Primaere Datenquelle', appId: 'arzt', appName: 'Arztregister', group: 'Daten', type: 'url', value: 'https://kbv-register.de/api/v2', defaultValue: 'https://kbv-register.de/api/v1', required: true, validationRules: [], sensitive: false, hotReload: false, lastModified: '2026-03-01', lastModifiedBy: 'Michael Braun', createdAt: '2025-09-01' },
    { id: 'pm32', key: 'arzt.daten.cacheExpiry', label: 'Cache Ablaufzeit', description: 'Cache Gueltigkeitsdauer', appId: 'arzt', appName: 'Arztregister', group: 'Daten', type: 'number', value: '60', defaultValue: '30', required: true, validationRules: [], unit: 'min', sensitive: false, hotReload: true, lastModified: '2026-02-15', lastModifiedBy: 'Daniel Hartmann', createdAt: '2025-09-01' },
  ];

  readonly changeLog: ParameterChange[] = [
    { id: 'c1', timestamp: '2026-03-10 14:30:00', parameterKey: 'api.rateLimit', appName: 'API Gateway', oldValue: '500', newValue: '1000', user: 'Michael Braun', reason: 'Erhoehung wegen steigender Last' },
    { id: 'c2', timestamp: '2026-03-08 10:15:00', parameterKey: 'smile.fall.autoClose', appName: 'SMILE KH', oldValue: 'false', newValue: 'true', user: 'Laura Mueller', reason: 'Automatische Schliessung aktiviert' },
    { id: 'c3', timestamp: '2026-03-05 09:00:00', parameterKey: 'portal.session.timeout', appName: 'Portal', oldValue: '15', newValue: '30', user: 'Anna Schneider', reason: 'Benutzeranforderung: laengere Sessions' },
    { id: 'c4', timestamp: '2026-03-05 08:45:00', parameterKey: 'arzt.suche.maxResults', appName: 'Arztregister', oldValue: '50', newValue: '100', user: 'Daniel Hartmann', reason: 'Performance optimiert' },
    { id: 'c5', timestamp: '2026-03-02 11:20:00', parameterKey: 'abrechnung.export.format', appName: 'Abrechnung', oldValue: 'XLSX', newValue: 'CSV', user: 'Sandra Becker', reason: 'CSV als Standard fuer Weiterverarbeitung' },
    { id: 'c6', timestamp: '2026-03-01 16:00:00', parameterKey: 'portal.version', appName: 'Portal', oldValue: '2.3.8', newValue: '2.4.1', user: 'System', reason: 'Release-Update' },
    { id: 'c7', timestamp: '2026-03-01 15:30:00', parameterKey: 'api.auth.secret', appName: 'API Gateway', oldValue: '***', newValue: '***', user: 'Anna Schneider', reason: 'Regelmaessige Rotation' },
    { id: 'c8', timestamp: '2026-03-01 14:00:00', parameterKey: 'wb.antrag.maxBetrag', appName: 'WB-Foerderung', oldValue: '15000', newValue: '25000', user: 'Anna Schneider', reason: 'Budget-Anpassung 2026' },
    { id: 'c9', timestamp: '2026-02-28 09:30:00', parameterKey: 'smile.pruefung.frist', appName: 'SMILE KH', oldValue: '7', newValue: '14', user: 'Thomas Fischer', reason: 'Fristverlaengerung fuer komplexe Faelle' },
    { id: 'c10', timestamp: '2026-02-28 08:15:00', parameterKey: 'arzt.suche.fuzzy', appName: 'Arztregister', oldValue: 'false', newValue: 'true', user: 'Daniel Hartmann', reason: 'Bessere Suchergebnisse' },
    { id: 'c11', timestamp: '2026-02-25 13:00:00', parameterKey: 'api.timeout', appName: 'API Gateway', oldValue: '15', newValue: '30', user: 'Michael Braun', reason: 'Timeout fuer grosse Datenmengen' },
    { id: 'c12', timestamp: '2026-02-20 10:45:00', parameterKey: 'wb.antrag.bearbeitungsFrist', appName: 'WB-Foerderung', oldValue: '14', newValue: '21', user: 'Anna Schneider', reason: 'Mehr Zeit fuer Sachbearbeiter' },
  ];

  readonly appNames = computed(() => {
    const names = new Set(this.parameters.map(p => p.appName));
    return Array.from(names);
  });

  readonly groupedParameters = computed(() => {
    let params = this.parameters;
    const filter = this.appFilter();
    if (filter) {
      params = params.filter(p => p.appName === filter);
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
  }

  cancelEdit(): void {
    this.editingParam.set(null);
    this.editValue.set('');
  }

  saveEdit(param: PortalParameter): void {
    const newValue = this.editValue();
    if (newValue !== param.value) {
      (param as any).value = newValue;
    }
    this.editingParam.set(null);
    this.editValue.set('');
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

  typeClass(type: string): string {
    switch (type) {
      case 'string': return 'bg-primary/10 text-primary';
      case 'number': return 'bg-accent-turquoise/10 text-accent-turquoise';
      case 'boolean': return 'bg-warning/10 text-warning';
      case 'email': return 'bg-info/10 text-info';
      case 'url': return 'bg-accent-violet/10 text-accent-violet';
      case 'select': return 'bg-accent-orange/10 text-accent-orange';
      case 'password': return 'bg-error/10 text-error';
      case 'date': return 'bg-accent-green/10 text-accent-green';
      case 'textarea': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-500';
    }
  }
}
