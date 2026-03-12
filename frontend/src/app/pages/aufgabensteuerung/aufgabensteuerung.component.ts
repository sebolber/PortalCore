import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-aufgabensteuerung',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-xl font-condensed font-bold">Aufgabensteuerung</h1>
      <button class="btn-primary text-sm" (click)="showForm = !showForm">
        {{showForm ? 'Abbrechen' : 'Neue Regel anlegen'}}
      </button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div *ngFor="let stat of stats" class="card flex items-center gap-3">
        <div class="w-9 h-9 rounded-lg flex items-center justify-center text-white" [style.background-color]="stat.color">
          <span class="text-sm font-bold">{{stat.value}}</span>
        </div>
        <div class="text-xs text-gray-400">{{stat.label}}</div>
      </div>
    </div>

    <!-- Inline Form -->
    <div *ngIf="showForm" class="card border-2 border-primary/20 mb-6">
      <h3 class="font-condensed font-semibold mb-4">{{editingId ? 'Regel bearbeiten' : 'Neue Regel'}}</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label class="text-xs font-medium text-gray-500 block mb-1">Bezeichnung *</label>
          <input [(ngModel)]="form.bezeichnung" class="input-field" placeholder="Name der Regel">
        </div>
        <div>
          <label class="text-xs font-medium text-gray-500 block mb-1">Kriterium *</label>
          <select [(ngModel)]="form.kriterium" class="input-field">
            <option value="IK_NUMMER">IK-Nummer</option>
            <option value="PLZ">PLZ</option>
            <option value="BETRIEBSNUMMER">Betriebsnummer</option>
            <option value="GEBURTSDATUM">Geburtsdatum</option>
            <option value="NAME">Name</option>
          </select>
        </div>
        <div>
          <label class="text-xs font-medium text-gray-500 block mb-1">Kriterium-Wert *</label>
          <input [(ngModel)]="form.kriteriumWert" class="input-field" [placeholder]="getPlaceholder()">
        </div>
        <div>
          <label class="text-xs font-medium text-gray-500 block mb-1">Zuweisungstyp</label>
          <div class="flex gap-2">
            <button (click)="form.zuweisungTyp = 'mitarbeiter'" class="flex-1 py-2 rounded-lg text-sm border"
              [class.bg-primary]="form.zuweisungTyp === 'mitarbeiter'" [class.text-white]="form.zuweisungTyp === 'mitarbeiter'">Mitarbeiter</button>
            <button (click)="form.zuweisungTyp = 'gruppe'" class="flex-1 py-2 rounded-lg text-sm border"
              [class.bg-primary]="form.zuweisungTyp === 'gruppe'" [class.text-white]="form.zuweisungTyp === 'gruppe'">Gruppe</button>
          </div>
        </div>
        <div>
          <label class="text-xs font-medium text-gray-500 block mb-1">Gueltig von</label>
          <input [(ngModel)]="form.gueltigVon" type="date" class="input-field">
        </div>
        <div>
          <label class="text-xs font-medium text-gray-500 block mb-1">Gueltig bis</label>
          <input [(ngModel)]="form.gueltigBis" type="date" class="input-field">
        </div>
        <div>
          <label class="text-xs font-medium text-gray-500 block mb-1">Prioritaet</label>
          <select [(ngModel)]="form.prioritaet" class="input-field">
            <option value="hoch">Hoch</option>
            <option value="mittel">Mittel</option>
            <option value="niedrig">Niedrig</option>
          </select>
        </div>
      </div>
      <div class="flex gap-2 mt-4">
        <button class="btn-primary text-sm" (click)="saveRule()">Speichern</button>
        <button class="btn-secondary text-sm" (click)="showForm = false; editingId = null">Abbrechen</button>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap gap-3 mb-4">
      <input [(ngModel)]="searchTerm" placeholder="Regeln suchen..." class="input-field !w-auto flex-1 min-w-[200px]">
      <select [(ngModel)]="filterStatus" class="input-field !w-auto">
        <option value="">Alle</option>
        <option value="aktiv">Aktiv</option>
        <option value="abgelaufen">Abgelaufen</option>
      </select>
    </div>

    <!-- Rules Table -->
    <div class="card !p-0 overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-100/50 border-b">
          <tr>
            <th class="px-4 py-3 text-left font-medium text-gray-700 w-8"></th>
            <th class="px-4 py-3 text-left font-medium text-gray-700">Bezeichnung</th>
            <th class="px-4 py-3 text-left font-medium text-gray-700">Kriterium</th>
            <th class="px-4 py-3 text-left font-medium text-gray-700">Zugewiesen an</th>
            <th class="px-4 py-3 text-left font-medium text-gray-700">Produkt</th>
            <th class="px-4 py-3 text-left font-medium text-gray-700">Gueltigkeit</th>
            <th class="px-4 py-3 text-left font-medium text-gray-700">Prioritaet</th>
            <th class="px-4 py-3 text-right font-medium text-gray-700">Aktionen</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let rule of getFilteredRules()" class="border-b border-gray-400/5 hover:bg-gray-100/50">
            <td class="px-4 py-3">
              <span class="w-3 h-3 rounded-full inline-block" [class.bg-success]="isActive(rule)" [class.bg-gray-300]="!isActive(rule)"></span>
            </td>
            <td class="px-4 py-3">
              <div class="font-medium">{{rule.bezeichnung}}</div>
              <div *ngIf="rule.beschreibung" class="text-xs text-gray-400">{{rule.beschreibung}}</div>
            </td>
            <td class="px-4 py-3">
              <span class="badge badge-primary">{{rule.kriterium}}</span>
              <span class="font-mono text-xs ml-1">{{rule.kriteriumWert}}</span>
            </td>
            <td class="px-4 py-3 text-xs">{{rule.zugewiesen}}</td>
            <td class="px-4 py-3"><span class="badge badge-primary">{{rule.produkt}}</span></td>
            <td class="px-4 py-3 text-xs">{{rule.gueltigVon}} - {{rule.gueltigBis}}</td>
            <td class="px-4 py-3">
              <span class="badge" [ngClass]="{'badge-error': rule.prioritaet === 'hoch', 'badge-warning': rule.prioritaet === 'mittel', 'bg-gray-200 text-gray-600': rule.prioritaet === 'niedrig'}">
                {{rule.prioritaet}}
              </span>
            </td>
            <td class="px-4 py-3 text-right">
              <button class="text-xs text-primary hover:underline mr-2" (click)="editRule(rule)">Bearbeiten</button>
              <button class="text-xs text-error hover:underline" (click)="deleteRule(rule.id)">Loeschen</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `
})
export class AufgabensteuerungComponent {
  showForm = false;
  editingId: string | null = null;
  searchTerm = '';
  filterStatus = '';

  form: any = { bezeichnung: '', kriterium: 'IK_NUMMER', kriteriumWert: '', zuweisungTyp: 'mitarbeiter', gueltigVon: '2026-01-01', gueltigBis: '2026-12-31', prioritaet: 'mittel' };

  stats = [
    { label: 'Aktive Regeln', value: 10, color: '#28A745' },
    { label: 'Mitarbeiter-Zuweisungen', value: 6, color: '#006EC7' },
    { label: 'Gruppen-Zuweisungen', value: 4, color: '#461EBE' },
    { label: 'Abgelaufen', value: 2, color: '#887D75' },
  ];

  rules = [
    { id: 'az-1', bezeichnung: 'IK AOK Nordwest Abrechnung', kriterium: 'IK_NUMMER', kriteriumWert: '104212059', zugewiesen: 'Anna Schmidt', produkt: 'KV AI', gueltigVon: '01.01.2026', gueltigBis: '31.12.2026', prioritaet: 'hoch', beschreibung: 'Alle Abrechnungen mit IK der AOK NW' },
    { id: 'az-2', bezeichnung: 'PLZ-Bereich 44 Fallmanagement', kriterium: 'PLZ', kriteriumWert: '44*', zugewiesen: 'Fallmanagement (Gruppe)', produkt: 'smile KH', gueltigVon: '01.01.2026', gueltigBis: '31.12.2026', prioritaet: 'mittel', beschreibung: 'Faelle aus dem PLZ-Bereich 44' },
    { id: 'az-3', bezeichnung: 'IK Uniklinik Muenster', kriterium: 'IK_NUMMER', kriteriumWert: '260530014', zugewiesen: 'Claudia Meyer', produkt: 'smile KH', gueltigVon: '01.01.2026', gueltigBis: '30.06.2026', prioritaet: 'hoch', beschreibung: null },
    { id: 'az-4', bezeichnung: 'PLZ-Bereich 48 Arztregister', kriterium: 'PLZ', kriteriumWert: '48*', zugewiesen: 'Thomas Weber', produkt: 'Arztregister', gueltigVon: '01.01.2026', gueltigBis: '31.12.2026', prioritaet: 'niedrig', beschreibung: 'Leistungsorte im PLZ-Bereich 48' },
    { id: 'az-5', bezeichnung: 'Betriebsnr. Grossklinik', kriterium: 'BETRIEBSNUMMER', kriteriumWert: '12345678', zugewiesen: 'Abrechnungsteam Nord (Gruppe)', produkt: 'KV AI', gueltigVon: '01.01.2026', gueltigBis: '31.12.2026', prioritaet: 'hoch', beschreibung: null },
    { id: 'az-6', bezeichnung: 'Name Mueller WB', kriterium: 'NAME', kriteriumWert: 'Mueller', zugewiesen: 'Anna Schmidt', produkt: 'WB-Foerderung', gueltigVon: '01.02.2026', gueltigBis: '31.12.2026', prioritaet: 'mittel', beschreibung: 'WB-Antraege von Dr. Mueller' },
    { id: 'az-7', bezeichnung: 'IK TK Abrechnung', kriterium: 'IK_NUMMER', kriteriumWert: '101575519', zugewiesen: 'Abrechnungsteam Nord (Gruppe)', produkt: 'KV AI', gueltigVon: '01.06.2025', gueltigBis: '31.12.2025', prioritaet: 'mittel', beschreibung: 'Abgelaufene Regel fuer TK' },
    { id: 'az-8', bezeichnung: 'PLZ 80 Bayern', kriterium: 'PLZ', kriteriumWert: '80*', zugewiesen: 'Stefan Koch', produkt: 'smile KH', gueltigVon: '01.01.2026', gueltigBis: '31.12.2026', prioritaet: 'mittel', beschreibung: 'Faelle aus dem Muenchner Raum' },
    { id: 'az-9', bezeichnung: 'Geb. vor 1960', kriterium: 'GEBURTSDATUM', kriteriumWert: '< 01.01.1960', zugewiesen: 'Fallmanagement (Gruppe)', produkt: 'smile KH', gueltigVon: '01.01.2026', gueltigBis: '31.12.2026', prioritaet: 'hoch', beschreibung: 'Aeltere Patienten - spezielle Pruefung' },
    { id: 'az-10', bezeichnung: 'PLZ 10 Berlin', kriterium: 'PLZ', kriteriumWert: '10*', zugewiesen: 'Julia Wagner', produkt: 'Arztregister', gueltigVon: '01.01.2025', gueltigBis: '31.12.2025', prioritaet: 'niedrig', beschreibung: 'Abgelaufene Berliner Zuweisung' },
    { id: 'az-11', bezeichnung: 'IK Vivantes', kriterium: 'IK_NUMMER', kriteriumWert: '261101015', zugewiesen: 'Peter Becker', produkt: 'smile KH', gueltigVon: '01.03.2026', gueltigBis: '31.12.2026', prioritaet: 'hoch', beschreibung: null },
    { id: 'az-12', bezeichnung: 'Name Schmidt Abr.', kriterium: 'NAME', kriteriumWert: 'Schmidt', zugewiesen: 'KV-Verwaltung (Gruppe)', produkt: 'KV AI', gueltigVon: '01.01.2026', gueltigBis: '31.12.2026', prioritaet: 'niedrig', beschreibung: 'Abrechnungen mit Bezug zu Schmidt' },
  ];

  isActive(rule: any): boolean {
    const bis = new Date(rule.gueltigBis.split('.').reverse().join('-'));
    return bis >= new Date();
  }

  getFilteredRules() {
    return this.rules.filter(r => {
      if (this.searchTerm && !r.bezeichnung.toLowerCase().includes(this.searchTerm.toLowerCase())) return false;
      if (this.filterStatus === 'aktiv' && !this.isActive(r)) return false;
      if (this.filterStatus === 'abgelaufen' && this.isActive(r)) return false;
      return true;
    });
  }

  getPlaceholder(): string {
    const map: any = { IK_NUMMER: 'z.B. 104212059', PLZ: 'z.B. 44*', BETRIEBSNUMMER: 'z.B. 12345678', GEBURTSDATUM: 'z.B. < 01.01.1960', NAME: 'z.B. Mueller' };
    return map[this.form.kriterium] || '';
  }

  editRule(rule: any) {
    this.editingId = rule.id;
    this.form = { ...rule };
    this.showForm = true;
  }

  saveRule() {
    this.showForm = false;
    this.editingId = null;
  }

  deleteRule(id: string) {
    this.rules = this.rules.filter(r => r.id !== id);
  }
}
