import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-parameter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h1 class="text-xl font-condensed font-bold mb-6">Parameter</h1>

    <div class="flex border-b border-gray-200 mb-6">
      <button *ngFor="let tab of tabs" (click)="activeTab = tab"
        [class]="activeTab === tab ? 'border-b-2 border-primary text-primary px-4 py-3 text-sm font-medium' : 'border-b-2 border-transparent text-gray-400 px-4 py-3 text-sm'">
        {{tab}}
      </button>
    </div>

    <!-- Tab 1: Parameter -->
    <div *ngIf="activeTab === 'Parameter'">
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <div *ngFor="let stat of stats" class="card flex items-center gap-3">
          <div class="text-lg font-bold">{{stat.value}}</div>
          <div class="text-xs text-gray-400">{{stat.label}}</div>
        </div>
      </div>

      <div class="mb-4">
        <select [(ngModel)]="filterApp" class="input-field !w-auto">
          <option value="">Alle Apps</option>
          <option *ngFor="let app of appNames" [value]="app">{{app}}</option>
        </select>
      </div>

      <div *ngFor="let group of getGroupedParams()" class="mb-4">
        <div class="card cursor-pointer" (click)="group.expanded = !group.expanded">
          <div class="flex items-center justify-between">
            <div>
              <span class="badge badge-primary mr-2">{{group.appName}}</span>
              <span class="font-condensed font-semibold">{{group.groupName}}</span>
              <span class="text-xs text-gray-400 ml-2">({{group.params.length}} Parameter)</span>
            </div>
            <span class="text-gray-400">{{group.expanded ? '&#9650;' : '&#9660;'}}</span>
          </div>
        </div>
        <div *ngIf="group.expanded" class="ml-4 mt-2 space-y-2">
          <div *ngFor="let param of group.params" class="card !p-4 flex flex-wrap items-center gap-4">
            <div class="flex-1 min-w-[200px]">
              <div class="text-xs text-gray-400 font-mono">{{param.key}}</div>
              <div class="text-sm font-medium">{{param.label}}</div>
              <div class="text-xs text-gray-400">{{param.description}}</div>
            </div>
            <div class="flex items-center gap-2">
              <span *ngIf="param.required" class="badge badge-error">Pflicht</span>
              <span *ngIf="param.hotReload" class="badge badge-success">Hot-Reload</span>
              <span *ngIf="param.sensitive" class="badge badge-warning">Sensitiv</span>
            </div>
            <div class="w-64">
              <div *ngIf="editingParam !== param.id">
                <span *ngIf="param.sensitive && !showSensitive[param.id]" class="font-mono text-sm">********</span>
                <span *ngIf="!param.sensitive || showSensitive[param.id]" class="font-mono text-sm">{{param.value}}</span>
                <button *ngIf="param.sensitive" (click)="showSensitive[param.id] = !showSensitive[param.id]" class="text-xs text-primary ml-2">
                  {{showSensitive[param.id] ? 'Verbergen' : 'Anzeigen'}}
                </button>
                <span *ngIf="param.unit" class="text-xs text-gray-400 ml-1">{{param.unit}}</span>
              </div>
              <div *ngIf="editingParam === param.id" class="flex gap-2">
                <input [(ngModel)]="param.value" class="input-field !text-sm" [type]="param.type === 'number' ? 'number' : 'text'">
                <button class="btn-primary text-xs !px-2 !py-1" (click)="editingParam = null">Speichern</button>
                <button class="btn-secondary text-xs !px-2 !py-1" (click)="editingParam = null">X</button>
              </div>
            </div>
            <button *ngIf="editingParam !== param.id" class="text-xs text-primary hover:underline" (click)="editingParam = param.id">Bearbeiten</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab 2: Aenderungsprotokoll -->
    <div *ngIf="activeTab === 'Aenderungsprotokoll'">
      <div class="card !p-0 overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-gray-100/50 border-b">
            <tr>
              <th class="px-4 py-3 text-left font-medium text-gray-700">Zeitpunkt</th>
              <th class="px-4 py-3 text-left font-medium text-gray-700">Parameter</th>
              <th class="px-4 py-3 text-left font-medium text-gray-700">App</th>
              <th class="px-4 py-3 text-left font-medium text-gray-700">Alter Wert</th>
              <th class="px-4 py-3 text-left font-medium text-gray-700">Neuer Wert</th>
              <th class="px-4 py-3 text-left font-medium text-gray-700">Benutzer</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let log of auditLog" class="border-b border-gray-400/5">
              <td class="px-4 py-3 text-xs">{{log.zeitpunkt}}</td>
              <td class="px-4 py-3 font-mono text-xs">{{log.key}}</td>
              <td class="px-4 py-3"><span class="badge badge-primary">{{log.app}}</span></td>
              <td class="px-4 py-3 text-xs text-gray-500">{{log.alterWert}}</td>
              <td class="px-4 py-3 text-xs font-medium">{{log.neuerWert}}</td>
              <td class="px-4 py-3 text-xs">{{log.benutzer}}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class ParameterComponent {
  activeTab = 'Parameter';
  tabs = ['Parameter', 'Aenderungsprotokoll'];
  filterApp = '';
  editingParam: string | null = null;
  showSensitive: { [key: string]: boolean } = {};

  stats = [
    { label: 'Total', value: 32 },
    { label: 'Apps', value: 6 },
    { label: 'Gruppen', value: 12 },
    { label: 'Aenderungen', value: 47 },
    { label: 'Hot-Reload', value: 8 },
    { label: 'Sensitiv', value: 2 },
  ];

  appNames = ['KV AI Abrechnung', 'smile KH', 'Arztregister', 'WB-Foerderung', 'MD-Kommunikation', 'Portal'];

  params = [
    { id: 'par-1', key: 'kv-ai.model.version', label: 'KI-Modell Version', description: 'Aktive Version des KI-Modells', appName: 'KV AI Abrechnung', group: 'KI-Konfiguration', type: 'select', value: '3.2', required: true, sensitive: false, hotReload: false, unit: null },
    { id: 'par-2', key: 'kv-ai.confidence.threshold', label: 'Konfidenz-Schwellenwert', description: 'Minimale Konfidenz fuer automatische Freigabe', appName: 'KV AI Abrechnung', group: 'KI-Konfiguration', type: 'number', value: '0.85', required: true, sensitive: false, hotReload: true, unit: '%' },
    { id: 'par-3', key: 'kv-ai.batch.size', label: 'Batch-Groesse', description: 'Anzahl Abrechnungen pro Batch', appName: 'KV AI Abrechnung', group: 'Verarbeitung', type: 'number', value: '500', required: false, sensitive: false, hotReload: true, unit: 'Eintraege' },
    { id: 'par-5', key: 'kv-ai.api.key', label: 'API-Schluessel', description: 'Authentifizierungsschluessel', appName: 'KV AI Abrechnung', group: 'Verbindung', type: 'password', value: 'sk-ah-kv-2026-xxxx', required: true, sensitive: true, hotReload: false, unit: null },
    { id: 'par-7', key: 'smile-kh.pruefung.auto', label: 'Automatische Pruefung', description: 'Auto-Pruefung neuer Faelle', appName: 'smile KH', group: 'Pruefung', type: 'boolean', value: 'true', required: false, sensitive: false, hotReload: true, unit: null },
    { id: 'par-8', key: 'smile-kh.pruefung.frist', label: 'Pruefungsfrist', description: 'Max. Bearbeitungszeit', appName: 'smile KH', group: 'Pruefung', type: 'number', value: '14', required: true, sensitive: false, hotReload: false, unit: 'Tage' },
    { id: 'par-9', key: 'smile-kh.ampel.gelb.schwelle', label: 'Gelbe Ampel Schwelle', description: 'Betragsschwelle gelbe Ampel', appName: 'smile KH', group: 'Ampelsystem', type: 'number', value: '5000', required: true, sensitive: false, hotReload: true, unit: 'EUR' },
    { id: 'par-12', key: 'arztregister.sync.interval', label: 'Sync-Intervall', description: 'Datensynchronisierung', appName: 'Arztregister', group: 'Synchronisierung', type: 'select', value: '6h', required: false, sensitive: false, hotReload: true, unit: null },
    { id: 'par-15', key: 'wb-foerderung.antrag.frist', label: 'Antragsfrist', description: 'Einreichungsfrist', appName: 'WB-Foerderung', group: 'Antraege', type: 'date', value: '2026-06-30', required: true, sensitive: false, hotReload: false, unit: null },
    { id: 'par-18', key: 'portal.session.timeout', label: 'Session-Timeout', description: 'Abmelden nach Inaktivitaet', appName: 'Portal', group: 'Sicherheit', type: 'number', value: '30', required: true, sensitive: false, hotReload: true, unit: 'Minuten' },
    { id: 'par-19', key: 'portal.2fa.enabled', label: 'Zwei-Faktor-Auth', description: '2FA aktivieren', appName: 'Portal', group: 'Sicherheit', type: 'boolean', value: 'true', required: false, sensitive: false, hotReload: false, unit: null },
  ];

  auditLog = [
    { zeitpunkt: '01.03.2026 10:00', key: 'kv-ai.model.version', app: 'KV AI', alterWert: '3.1', neuerWert: '3.2', benutzer: 'Sabine Mueller' },
    { zeitpunkt: '15.02.2026 14:00', key: 'kv-ai.confidence.threshold', app: 'KV AI', alterWert: '0.80', neuerWert: '0.85', benutzer: 'Thomas Weber' },
    { zeitpunkt: '20.02.2026 11:00', key: 'smile-kh.pruefung.auto', app: 'smile KH', alterWert: 'false', neuerWert: 'true', benutzer: 'Anna Schmidt' },
    { zeitpunkt: '01.02.2026 10:00', key: 'smile-kh.ampel.gelb.schwelle', app: 'smile KH', alterWert: '3000', neuerWert: '5000', benutzer: 'Thomas Weber' },
    { zeitpunkt: '15.01.2026 09:00', key: 'arztregister.sync.interval', app: 'Arztregister', alterWert: '24h', neuerWert: '6h', benutzer: 'Sabine Mueller' },
    { zeitpunkt: '05.01.2026 10:00', key: 'wb-foerderung.antrag.frist', app: 'WB-Foerderung', alterWert: '2026-12-31', neuerWert: '2026-06-30', benutzer: 'Sabine Mueller' },
    { zeitpunkt: '01.03.2026 08:00', key: 'portal.session.timeout', app: 'Portal', alterWert: '15', neuerWert: '30', benutzer: 'Sabine Mueller' },
  ];

  getGroupedParams(): any[] {
    const filtered = this.filterApp ? this.params.filter(p => p.appName === this.filterApp) : this.params;
    const groups: any[] = [];
    filtered.forEach(p => {
      let g = groups.find(gr => gr.appName === p.appName && gr.groupName === p.group);
      if (!g) {
        g = { appName: p.appName, groupName: p.group, expanded: false, params: [] };
        groups.push(g);
      }
      g.params.push(p);
    });
    return groups;
  }
}
