import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-wb-foerderung',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- PAGE HEADER -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900" style="font-family: 'Fira Sans', sans-serif">Weiterbildungsfoerderung</h1>
      <p class="text-sm text-gray-500 mt-1">Verwaltung der aerztlichen Weiterbildung und Foerderung</p>
    </div>

    <!-- TABS -->
    <div class="flex border-b border-gray-200 mb-6">
      <button *ngFor="let tab of tabs" (click)="activeTab = tab"
        [class]="activeTab === tab ? 'border-b-2 border-[#006EC7] text-[#006EC7] px-4 py-3 text-sm font-medium whitespace-nowrap' : 'border-b-2 border-transparent text-gray-400 px-4 py-3 text-sm font-medium hover:text-gray-600 whitespace-nowrap transition-colors'">
        {{ tab }}
      </button>
    </div>

    <!-- ===================== TAB 1: STAMMDATEN ===================== -->
    <div *ngIf="activeTab === 'Stammdaten'">

      <!-- Fachgebiete Panel -->
      <div class="bg-white rounded-xl border border-gray-200 mb-4 overflow-hidden">
        <button (click)="panels.fachgebiete = !panels.fachgebiete"
          class="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
          <h3 class="text-base font-semibold text-gray-900">Fachgebiete</h3>
          <svg class="w-5 h-5 text-gray-400 transition-transform" [class.rotate-180]="panels.fachgebiete" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
          </svg>
        </button>
        <div *ngIf="panels.fachgebiete" class="px-6 pb-4">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-gray-200">
                  <th class="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Code</th>
                  <th class="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Bezeichnung</th>
                  <th class="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fachgruppe</th>
                  <th class="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let fg of fachgebiete" class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td class="py-3 px-3 font-mono text-gray-600">{{ fg.code }}</td>
                  <td class="py-3 px-3 font-medium text-gray-900">{{ fg.bezeichnung }}</td>
                  <td class="py-3 px-3 text-gray-600">{{ fg.fachgruppe }}</td>
                  <td class="py-3 px-3">
                    <span class="inline-block px-2.5 py-1 text-xs font-semibold rounded-full"
                      [ngClass]="{
                        'bg-green-50 text-green-700': fg.status === 'aktiv',
                        'bg-red-50 text-red-600': fg.status === 'inaktiv'
                      }">{{ fg.status }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- WB-Ermaechtigte Panel -->
      <div class="bg-white rounded-xl border border-gray-200 mb-4 overflow-hidden">
        <button (click)="panels.ermaechtigte = !panels.ermaechtigte"
          class="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
          <h3 class="text-base font-semibold text-gray-900">WB-Ermaechtigte</h3>
          <svg class="w-5 h-5 text-gray-400 transition-transform" [class.rotate-180]="panels.ermaechtigte" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
          </svg>
        </button>
        <div *ngIf="panels.ermaechtigte" class="px-6 pb-4">
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <div *ngFor="let e of ermaechtigte" class="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
              <div class="flex items-start justify-between mb-3">
                <div>
                  <p class="text-sm font-semibold text-gray-900">{{ e.name }}</p>
                  <p class="text-xs text-gray-500">LANR: {{ e.lanr }}</p>
                </div>
              </div>
              <p class="text-xs text-gray-600 mb-1">{{ e.fachgebiet }}</p>
              <p class="text-xs text-gray-500 mb-3">{{ e.praxis }}</p>
              <div>
                <div class="flex items-center justify-between mb-1">
                  <span class="text-xs text-gray-500">Auslastung</span>
                  <span class="text-xs font-semibold" [ngClass]="e.auslastung > 80 ? 'text-red-600' : e.auslastung > 50 ? 'text-yellow-600' : 'text-green-600'">{{ e.auslastung }}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div class="h-2 rounded-full transition-all"
                    [style.width.%]="e.auslastung"
                    [ngClass]="{
                      'bg-green-500': e.auslastung <= 50,
                      'bg-yellow-500': e.auslastung > 50 && e.auslastung <= 80,
                      'bg-red-500': e.auslastung > 80
                    }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- WB-Befugnisse Panel -->
      <div class="bg-white rounded-xl border border-gray-200 mb-4 overflow-hidden">
        <button (click)="panels.befugnisse = !panels.befugnisse"
          class="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
          <h3 class="text-base font-semibold text-gray-900">WB-Befugnisse</h3>
          <svg class="w-5 h-5 text-gray-400 transition-transform" [class.rotate-180]="panels.befugnisse" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
          </svg>
        </button>
        <div *ngIf="panels.befugnisse" class="px-6 pb-4">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-gray-200">
                  <th class="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ermaechtigter</th>
                  <th class="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fachgebiet</th>
                  <th class="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Max. Dauer (Monate)</th>
                  <th class="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let b of befugnisse" class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td class="py-3 px-3 font-medium text-gray-900">{{ b.ermaechtigter }}</td>
                  <td class="py-3 px-3 text-gray-600">{{ b.fachgebiet }}</td>
                  <td class="py-3 px-3 text-gray-600">{{ b.maxDauer }}</td>
                  <td class="py-3 px-3">
                    <span class="inline-block px-2.5 py-1 text-xs font-semibold rounded-full"
                      [ngClass]="{
                        'bg-green-50 text-green-700': b.status === 'aktiv',
                        'bg-red-50 text-red-600': b.status === 'abgelaufen',
                        'bg-yellow-50 text-yellow-700': b.status === 'beantragt'
                      }">{{ b.status }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Sonstige Weiterbilder Panel -->
      <div class="bg-white rounded-xl border border-gray-200 mb-4 overflow-hidden">
        <button (click)="panels.sonstige = !panels.sonstige"
          class="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
          <h3 class="text-base font-semibold text-gray-900">Sonstige Weiterbilder</h3>
          <svg class="w-5 h-5 text-gray-400 transition-transform" [class.rotate-180]="panels.sonstige" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
          </svg>
        </button>
        <div *ngIf="panels.sonstige" class="px-6 pb-4">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-gray-200">
                  <th class="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Schluessel</th>
                  <th class="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Bezeichnung</th>
                  <th class="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Typ</th>
                  <th class="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ort</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let sw of sonstigeWeiterbilder" class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td class="py-3 px-3 font-mono text-gray-600">{{ sw.schluessel }}</td>
                  <td class="py-3 px-3 font-medium text-gray-900">{{ sw.bezeichnung }}</td>
                  <td class="py-3 px-3">
                    <span class="inline-block px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">{{ sw.typ }}</span>
                  </td>
                  <td class="py-3 px-3 text-gray-600">{{ sw.ort }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Aerzte in Weiterbildung Panel -->
      <div class="bg-white rounded-xl border border-gray-200 mb-4 overflow-hidden">
        <button (click)="panels.aerzteInWb = !panels.aerzteInWb"
          class="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
          <h3 class="text-base font-semibold text-gray-900">Aerzte in Weiterbildung</h3>
          <svg class="w-5 h-5 text-gray-400 transition-transform" [class.rotate-180]="panels.aerzteInWb" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
          </svg>
        </button>
        <div *ngIf="panels.aerzteInWb" class="px-6 pb-4">
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <div *ngFor="let a of aerzteInWb" class="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
              <div class="flex items-start justify-between mb-2">
                <p class="text-sm font-semibold text-gray-900">{{ a.name }}</p>
                <span class="inline-block px-2 py-0.5 text-xs font-semibold rounded-full"
                  [ngClass]="{
                    'bg-green-50 text-green-700': a.status === 'aktiv',
                    'bg-blue-50 text-blue-700': a.status === 'abgeschlossen',
                    'bg-orange-50 text-orange-700': a.status === 'unterbrochen'
                  }">{{ a.status }}</span>
              </div>
              <p class="text-xs text-gray-600 mb-1">{{ a.fachgebiet }}</p>
              <p class="text-xs text-gray-500">Approbation: {{ a.approbationsdatum }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ===================== TAB 2: WB-ABSCHNITTE ===================== -->
    <div *ngIf="activeTab === 'WB-Abschnitte'">
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <h3 class="text-base font-semibold text-gray-900 mb-4">Weiterbildungsabschnitte</h3>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-gray-200">
                <th class="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Arzt</th>
                <th class="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Typ</th>
                <th class="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Weiterbilder</th>
                <th class="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Zeitraum</th>
                <th class="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Dauer (Monate)</th>
                <th class="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Foerderung</th>
                <th class="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Erhoehung</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let ab of wbAbschnitte" class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td class="py-3 px-3 font-medium text-gray-900">{{ ab.arzt }}</td>
                <td class="py-3 px-3">
                  <span class="inline-block px-2.5 py-1 text-xs font-semibold rounded-full"
                    [ngClass]="ab.typ === 'ambulant' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'">{{ ab.typ }}</span>
                </td>
                <td class="py-3 px-3 text-gray-600">{{ ab.weiterbilder }}</td>
                <td class="py-3 px-3 text-gray-600 whitespace-nowrap">{{ ab.von }} - {{ ab.bis }}</td>
                <td class="py-3 px-3 text-gray-600">{{ ab.dauer }}</td>
                <td class="py-3 px-3">
                  <span class="inline-block px-2.5 py-1 text-xs font-semibold rounded-full"
                    [ngClass]="ab.foerderung ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'">{{ ab.foerderung ? 'ja' : 'nein' }}</span>
                </td>
                <td class="py-3 px-3 text-gray-600">{{ ab.erhoehung }}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ===================== TAB 3: ANTRAEGE ===================== -->
    <div *ngIf="activeTab === 'Antraege'">
      <!-- Sub-tabs -->
      <div class="flex gap-2 mb-4">
        <button *ngFor="let st of antraegeSubTabs" (click)="activeAntraegeSubTab = st"
          class="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
          [ngClass]="activeAntraegeSubTab === st ? 'bg-[#006EC7] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'">
          {{ st }}
        </button>
      </div>

      <!-- Beschaeftigung -->
      <div *ngIf="activeAntraegeSubTab === 'Beschaeftigung'" class="bg-white rounded-xl border border-gray-200 p-6">
        <h3 class="text-base font-semibold text-gray-900 mb-4">Beschaeftigungsantraege</h3>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-gray-200">
                <th class="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Antrag-Nr</th>
                <th class="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Arzt</th>
                <th class="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th class="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Datum</th>
                <th class="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Checkliste</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let a of antraegeBeschaeftigung" class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td class="py-3 px-3 font-mono text-gray-600">{{ a.nr }}</td>
                <td class="py-3 px-3 font-medium text-gray-900">{{ a.arzt }}</td>
                <td class="py-3 px-3">
                  <span class="inline-block px-2.5 py-1 text-xs font-semibold rounded-full"
                    [ngClass]="{
                      'bg-blue-50 text-blue-700': a.status === 'eingereicht',
                      'bg-yellow-50 text-yellow-700': a.status === 'in_pruefung',
                      'bg-green-50 text-green-700': a.status === 'genehmigt',
                      'bg-red-50 text-red-600': a.status === 'abgelehnt'
                    }">{{ a.status }}</span>
                </td>
                <td class="py-3 px-3 text-gray-600">{{ a.datum }}</td>
                <td class="py-3 px-3">
                  <div class="flex items-center gap-2">
                    <div class="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                      <div class="h-2 rounded-full bg-[#006EC7]" [style.width.%]="a.checklisteProgress"></div>
                    </div>
                    <span class="text-xs text-gray-500">{{ a.checklisteProgress }}%</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Zuschuss -->
      <div *ngIf="activeAntraegeSubTab === 'Zuschuss'" class="bg-white rounded-xl border border-gray-200 p-6">
        <h3 class="text-base font-semibold text-gray-900 mb-4">Zuschussantraege</h3>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-gray-200">
                <th class="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Antrag-Nr</th>
                <th class="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Arzt</th>
                <th class="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Betrag (EUR)</th>
                <th class="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th class="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Datum</th>
                <th class="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Checkliste</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let a of antraegeZuschuss" class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td class="py-3 px-3 font-mono text-gray-600">{{ a.nr }}</td>
                <td class="py-3 px-3 font-medium text-gray-900">{{ a.arzt }}</td>
                <td class="py-3 px-3 text-gray-900 font-medium">{{ a.betrag | number:'1.2-2' }}</td>
                <td class="py-3 px-3">
                  <span class="inline-block px-2.5 py-1 text-xs font-semibold rounded-full"
                    [ngClass]="{
                      'bg-blue-50 text-blue-700': a.status === 'eingereicht',
                      'bg-yellow-50 text-yellow-700': a.status === 'in_pruefung',
                      'bg-green-50 text-green-700': a.status === 'genehmigt',
                      'bg-red-50 text-red-600': a.status === 'abgelehnt'
                    }">{{ a.status }}</span>
                </td>
                <td class="py-3 px-3 text-gray-600">{{ a.datum }}</td>
                <td class="py-3 px-3">
                  <div class="flex items-center gap-2">
                    <div class="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                      <div class="h-2 rounded-full bg-[#006EC7]" [style.width.%]="a.checklisteProgress"></div>
                    </div>
                    <span class="text-xs text-gray-500">{{ a.checklisteProgress }}%</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ===================== TAB 4: CHECKLISTE ===================== -->
    <div *ngIf="activeTab === 'Checkliste'">
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <h3 class="text-base font-semibold text-gray-900 mb-4">Pruefpunkte</h3>
        <div class="space-y-3">
          <div *ngFor="let cp of checkliste; let i = index"
            class="flex items-start gap-4 p-4 border rounded-lg transition-colors"
            [ngClass]="cp.erfuellt ? 'border-green-200 bg-green-50/50' : 'border-gray-200'">
            <div class="pt-0.5">
              <input type="checkbox" [(ngModel)]="cp.erfuellt"
                class="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500" />
            </div>
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-xs font-mono text-gray-400">{{ i + 1 }}.</span>
                <p class="text-sm font-medium" [ngClass]="cp.erfuellt ? 'text-green-800' : 'text-gray-900'">{{ cp.beschreibung }}</p>
              </div>
              <div class="mt-2">
                <label class="block text-xs text-gray-500 mb-1">Bemerkung</label>
                <input type="text" [(ngModel)]="cp.bemerkung" placeholder="Optionale Bemerkung..."
                  class="w-full px-3 py-1.5 border border-gray-200 rounded text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#006EC7] focus:border-transparent" />
              </div>
            </div>
          </div>
        </div>
        <div class="mt-6 flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
          <span class="text-sm text-gray-600">Fortschritt:</span>
          <div class="flex-1 bg-gray-200 rounded-full h-2.5 max-w-xs">
            <div class="h-2.5 rounded-full bg-green-500 transition-all" [style.width.%]="getChecklisteProgress()"></div>
          </div>
          <span class="text-sm font-semibold text-gray-700">{{ getChecklisteErfuellt() }}/{{ checkliste.length }}</span>
        </div>
      </div>
    </div>

    <!-- ===================== TAB 5: BESCHEIDE ===================== -->
    <div *ngIf="activeTab === 'Bescheide'">
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <h3 class="text-base font-semibold text-gray-900 mb-4">Bescheide</h3>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-gray-200">
                <th class="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Bescheid-Nr</th>
                <th class="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Arzt</th>
                <th class="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Typ</th>
                <th class="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Datum</th>
                <th class="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Zusammenfassung</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let b of bescheide" class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td class="py-3 px-3 font-mono text-gray-600">{{ b.nr }}</td>
                <td class="py-3 px-3 font-medium text-gray-900">{{ b.arzt }}</td>
                <td class="py-3 px-3">
                  <span class="inline-block px-2.5 py-1 text-xs font-semibold rounded-full"
                    [ngClass]="{
                      'bg-green-50 text-green-700': b.typ === 'Bewilligung',
                      'bg-red-50 text-red-600': b.typ === 'Ablehnung',
                      'bg-yellow-50 text-yellow-700': b.typ === 'Aenderung'
                    }">{{ b.typ }}</span>
                </td>
                <td class="py-3 px-3 text-gray-600">{{ b.datum }}</td>
                <td class="py-3 px-3 text-gray-600 max-w-xs">{{ b.zusammenfassung }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class WbFoerderungComponent {
  tabs = ['Stammdaten', 'WB-Abschnitte', 'Antraege', 'Checkliste', 'Bescheide'];
  activeTab = 'Stammdaten';
  antraegeSubTabs = ['Beschaeftigung', 'Zuschuss'];
  activeAntraegeSubTab = 'Beschaeftigung';

  panels = {
    fachgebiete: true,
    ermaechtigte: false,
    befugnisse: false,
    sonstige: false,
    aerzteInWb: false
  };

  // --- Tab 1: Stammdaten mock data ---

  fachgebiete = [
    { code: '010', bezeichnung: 'Allgemeinmedizin', fachgruppe: 'Hausaerztliche Versorgung', status: 'aktiv' },
    { code: '020', bezeichnung: 'Innere Medizin', fachgruppe: 'Hausaerztliche Versorgung', status: 'aktiv' },
    { code: '030', bezeichnung: 'Kinder- und Jugendmedizin', fachgruppe: 'Fachaerztliche Versorgung', status: 'aktiv' },
    { code: '040', bezeichnung: 'Chirurgie', fachgruppe: 'Fachaerztliche Versorgung', status: 'aktiv' },
    { code: '050', bezeichnung: 'Orthopaedie', fachgruppe: 'Fachaerztliche Versorgung', status: 'aktiv' },
    { code: '060', bezeichnung: 'Gynaekologie', fachgruppe: 'Fachaerztliche Versorgung', status: 'aktiv' },
    { code: '070', bezeichnung: 'Psychiatrie', fachgruppe: 'Psychotherapeutische Versorgung', status: 'inaktiv' },
    { code: '080', bezeichnung: 'Neurologie', fachgruppe: 'Fachaerztliche Versorgung', status: 'aktiv' }
  ];

  ermaechtigte = [
    { lanr: '123456701', name: 'Dr. Hans Meier', fachgebiet: 'Allgemeinmedizin', praxis: 'Praxis am Markt, Koeln', auslastung: 75 },
    { lanr: '123456702', name: 'Dr. Petra Schulz', fachgebiet: 'Innere Medizin', praxis: 'MVZ Rheinland, Duesseldorf', auslastung: 90 },
    { lanr: '123456703', name: 'Dr. Klaus Weber', fachgebiet: 'Chirurgie', praxis: 'Chirurgische Praxis, Bonn', auslastung: 45 },
    { lanr: '123456704', name: 'Dr. Ingrid Lang', fachgebiet: 'Kinder- und Jugendmedizin', praxis: 'Kinderarztpraxis, Essen', auslastung: 60 },
    { lanr: '123456705', name: 'Dr. Martin Richter', fachgebiet: 'Orthopaedie', praxis: 'Orthopaedisches Zentrum, Dortmund', auslastung: 30 },
    { lanr: '123456706', name: 'Dr. Susanne Braun', fachgebiet: 'Gynaekologie', praxis: 'Frauenarztpraxis, Aachen', auslastung: 85 }
  ];

  befugnisse = [
    { ermaechtigter: 'Dr. Hans Meier', fachgebiet: 'Allgemeinmedizin', maxDauer: 24, status: 'aktiv' },
    { ermaechtigter: 'Dr. Petra Schulz', fachgebiet: 'Innere Medizin', maxDauer: 36, status: 'aktiv' },
    { ermaechtigter: 'Dr. Klaus Weber', fachgebiet: 'Chirurgie', maxDauer: 24, status: 'aktiv' },
    { ermaechtigter: 'Dr. Ingrid Lang', fachgebiet: 'Kinder- und Jugendmedizin', maxDauer: 18, status: 'abgelaufen' },
    { ermaechtigter: 'Dr. Martin Richter', fachgebiet: 'Orthopaedie', maxDauer: 12, status: 'beantragt' },
    { ermaechtigter: 'Dr. Susanne Braun', fachgebiet: 'Gynaekologie', maxDauer: 24, status: 'aktiv' },
    { ermaechtigter: 'Dr. Hans Meier', fachgebiet: 'Innere Medizin', maxDauer: 12, status: 'abgelaufen' },
    { ermaechtigter: 'Dr. Petra Schulz', fachgebiet: 'Allgemeinmedizin', maxDauer: 18, status: 'beantragt' }
  ];

  sonstigeWeiterbilder = [
    { schluessel: 'SW-001', bezeichnung: 'Klinikum Koeln', typ: 'Krankenhaus', ort: 'Koeln' },
    { schluessel: 'SW-002', bezeichnung: 'MVZ Rheinisches Zentrum', typ: 'MVZ', ort: 'Duesseldorf' },
    { schluessel: 'SW-003', bezeichnung: 'Praxisnetz Westfalen', typ: 'Praxisnetz', ort: 'Dortmund' },
    { schluessel: 'SW-004', bezeichnung: 'Universitaetsklinikum Bonn', typ: 'Krankenhaus', ort: 'Bonn' },
    { schluessel: 'SW-005', bezeichnung: 'Gemeinschafts-MVZ Essen', typ: 'MVZ', ort: 'Essen' }
  ];

  aerzteInWb = [
    { name: 'Dr. Julia Fischer', status: 'aktiv', fachgebiet: 'Allgemeinmedizin', approbationsdatum: '15.03.2020' },
    { name: 'Dr. Stefan Koenig', status: 'aktiv', fachgebiet: 'Innere Medizin', approbationsdatum: '01.07.2019' },
    { name: 'Dr. Maria Vogel', status: 'abgeschlossen', fachgebiet: 'Chirurgie', approbationsdatum: '10.01.2018' },
    { name: 'Dr. Thomas Neumann', status: 'aktiv', fachgebiet: 'Kinder- und Jugendmedizin', approbationsdatum: '22.09.2021' },
    { name: 'Dr. Lisa Wagner', status: 'unterbrochen', fachgebiet: 'Gynaekologie', approbationsdatum: '05.04.2020' },
    { name: 'Dr. Andreas Becker', status: 'aktiv', fachgebiet: 'Orthopaedie', approbationsdatum: '18.11.2019' },
    { name: 'Dr. Katharina Wolf', status: 'abgeschlossen', fachgebiet: 'Neurologie', approbationsdatum: '30.06.2017' },
    { name: 'Dr. Markus Huber', status: 'aktiv', fachgebiet: 'Psychiatrie', approbationsdatum: '12.02.2022' }
  ];

  // --- Tab 2: WB-Abschnitte mock data ---

  wbAbschnitte = [
    { arzt: 'Dr. Julia Fischer', typ: 'ambulant', weiterbilder: 'Dr. Hans Meier', von: '01.01.2023', bis: '30.06.2023', dauer: 6, foerderung: true, erhoehung: 10 },
    { arzt: 'Dr. Julia Fischer', typ: 'stationaer', weiterbilder: 'Klinikum Koeln', von: '01.07.2023', bis: '31.12.2023', dauer: 6, foerderung: false, erhoehung: 0 },
    { arzt: 'Dr. Stefan Koenig', typ: 'ambulant', weiterbilder: 'Dr. Petra Schulz', von: '01.03.2023', bis: '31.08.2023', dauer: 6, foerderung: true, erhoehung: 15 },
    { arzt: 'Dr. Stefan Koenig', typ: 'ambulant', weiterbilder: 'Dr. Hans Meier', von: '01.09.2023', bis: '28.02.2024', dauer: 6, foerderung: true, erhoehung: 10 },
    { arzt: 'Dr. Maria Vogel', typ: 'stationaer', weiterbilder: 'Universitaetsklinikum Bonn', von: '01.01.2022', bis: '31.12.2022', dauer: 12, foerderung: false, erhoehung: 0 },
    { arzt: 'Dr. Maria Vogel', typ: 'ambulant', weiterbilder: 'Dr. Klaus Weber', von: '01.01.2023', bis: '30.06.2023', dauer: 6, foerderung: true, erhoehung: 10 },
    { arzt: 'Dr. Thomas Neumann', typ: 'ambulant', weiterbilder: 'Dr. Ingrid Lang', von: '01.04.2023', bis: '30.09.2023', dauer: 6, foerderung: true, erhoehung: 20 },
    { arzt: 'Dr. Thomas Neumann', typ: 'stationaer', weiterbilder: 'Klinikum Koeln', von: '01.10.2023', bis: '31.03.2024', dauer: 6, foerderung: false, erhoehung: 0 },
    { arzt: 'Dr. Lisa Wagner', typ: 'ambulant', weiterbilder: 'Dr. Susanne Braun', von: '01.02.2023', bis: '31.07.2023', dauer: 6, foerderung: true, erhoehung: 10 },
    { arzt: 'Dr. Andreas Becker', typ: 'ambulant', weiterbilder: 'Dr. Martin Richter', von: '01.05.2023', bis: '31.10.2023', dauer: 6, foerderung: true, erhoehung: 15 },
    { arzt: 'Dr. Andreas Becker', typ: 'stationaer', weiterbilder: 'Universitaetsklinikum Bonn', von: '01.11.2023', bis: '30.04.2024', dauer: 6, foerderung: false, erhoehung: 0 },
    { arzt: 'Dr. Markus Huber', typ: 'ambulant', weiterbilder: 'Dr. Petra Schulz', von: '01.06.2023', bis: '30.11.2023', dauer: 6, foerderung: true, erhoehung: 10 }
  ];

  // --- Tab 3: Antraege mock data ---

  antraegeBeschaeftigung = [
    { nr: 'BA-2024-001', arzt: 'Dr. Julia Fischer', status: 'genehmigt', datum: '15.01.2024', checklisteProgress: 100 },
    { nr: 'BA-2024-002', arzt: 'Dr. Stefan Koenig', status: 'in_pruefung', datum: '22.01.2024', checklisteProgress: 70 },
    { nr: 'BA-2024-003', arzt: 'Dr. Thomas Neumann', status: 'eingereicht', datum: '01.02.2024', checklisteProgress: 40 },
    { nr: 'BA-2024-004', arzt: 'Dr. Lisa Wagner', status: 'abgelehnt', datum: '10.02.2024', checklisteProgress: 90 },
    { nr: 'BA-2024-005', arzt: 'Dr. Andreas Becker', status: 'genehmigt', datum: '18.02.2024', checklisteProgress: 100 },
    { nr: 'BA-2024-006', arzt: 'Dr. Markus Huber', status: 'eingereicht', datum: '25.02.2024', checklisteProgress: 20 }
  ];

  antraegeZuschuss = [
    { nr: 'ZA-2024-001', arzt: 'Dr. Julia Fischer', betrag: 5400.00, status: 'genehmigt', datum: '20.01.2024', checklisteProgress: 100 },
    { nr: 'ZA-2024-002', arzt: 'Dr. Stefan Koenig', betrag: 4800.00, status: 'in_pruefung', datum: '28.01.2024', checklisteProgress: 60 },
    { nr: 'ZA-2024-003', arzt: 'Dr. Thomas Neumann', betrag: 5400.00, status: 'eingereicht', datum: '05.02.2024', checklisteProgress: 30 },
    { nr: 'ZA-2024-004', arzt: 'Dr. Andreas Becker', betrag: 6200.00, status: 'genehmigt', datum: '12.02.2024', checklisteProgress: 100 },
    { nr: 'ZA-2024-005', arzt: 'Dr. Lisa Wagner', betrag: 4800.00, status: 'abgelehnt', datum: '15.02.2024', checklisteProgress: 80 },
    { nr: 'ZA-2024-006', arzt: 'Dr. Markus Huber', betrag: 5000.00, status: 'eingereicht', datum: '01.03.2024', checklisteProgress: 10 }
  ];

  // --- Tab 4: Checkliste mock data ---

  checkliste = [
    { beschreibung: 'Approbationsurkunde liegt vor', erfuellt: true, bemerkung: 'Kopie geprueft' },
    { beschreibung: 'Weiterbildungsbefugnis des Weiterbilders ist gueltig', erfuellt: true, bemerkung: '' },
    { beschreibung: 'Arbeitsvertrag eingereicht', erfuellt: true, bemerkung: 'Befristet bis 12/2024' },
    { beschreibung: 'Weiterbildungsplan erstellt und genehmigt', erfuellt: false, bemerkung: '' },
    { beschreibung: 'Logbuch angelegt', erfuellt: true, bemerkung: '' },
    { beschreibung: 'Haftpflichtversicherung nachgewiesen', erfuellt: false, bemerkung: 'Wird nachgereicht' },
    { beschreibung: 'KV-Zulassung des Weiterbilders geprueft', erfuellt: true, bemerkung: '' },
    { beschreibung: 'Foerderantrag vollstaendig ausgefuellt', erfuellt: false, bemerkung: '' },
    { beschreibung: 'Bankverbindung hinterlegt', erfuellt: true, bemerkung: '' },
    { beschreibung: 'Datenschutzerklaerung unterschrieben', erfuellt: true, bemerkung: 'Digital signiert' }
  ];

  // --- Tab 5: Bescheide mock data ---

  bescheide = [
    { nr: 'B-2024-001', arzt: 'Dr. Julia Fischer', typ: 'Bewilligung', datum: '01.02.2024', zusammenfassung: 'Foerderung der ambulanten Weiterbildung in Allgemeinmedizin genehmigt. Monatlicher Zuschuss in Hoehe von 5.400 EUR bewilligt.' },
    { nr: 'B-2024-002', arzt: 'Dr. Lisa Wagner', typ: 'Ablehnung', datum: '15.02.2024', zusammenfassung: 'Antrag auf Weiterbildungsfoerderung abgelehnt. Begruendung: Weiterbildungsbefugnis des Weiterbilders zum Zeitpunkt der Antragstellung abgelaufen.' },
    { nr: 'B-2024-003', arzt: 'Dr. Andreas Becker', typ: 'Aenderung', datum: '20.02.2024', zusammenfassung: 'Aenderung der Foerderhoehe aufgrund Wechsel des Weiterbildungsabschnitts. Neuer Zuschuss: 6.200 EUR monatlich ab 01.03.2024.' }
  ];

  getChecklisteErfuellt(): number {
    return this.checkliste.filter(c => c.erfuellt).length;
  }

  getChecklisteProgress(): number {
    return Math.round((this.getChecklisteErfuellt() / this.checkliste.length) * 100);
  }
}
