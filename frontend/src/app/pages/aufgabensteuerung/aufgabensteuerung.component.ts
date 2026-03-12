import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KriteriumTyp, AufgabenZuweisung, AufgabenGruppe } from '../../models/aufgaben.model';

interface RuleDisplay extends AufgabenZuweisung {
  zugewiesenAnName: string;
  produktName: string;
}

@Component({
  selector: 'app-aufgabensteuerung',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 max-w-[1400px] mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-condensed font-semibold text-gray-900">Aufgabensteuerung</h1>
          <p class="text-sm text-gray-500 mt-1">Zuweisungsregeln fuer die automatische Aufgabenverteilung</p>
        </div>
        <button
          (click)="toggleForm()"
          class="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
          [class]="showForm()
            ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            : 'bg-primary text-white hover:bg-primary-dark'"
        >
          {{ showForm() ? 'Abbrechen' : 'Neue Regel anlegen' }}
        </button>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        @for (stat of stats; track stat.label) {
          <div class="bg-white rounded-lg border border-gray-200 p-4 shadow-card">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold" [style.background-color]="stat.color">
                {{ stat.value }}
              </div>
              <div class="text-xs text-gray-500">{{ stat.label }}</div>
            </div>
          </div>
        }
      </div>

      <!-- Inline Form -->
      @if (showForm()) {
        <div class="bg-white rounded-lg border-2 border-primary/20 shadow-card p-6 mb-6">
          <h3 class="text-sm font-semibold text-gray-900 mb-4">{{ editingId() ? 'Regel bearbeiten' : 'Neue Regel anlegen' }}</h3>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <!-- Bezeichnung -->
            <div>
              <label class="text-xs font-medium text-gray-500 block mb-1">Bezeichnung *</label>
              <input
                [ngModel]="form().bezeichnung"
                (ngModelChange)="updateForm('bezeichnung', $event)"
                class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Name der Regel"
              />
            </div>

            <!-- Kriterium -->
            <div>
              <label class="text-xs font-medium text-gray-500 block mb-1">Kriterium *</label>
              <select
                [ngModel]="form().kriterium"
                (ngModelChange)="updateForm('kriterium', $event)"
                class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="IK_NUMMER">IK-Nummer</option>
                <option value="PLZ">PLZ</option>
                <option value="BETRIEBSNUMMER">Betriebsnummer</option>
                <option value="GEBURTSDATUM">Geburtsdatum</option>
                <option value="NAME">Name</option>
              </select>
            </div>

            <!-- Kriterium Wert -->
            <div>
              <label class="text-xs font-medium text-gray-500 block mb-1">Kriterium-Wert *</label>
              <input
                [ngModel]="form().kriteriumWert"
                (ngModelChange)="updateForm('kriteriumWert', $event)"
                class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                [placeholder]="getPlaceholder(form().kriterium)"
              />
            </div>

            <!-- Zuweisungstyp Toggle -->
            <div>
              <label class="text-xs font-medium text-gray-500 block mb-1">Zuweisungstyp</label>
              <div class="flex rounded-lg border border-gray-200 overflow-hidden">
                <button
                  (click)="updateForm('zuweisungTyp', 'mitarbeiter')"
                  class="flex-1 py-2 text-sm font-medium transition-colors"
                  [class]="form().zuweisungTyp === 'mitarbeiter'
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-500 hover:bg-gray-50'"
                >
                  Mitarbeiter
                </button>
                <button
                  (click)="updateForm('zuweisungTyp', 'gruppe')"
                  class="flex-1 py-2 text-sm font-medium transition-colors border-l border-gray-200"
                  [class]="form().zuweisungTyp === 'gruppe'
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-500 hover:bg-gray-50'"
                >
                  Gruppe
                </button>
              </div>
            </div>

            <!-- Mitarbeiter / Gruppe Select -->
            <div>
              <label class="text-xs font-medium text-gray-500 block mb-1">
                {{ form().zuweisungTyp === 'mitarbeiter' ? 'Mitarbeiter' : 'Gruppe' }} *
              </label>
              @if (form().zuweisungTyp === 'mitarbeiter') {
                <select
                  [ngModel]="form().mitarbeiterId"
                  (ngModelChange)="updateForm('mitarbeiterId', $event)"
                  class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="">-- Mitarbeiter waehlen --</option>
                  @for (ma of mitarbeiter; track ma.id) {
                    <option [value]="ma.id">{{ ma.name }}</option>
                  }
                </select>
              } @else {
                <select
                  [ngModel]="form().gruppeId"
                  (ngModelChange)="updateForm('gruppeId', $event)"
                  class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="">-- Gruppe waehlen --</option>
                  @for (g of gruppen; track g.id) {
                    <option [value]="g.id">{{ g.name }}</option>
                  }
                </select>
              }
            </div>

            <!-- Produkt -->
            <div>
              <label class="text-xs font-medium text-gray-500 block mb-1">Produkt *</label>
              <select
                [ngModel]="form().produktId"
                (ngModelChange)="updateForm('produktId', $event)"
                class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">-- Produkt waehlen --</option>
                @for (p of produkte; track p.id) {
                  <option [value]="p.id">{{ p.name }}</option>
                }
              </select>
            </div>

            <!-- Gueltig Von -->
            <div>
              <label class="text-xs font-medium text-gray-500 block mb-1">Gueltig von</label>
              <input
                type="date"
                [ngModel]="form().gueltigVon"
                (ngModelChange)="updateForm('gueltigVon', $event)"
                class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <!-- Gueltig Bis -->
            <div>
              <label class="text-xs font-medium text-gray-500 block mb-1">Gueltig bis</label>
              <input
                type="date"
                [ngModel]="form().gueltigBis"
                (ngModelChange)="updateForm('gueltigBis', $event)"
                class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <!-- Prioritaet -->
            <div>
              <label class="text-xs font-medium text-gray-500 block mb-1">Prioritaet</label>
              <select
                [ngModel]="form().prioritaet"
                (ngModelChange)="updateForm('prioritaet', $event)"
                class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="hoch">Hoch</option>
                <option value="mittel">Mittel</option>
                <option value="niedrig">Niedrig</option>
              </select>
            </div>
          </div>

          <!-- Beschreibung -->
          <div class="mt-4">
            <label class="text-xs font-medium text-gray-500 block mb-1">Beschreibung</label>
            <textarea
              [ngModel]="form().beschreibung"
              (ngModelChange)="updateForm('beschreibung', $event)"
              class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              rows="2"
              placeholder="Optionale Beschreibung der Regel"
            ></textarea>
          </div>

          <!-- Actions -->
          <div class="flex gap-2 mt-4">
            <button (click)="saveRule()" class="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
              Speichern
            </button>
            <button (click)="cancelForm()" class="px-4 py-2 text-sm font-medium bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
              Abbrechen
            </button>
          </div>
        </div>
      }

      <!-- Filters -->
      <div class="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="Regeln suchen..."
          [ngModel]="searchTerm()"
          (ngModelChange)="searchTerm.set($event)"
          class="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary flex-1 min-w-[200px] max-w-xs"
        />
        <select
          [ngModel]="filterMitarbeiter()"
          (ngModelChange)="filterMitarbeiter.set($event)"
          class="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        >
          <option value="">Alle Mitarbeiter</option>
          @for (ma of mitarbeiter; track ma.id) {
            <option [value]="ma.id">{{ ma.name }}</option>
          }
        </select>
        <select
          [ngModel]="filterGruppe()"
          (ngModelChange)="filterGruppe.set($event)"
          class="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        >
          <option value="">Alle Gruppen</option>
          @for (g of gruppen; track g.id) {
            <option [value]="g.id">{{ g.name }}</option>
          }
        </select>
        <select
          [ngModel]="filterProdukt()"
          (ngModelChange)="filterProdukt.set($event)"
          class="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        >
          <option value="">Alle Produkte</option>
          @for (p of produkte; track p.id) {
            <option [value]="p.id">{{ p.name }}</option>
          }
        </select>
        <select
          [ngModel]="filterStatus()"
          (ngModelChange)="filterStatus.set($event)"
          class="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        >
          <option value="">Alle</option>
          <option value="aktiv">Aktiv</option>
          <option value="abgelaufen">Abgelaufen</option>
        </select>
      </div>

      <!-- Rules Table -->
      <div class="bg-white rounded-lg border border-gray-200 shadow-card overflow-hidden">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-200">
              <th class="text-left px-4 py-3 font-medium text-gray-600 w-10"></th>
              <th class="text-left px-4 py-3 font-medium text-gray-600">Bezeichnung</th>
              <th class="text-left px-4 py-3 font-medium text-gray-600">Kriterium</th>
              <th class="text-left px-4 py-3 font-medium text-gray-600">Zugewiesen an</th>
              <th class="text-left px-4 py-3 font-medium text-gray-600">Produkt</th>
              <th class="text-left px-4 py-3 font-medium text-gray-600">Gueltigkeit</th>
              <th class="text-left px-4 py-3 font-medium text-gray-600">Prioritaet</th>
              <th class="text-right px-4 py-3 font-medium text-gray-600">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            @for (rule of filteredRules(); track rule.id) {
              <tr class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <!-- Status icon -->
                <td class="px-4 py-3">
                  @if (isActive(rule)) {
                    <svg class="w-5 h-5 text-success" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                  } @else {
                    <svg class="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                    </svg>
                  }
                </td>

                <!-- Bezeichnung + Beschreibung -->
                <td class="px-4 py-3">
                  <div class="font-medium text-gray-900">{{ rule.bezeichnung }}</div>
                  @if (rule.beschreibung) {
                    <div class="text-xs text-gray-400 mt-0.5">{{ rule.beschreibung }}</div>
                  }
                </td>

                <!-- Kriterium Badge -->
                <td class="px-4 py-3">
                  <div class="flex items-center gap-1.5">
                    <span class="text-xs px-1.5 py-0.5 rounded font-medium" [class]="kriteriumClass(rule.kriterium)">
                      {{ kriteriumLabel(rule.kriterium) }}
                    </span>
                    <code class="text-xs font-mono text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded">{{ rule.kriteriumWert }}</code>
                  </div>
                </td>

                <!-- Zugewiesen an -->
                <td class="px-4 py-3">
                  <div class="flex items-center gap-1.5">
                    @if (rule.zuweisungTyp === 'gruppe') {
                      <svg class="w-4 h-4 text-accent-violet" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                    } @else {
                      <svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                      </svg>
                    }
                    <span class="text-sm text-gray-700">{{ rule.zugewiesenAnName }}</span>
                  </div>
                </td>

                <!-- Produkt -->
                <td class="px-4 py-3">
                  <span class="inline-flex px-2 py-0.5 rounded text-xs font-medium"
                    [style.background-color]="getProduktColor(rule.produktId) + '15'"
                    [style.color]="getProduktColor(rule.produktId)">
                    {{ rule.produktName }}
                  </span>
                </td>

                <!-- Gueltigkeit -->
                <td class="px-4 py-3 text-xs text-gray-500">
                  {{ rule.gueltigVon }} - {{ rule.gueltigBis }}
                </td>

                <!-- Prioritaet -->
                <td class="px-4 py-3">
                  <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium" [class]="prioritaetClass(rule.prioritaet)">
                    {{ rule.prioritaet }}
                  </span>
                </td>

                <!-- Actions -->
                <td class="px-4 py-3 text-right">
                  <button (click)="editRule(rule)" class="text-xs text-primary hover:underline mr-3">Bearbeiten</button>
                  <button (click)="deleteRule(rule.id)" class="text-xs text-error hover:underline">Loeschen</button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class AufgabensteuerungComponent {
  readonly showForm = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly searchTerm = signal('');
  readonly filterMitarbeiter = signal('');
  readonly filterGruppe = signal('');
  readonly filterProdukt = signal('');
  readonly filterStatus = signal('');

  private readonly defaultForm = {
    bezeichnung: '',
    kriterium: 'IK_NUMMER' as KriteriumTyp,
    kriteriumWert: '',
    zuweisungTyp: 'mitarbeiter' as 'mitarbeiter' | 'gruppe',
    mitarbeiterId: '',
    gruppeId: '',
    produktId: '',
    gueltigVon: '2026-01-01',
    gueltigBis: '2026-12-31',
    prioritaet: 'mittel' as 'hoch' | 'mittel' | 'niedrig',
    beschreibung: '',
  };

  readonly form = signal({ ...this.defaultForm });

  readonly stats = [
    { label: 'Aktive Regeln', value: 10, color: '#28A745' },
    { label: 'Mitarbeiter-Zuweisungen', value: 6, color: '#006EC7' },
    { label: 'Gruppen-Zuweisungen', value: 4, color: '#461EBE' },
    { label: 'Abgelaufen', value: 2, color: '#887D75' },
  ];

  readonly mitarbeiter = [
    { id: 'ma1', name: 'Anna Schmidt' },
    { id: 'ma2', name: 'Claudia Meyer' },
    { id: 'ma3', name: 'Thomas Weber' },
    { id: 'ma4', name: 'Stefan Koch' },
    { id: 'ma5', name: 'Julia Wagner' },
    { id: 'ma6', name: 'Peter Becker' },
  ];

  readonly gruppen: AufgabenGruppe[] = [
    { id: 'g1', name: 'Fallmanagement', beschreibung: 'Team Fallmanagement', mitgliederIds: ['ma2', 'ma4'] },
    { id: 'g2', name: 'Abrechnungsteam Nord', beschreibung: 'Abrechnungsteam Norddeutschland', mitgliederIds: ['ma1', 'ma3'] },
    { id: 'g3', name: 'KV-Verwaltung', beschreibung: 'Kassenversicherungs-Verwaltung', mitgliederIds: ['ma5', 'ma6'] },
    { id: 'g4', name: 'Pruefungsteam Sued', beschreibung: 'Pruefungsteam Sueddeutschland', mitgliederIds: ['ma4', 'ma6'] },
  ];

  readonly produkte = [
    { id: 'kv-ai', name: 'KV AI Abrechnung', color: '#006EC7' },
    { id: 'smile-kh', name: 'SMILE KH', color: '#28DCAA' },
    { id: 'arztregister', name: 'Arztregister', color: '#FF9868' },
    { id: 'wb-foerderung', name: 'WB-Foerderung', color: '#461EBE' },
  ];

  readonly rules = signal<RuleDisplay[]>([
    { id: 'az-1', bezeichnung: 'IK AOK Nordwest Abrechnung', kriterium: 'IK_NUMMER', kriteriumWert: '104212059', zuweisungTyp: 'mitarbeiter', mitarbeiterId: 'ma1', produktId: 'kv-ai', gueltigVon: '2026-01-01', gueltigBis: '2026-12-31', prioritaet: 'hoch', erstelltAm: '2025-12-15', erstelltVon: 'Admin', beschreibung: 'Alle Abrechnungen mit IK der AOK NW', zugewiesenAnName: 'Anna Schmidt', produktName: 'KV AI Abrechnung' },
    { id: 'az-2', bezeichnung: 'PLZ-Bereich 44 Fallmanagement', kriterium: 'PLZ', kriteriumWert: '44*', zuweisungTyp: 'gruppe', gruppeId: 'g1', produktId: 'smile-kh', gueltigVon: '2026-01-01', gueltigBis: '2026-12-31', prioritaet: 'mittel', erstelltAm: '2025-12-20', erstelltVon: 'Admin', beschreibung: 'Faelle aus dem PLZ-Bereich 44', zugewiesenAnName: 'Fallmanagement', produktName: 'SMILE KH' },
    { id: 'az-3', bezeichnung: 'IK Uniklinik Muenster', kriterium: 'IK_NUMMER', kriteriumWert: '260530014', zuweisungTyp: 'mitarbeiter', mitarbeiterId: 'ma2', produktId: 'smile-kh', gueltigVon: '2026-01-01', gueltigBis: '2026-06-30', prioritaet: 'hoch', erstelltAm: '2025-12-22', erstelltVon: 'Admin', zugewiesenAnName: 'Claudia Meyer', produktName: 'SMILE KH' },
    { id: 'az-4', bezeichnung: 'PLZ-Bereich 48 Arztregister', kriterium: 'PLZ', kriteriumWert: '48*', zuweisungTyp: 'mitarbeiter', mitarbeiterId: 'ma3', produktId: 'arztregister', gueltigVon: '2026-01-01', gueltigBis: '2026-12-31', prioritaet: 'niedrig', erstelltAm: '2026-01-05', erstelltVon: 'Admin', beschreibung: 'Leistungsorte im PLZ-Bereich 48', zugewiesenAnName: 'Thomas Weber', produktName: 'Arztregister' },
    { id: 'az-5', bezeichnung: 'Betriebsnr. Grossklinik', kriterium: 'BETRIEBSNUMMER', kriteriumWert: '12345678', zuweisungTyp: 'gruppe', gruppeId: 'g2', produktId: 'kv-ai', gueltigVon: '2026-01-01', gueltigBis: '2026-12-31', prioritaet: 'hoch', erstelltAm: '2026-01-10', erstelltVon: 'Admin', zugewiesenAnName: 'Abrechnungsteam Nord', produktName: 'KV AI Abrechnung' },
    { id: 'az-6', bezeichnung: 'Name Mueller WB', kriterium: 'NAME', kriteriumWert: 'Mueller', zuweisungTyp: 'mitarbeiter', mitarbeiterId: 'ma1', produktId: 'wb-foerderung', gueltigVon: '2026-02-01', gueltigBis: '2026-12-31', prioritaet: 'mittel', erstelltAm: '2026-01-28', erstelltVon: 'Admin', beschreibung: 'WB-Antraege von Dr. Mueller', zugewiesenAnName: 'Anna Schmidt', produktName: 'WB-Foerderung' },
    { id: 'az-7', bezeichnung: 'IK TK Abrechnung', kriterium: 'IK_NUMMER', kriteriumWert: '101575519', zuweisungTyp: 'gruppe', gruppeId: 'g2', produktId: 'kv-ai', gueltigVon: '2025-06-01', gueltigBis: '2025-12-31', prioritaet: 'mittel', erstelltAm: '2025-05-15', erstelltVon: 'Admin', beschreibung: 'Abgelaufene Regel fuer TK', zugewiesenAnName: 'Abrechnungsteam Nord', produktName: 'KV AI Abrechnung' },
    { id: 'az-8', bezeichnung: 'PLZ 80 Bayern', kriterium: 'PLZ', kriteriumWert: '80*', zuweisungTyp: 'mitarbeiter', mitarbeiterId: 'ma4', produktId: 'smile-kh', gueltigVon: '2026-01-01', gueltigBis: '2026-12-31', prioritaet: 'mittel', erstelltAm: '2026-01-15', erstelltVon: 'Admin', beschreibung: 'Faelle aus dem Muenchner Raum', zugewiesenAnName: 'Stefan Koch', produktName: 'SMILE KH' },
    { id: 'az-9', bezeichnung: 'Geb. vor 1960', kriterium: 'GEBURTSDATUM', kriteriumWert: '< 01.01.1960', zuweisungTyp: 'gruppe', gruppeId: 'g1', produktId: 'smile-kh', gueltigVon: '2026-01-01', gueltigBis: '2026-12-31', prioritaet: 'hoch', erstelltAm: '2026-02-01', erstelltVon: 'Admin', beschreibung: 'Aeltere Patienten - spezielle Pruefung', zugewiesenAnName: 'Fallmanagement', produktName: 'SMILE KH' },
    { id: 'az-10', bezeichnung: 'PLZ 10 Berlin', kriterium: 'PLZ', kriteriumWert: '10*', zuweisungTyp: 'mitarbeiter', mitarbeiterId: 'ma5', produktId: 'arztregister', gueltigVon: '2025-01-01', gueltigBis: '2025-12-31', prioritaet: 'niedrig', erstelltAm: '2024-12-15', erstelltVon: 'Admin', beschreibung: 'Abgelaufene Berliner Zuweisung', zugewiesenAnName: 'Julia Wagner', produktName: 'Arztregister' },
    { id: 'az-11', bezeichnung: 'IK Vivantes', kriterium: 'IK_NUMMER', kriteriumWert: '261101015', zuweisungTyp: 'mitarbeiter', mitarbeiterId: 'ma6', produktId: 'smile-kh', gueltigVon: '2026-03-01', gueltigBis: '2026-12-31', prioritaet: 'hoch', erstelltAm: '2026-02-20', erstelltVon: 'Admin', zugewiesenAnName: 'Peter Becker', produktName: 'SMILE KH' },
    { id: 'az-12', bezeichnung: 'Name Schmidt Abr.', kriterium: 'NAME', kriteriumWert: 'Schmidt', zuweisungTyp: 'gruppe', gruppeId: 'g3', produktId: 'kv-ai', gueltigVon: '2026-01-01', gueltigBis: '2026-12-31', prioritaet: 'niedrig', erstelltAm: '2026-01-20', erstelltVon: 'Admin', beschreibung: 'Abrechnungen mit Bezug zu Schmidt', zugewiesenAnName: 'KV-Verwaltung', produktName: 'KV AI Abrechnung' },
  ]);

  readonly filteredRules = computed(() => {
    let result = this.rules();
    const search = this.searchTerm().toLowerCase();
    if (search) {
      result = result.filter(r =>
        r.bezeichnung.toLowerCase().includes(search) ||
        r.kriteriumWert.toLowerCase().includes(search) ||
        (r.beschreibung?.toLowerCase().includes(search) ?? false)
      );
    }
    const ma = this.filterMitarbeiter();
    if (ma) {
      result = result.filter(r => r.zuweisungTyp === 'mitarbeiter' && r.mitarbeiterId === ma);
    }
    const gr = this.filterGruppe();
    if (gr) {
      result = result.filter(r => r.zuweisungTyp === 'gruppe' && r.gruppeId === gr);
    }
    const prod = this.filterProdukt();
    if (prod) {
      result = result.filter(r => r.produktId === prod);
    }
    const status = this.filterStatus();
    if (status === 'aktiv') {
      result = result.filter(r => this.isActive(r));
    } else if (status === 'abgelaufen') {
      result = result.filter(r => !this.isActive(r));
    }
    return result;
  });

  isActive(rule: RuleDisplay): boolean {
    return new Date(rule.gueltigBis) >= new Date('2026-03-12');
  }

  toggleForm(): void {
    if (this.showForm()) {
      this.cancelForm();
    } else {
      this.showForm.set(true);
      this.editingId.set(null);
      this.form.set({ ...this.defaultForm });
    }
  }

  cancelForm(): void {
    this.showForm.set(false);
    this.editingId.set(null);
    this.form.set({ ...this.defaultForm });
  }

  updateForm(key: string, value: any): void {
    this.form.set({ ...this.form(), [key]: value });
  }

  saveRule(): void {
    this.showForm.set(false);
    this.editingId.set(null);
    this.form.set({ ...this.defaultForm });
  }

  editRule(rule: RuleDisplay): void {
    this.editingId.set(rule.id);
    this.form.set({
      bezeichnung: rule.bezeichnung,
      kriterium: rule.kriterium,
      kriteriumWert: rule.kriteriumWert,
      zuweisungTyp: rule.zuweisungTyp,
      mitarbeiterId: rule.mitarbeiterId ?? '',
      gruppeId: rule.gruppeId ?? '',
      produktId: rule.produktId,
      gueltigVon: rule.gueltigVon,
      gueltigBis: rule.gueltigBis,
      prioritaet: rule.prioritaet,
      beschreibung: rule.beschreibung ?? '',
    });
    this.showForm.set(true);
  }

  deleteRule(id: string): void {
    this.rules.set(this.rules().filter(r => r.id !== id));
  }

  getPlaceholder(kriterium: string): string {
    const map: Record<string, string> = {
      IK_NUMMER: 'z.B. 104212059',
      PLZ: 'z.B. 44*',
      BETRIEBSNUMMER: 'z.B. 12345678',
      GEBURTSDATUM: 'z.B. < 01.01.1960',
      NAME: 'z.B. Mueller',
    };
    return map[kriterium] ?? '';
  }

  kriteriumLabel(kriterium: KriteriumTyp): string {
    const map: Record<string, string> = {
      IK_NUMMER: 'IK-Nr.',
      PLZ: 'PLZ',
      BETRIEBSNUMMER: 'Betr.-Nr.',
      GEBURTSDATUM: 'Geb.-Dat.',
      NAME: 'Name',
    };
    return map[kriterium] ?? kriterium;
  }

  kriteriumClass(kriterium: KriteriumTyp): string {
    switch (kriterium) {
      case 'IK_NUMMER': return 'bg-primary/10 text-primary';
      case 'PLZ': return 'bg-accent-turquoise/10 text-accent-turquoise';
      case 'BETRIEBSNUMMER': return 'bg-accent-orange/10 text-accent-orange';
      case 'GEBURTSDATUM': return 'bg-accent-pink/10 text-accent-pink';
      case 'NAME': return 'bg-accent-violet/10 text-accent-violet';
      default: return 'bg-gray-100 text-gray-500';
    }
  }

  prioritaetClass(p: string): string {
    switch (p) {
      case 'hoch': return 'bg-error/10 text-error';
      case 'mittel': return 'bg-warning/10 text-warning';
      case 'niedrig': return 'bg-gray-100 text-gray-500';
      default: return 'bg-gray-100 text-gray-500';
    }
  }

  getProduktColor(produktId: string): string {
    return this.produkte.find(p => p.id === produktId)?.color ?? '#887D75';
  }
}
