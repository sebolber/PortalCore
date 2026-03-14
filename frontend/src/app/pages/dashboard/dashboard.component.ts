import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { DashboardWidget, WidgetDefinition, PortalSeite } from '../../models/dashboard.model';
import { DashboardService } from '../../services/dashboard.service';
import { NachrichtService } from '../../services/nachricht.service';
import { NachrichtItem } from '../../models/nachricht.model';

const GRID_COLS = 4;
const CELL_HEIGHT = 180;
const GAP = 16;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div style="font-family: 'Fira Sans', sans-serif">

      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p class="text-sm text-gray-500 mt-0.5">{{ today }}</p>
        </div>
        <div class="flex items-center gap-2">
          <button *ngIf="editMode()"
                  (click)="speichernLayout()"
                  class="px-4 py-2 text-sm font-medium bg-[#006EC7] text-white rounded-lg hover:bg-[#005ba3] transition-colors">
            Speichern
          </button>
          <button (click)="toggleEditMode()"
                  class="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                  [ngClass]="editMode()
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'">
            {{ editMode() ? 'Abbrechen' : 'Bearbeiten' }}
          </button>
          <button *ngIf="editMode()"
                  (click)="showWidgetPicker.set(true)"
                  class="px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1.5">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
            </svg>
            Widget
          </button>
        </div>
      </div>

      <!-- Grid Dashboard -->
      <div class="relative" [style.min-height.px]="gridHeight()">

        <!-- Grid Lines (edit mode) -->
        <div *ngIf="editMode()" class="absolute inset-0 pointer-events-none">
          <div class="grid grid-cols-4 h-full gap-4">
            <div *ngFor="let c of [0,1,2,3]"
                 class="border border-dashed border-gray-200 rounded-xl bg-gray-50/30"
                 [style.min-height.px]="gridHeight()"></div>
          </div>
        </div>

        <!-- Widgets -->
        <div *ngFor="let w of widgets(); let i = index"
             class="absolute transition-all duration-200 ease-out"
             [style.left]="getLeft(w)" [style.top]="getTop(w)"
             [style.width]="getWidth(w)" [style.height]="getHeight(w)"
             [ngClass]="editMode() ? 'cursor-move' : ''">
          <div class="h-full bg-white border rounded-xl shadow-sm overflow-hidden group"
               [ngClass]="editMode() ? 'border-blue-200 ring-1 ring-blue-100' : 'border-gray-200 hover:shadow-md'"
               (mousedown)="editMode() && startDrag($event, w)"
               (touchstart)="editMode() && startDrag($event, w)">

            <!-- Widget Header -->
            <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div class="flex items-center gap-2 min-w-0">
                <span class="w-2 h-2 rounded-full shrink-0"
                      [ngClass]="{'bg-[#006EC7]': w.definition.kategorie === 'PORTAL', 'bg-green-500': w.definition.kategorie === 'APP', 'bg-amber-500': w.definition.kategorie === 'QUICKLINK'}"></span>
                <h3 class="text-sm font-semibold text-gray-800 truncate">{{ w.definition.titel }}</h3>
              </div>
              <div *ngIf="editMode()" class="flex items-center gap-0.5 shrink-0">
                <button (click)="resize(w, -1, 0); $event.stopPropagation()" *ngIf="w.breite > w.definition.minBreite"
                        class="p-1 text-gray-400 hover:text-gray-600" title="Schmaler">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" d="M20 12H4"/></svg>
                </button>
                <button (click)="resize(w, 1, 0); $event.stopPropagation()" *ngIf="w.breite < w.definition.maxBreite"
                        class="p-1 text-gray-400 hover:text-gray-600" title="Breiter">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" d="M12 4v16m8-8H4"/></svg>
                </button>
                <button (click)="resize(w, 0, 1); $event.stopPropagation()" *ngIf="w.hoehe < w.definition.maxHoehe"
                        class="p-1 text-gray-400 hover:text-gray-600" title="Hoeher">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>
                </button>
                <button (click)="resize(w, 0, -1); $event.stopPropagation()" *ngIf="w.hoehe > w.definition.minHoehe"
                        class="p-1 text-gray-400 hover:text-gray-600" title="Kleiner">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7"/></svg>
                </button>
                <button (click)="removeWidget(w); $event.stopPropagation()"
                        class="p-1 text-gray-400 hover:text-red-500 ml-1" title="Entfernen">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
            </div>

            <!-- Widget Body -->
            <div class="p-4 h-[calc(100%-49px)] overflow-auto"
                 [ngClass]="w.definition.linkZiel && !editMode() ? 'cursor-pointer' : ''"
                 (click)="!editMode() && navigateWidget(w)">

              <!-- ZAHL -->
              <ng-container *ngIf="w.definition.widgetTyp === 'ZAHL' && w.definition.widgetKey !== 'portal.willkommen'">
                <div class="flex flex-col items-center justify-center h-full">
                  <div class="text-4xl font-bold"
                       [ngClass]="{'text-[#006EC7]': w.definition.widgetKey === 'portal.ungelesene-nachrichten', 'text-amber-600': w.definition.widgetKey === 'portal.offene-aufgaben', 'text-green-600': w.definition.widgetKey === 'portal.installierte-apps'}">
                    {{ getData(w) ?? '...' }}
                  </div>
                  <p class="text-sm text-gray-500 mt-1">{{ w.definition.beschreibung }}</p>
                  <p *ngIf="w.definition.linkZiel && !editMode()" class="text-xs text-[#006EC7] mt-2 hover:underline">Details anzeigen &rarr;</p>
                </div>
              </ng-container>

              <!-- WILLKOMMEN Banner -->
              <ng-container *ngIf="w.definition.widgetKey === 'portal.willkommen'">
                <div class="flex items-center justify-between h-full bg-gradient-to-r from-[#006EC7] to-[#004A87] -m-4 p-6 rounded-b-xl text-white">
                  <div>
                    <h2 class="text-xl font-bold">Willkommen zurueck!</h2>
                    <p class="text-blue-100 text-sm mt-0.5">{{ today }}</p>
                  </div>
                  <div class="bg-white/10 rounded-lg px-4 py-2 hidden sm:block">
                    <span class="text-sm">Health Portal</span>
                  </div>
                </div>
              </ng-container>

              <!-- QUICKLINK -->
              <ng-container *ngIf="w.definition.widgetTyp === 'QUICKLINK'">
                <div class="flex flex-col items-center justify-center h-full">
                  <div class="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-2">
                    <svg class="w-6 h-6 text-[#006EC7]" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101"/>
                      <path stroke-linecap="round" stroke-linejoin="round" d="M10.172 13.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.102 1.101"/>
                    </svg>
                  </div>
                  <p class="text-sm font-medium text-gray-700">{{ getLabel(w) }}</p>
                  <p class="text-xs text-gray-400 mt-0.5">Schnelleinstieg</p>
                </div>
              </ng-container>

              <!-- LISTE (Posteingang widget) -->
              <ng-container *ngIf="w.definition.widgetTyp === 'LISTE' && w.definition.widgetKey === 'portal.posteingang'">
                <div class="h-full overflow-y-auto -mx-4 -mt-4 -mb-4">
                  <div *ngFor="let item of posteingangsItems()"
                       class="flex items-start gap-2.5 px-4 py-2.5 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
                       (click)="router.navigateByUrl('/nachrichten'); $event.stopPropagation()">
                    <div class="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 mt-0.5"
                         [ngClass]="item.typ === 'AUFGABE' ? 'bg-amber-500' : 'bg-[#006EC7]'">
                      {{ item.erstellerInitialen }}
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-1.5">
                        <span *ngIf="item.typ === 'AUFGABE'"
                              class="inline-block px-1 py-0 text-[8px] font-bold rounded bg-amber-100 text-amber-700 shrink-0">
                          AUFGABE
                        </span>
                        <span *ngIf="item.prioritaet === 'HOCH' || item.prioritaet === 'DRINGEND'"
                              class="inline-block px-1 py-0 text-[8px] font-bold rounded shrink-0"
                              [ngClass]="item.prioritaet === 'DRINGEND' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'">
                          {{ item.prioritaet === 'DRINGEND' ? '!!' : '!' }}
                        </span>
                        <span class="text-xs truncate" [ngClass]="item.gelesen ? 'text-gray-600' : 'text-gray-900 font-semibold'">
                          {{ item.betreff }}
                        </span>
                      </div>
                      <div class="flex items-center gap-2 mt-0.5">
                        <span class="text-[10px] text-gray-400 truncate">{{ item.erstellerName }}</span>
                        <span *ngIf="item.frist" class="text-[10px] text-gray-400">{{ formatWidgetDatum(item.frist) }}</span>
                      </div>
                    </div>
                    <div *ngIf="!item.gelesen" class="w-1.5 h-1.5 rounded-full bg-[#006EC7] shrink-0 mt-2"></div>
                  </div>
                  <div *ngIf="posteingangsItems().length === 0" class="flex items-center justify-center h-full text-xs text-gray-400 py-8">
                    Keine offenen Eintraege
                  </div>
                </div>
              </ng-container>

              <!-- LISTE (generic) -->
              <ng-container *ngIf="w.definition.widgetTyp === 'LISTE' && w.definition.widgetKey !== 'portal.posteingang'">
                <div class="space-y-2 h-full">
                  <div *ngFor="let app of recentApps"
                       class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                       (click)="router.navigate(['/appstore/' + app.id]); $event.stopPropagation()">
                    <div class="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                         [style.background-color]="app.iconColor">{{ app.iconInitials }}</div>
                    <div class="min-w-0">
                      <p class="text-sm font-medium text-gray-800 truncate">{{ app.name }}</p>
                      <div class="flex items-center gap-0.5">
                        <span *ngFor="let star of [1,2,3,4,5]" class="text-[10px]"
                              [class.text-yellow-400]="star <= app.rating" [class.text-gray-300]="star > app.rating">&#9733;</span>
                      </div>
                    </div>
                  </div>
                </div>
              </ng-container>

              <!-- BALKEN -->
              <ng-container *ngIf="w.definition.widgetTyp === 'BALKEN'">
                <div class="flex items-end justify-around h-full gap-2 pb-2">
                  <div *ngFor="let bar of sampleBars" class="flex flex-col items-center gap-1 flex-1">
                    <div class="w-full rounded-t-md" [style.height.%]="bar.pct" [style.background-color]="bar.color"></div>
                    <span class="text-[10px] text-gray-500">{{ bar.label }}</span>
                  </div>
                </div>
              </ng-container>

              <!-- TORTE -->
              <ng-container *ngIf="w.definition.widgetTyp === 'TORTE'">
                <div class="flex items-center justify-center h-full gap-6">
                  <div class="w-28 h-28 rounded-full shrink-0"
                       style="background: conic-gradient(#006EC7 0% 40%, #28DCAA 40% 70%, #FF9868 70% 85%, #E5E7EB 85% 100%)"></div>
                  <div class="space-y-1.5">
                    <div class="flex items-center gap-2 text-xs"><span class="w-2.5 h-2.5 rounded-sm bg-[#006EC7]"></span>Bereich A (40%)</div>
                    <div class="flex items-center gap-2 text-xs"><span class="w-2.5 h-2.5 rounded-sm bg-[#28DCAA]"></span>Bereich B (30%)</div>
                    <div class="flex items-center gap-2 text-xs"><span class="w-2.5 h-2.5 rounded-sm bg-[#FF9868]"></span>Bereich C (15%)</div>
                    <div class="flex items-center gap-2 text-xs"><span class="w-2.5 h-2.5 rounded-sm bg-gray-200"></span>Sonstige (15%)</div>
                  </div>
                </div>
              </ng-container>

              <!-- TABELLE -->
              <ng-container *ngIf="w.definition.widgetTyp === 'TABELLE'">
                <div class="text-xs text-gray-500 text-center mt-8">Tabellen-Widget konfigurieren</div>
              </ng-container>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div *ngIf="widgets().length === 0" class="text-center py-20">
          <svg class="w-16 h-16 text-gray-200 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1">
            <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
          </svg>
          <p class="text-sm text-gray-400 mb-4">Noch keine Widgets konfiguriert</p>
          <button (click)="showWidgetPicker.set(true); editMode.set(true)"
                  class="px-4 py-2 text-sm font-medium bg-[#006EC7] text-white rounded-lg hover:bg-[#005ba3]">
            Widgets hinzufuegen
          </button>
        </div>
      </div>

      <!-- Widget Picker Modal -->
      <div *ngIf="showWidgetPicker()" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" (click)="showWidgetPicker.set(false)">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col" (click)="$event.stopPropagation()">
          <div class="p-6 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-bold text-gray-900">Widget hinzufuegen</h2>
              <button (click)="showWidgetPicker.set(false)" class="p-1 text-gray-400 hover:text-gray-600">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <div class="flex gap-1 mt-4 bg-gray-100 rounded-lg p-1">
              <button *ngFor="let tab of pickerTabs" (click)="pickerTab = tab.value"
                      class="flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors"
                      [ngClass]="pickerTab === tab.value ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'">
                {{ tab.label }}
              </button>
            </div>
          </div>

          <div class="flex-1 overflow-y-auto p-6">
            <div class="grid grid-cols-2 gap-3">
              <button *ngFor="let def of filteredDefs()" (click)="addFromPicker(def)"
                      class="flex items-start gap-3 p-4 border border-gray-200 rounded-xl hover:border-[#006EC7] hover:bg-blue-50/30 transition-all text-left group">
                <div class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                     [ngClass]="{'bg-blue-100': def.kategorie === 'PORTAL', 'bg-green-100': def.kategorie === 'APP', 'bg-amber-100': def.kategorie === 'QUICKLINK'}">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"
                       [ngClass]="{'text-blue-600': def.kategorie === 'PORTAL', 'text-green-600': def.kategorie === 'APP', 'text-amber-600': def.kategorie === 'QUICKLINK'}">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"/>
                  </svg>
                </div>
                <div class="min-w-0">
                  <p class="text-sm font-semibold text-gray-800 group-hover:text-[#006EC7]">{{ def.titel }}</p>
                  <p class="text-xs text-gray-500 mt-0.5 line-clamp-2">{{ def.beschreibung }}</p>
                  <div class="flex items-center gap-2 mt-1.5">
                    <span class="text-[10px] px-1.5 py-0.5 rounded font-medium"
                          [ngClass]="{'bg-blue-100 text-blue-700': def.kategorie === 'PORTAL', 'bg-green-100 text-green-700': def.kategorie === 'APP', 'bg-amber-100 text-amber-700': def.kategorie === 'QUICKLINK'}">
                      {{ def.kategorie }}
                    </span>
                    <span class="text-[10px] text-gray-400">{{ def.standardBreite }}x{{ def.standardHoehe }}</span>
                  </div>
                </div>
              </button>
            </div>

            <!-- Quicklink page selector -->
            <div *ngIf="pickerTab === 'QUICKLINK'" class="mt-6">
              <h3 class="text-sm font-semibold text-gray-800 mb-3">Quicklink zu einer Seite erstellen:</h3>
              <div class="grid grid-cols-2 gap-2">
                <button *ngFor="let seite of seiten()" (click)="addQuicklink(seite)"
                        class="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:border-[#006EC7] hover:bg-blue-50/30 text-left">
                  <svg class="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
                  </svg>
                  <div class="min-w-0">
                    <p class="text-sm text-gray-700 truncate">{{ seite.titel }}</p>
                    <p class="text-[10px] text-gray-400 truncate">{{ seite.route }}</p>
                  </div>
                </button>
              </div>
            </div>

            <div *ngIf="filteredDefs().length === 0 && pickerTab !== 'QUICKLINK'" class="text-center py-8 text-sm text-gray-400">
              Keine Widgets in dieser Kategorie verfuegbar
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly nachrichtService = inject(NachrichtService);
  readonly router = inject(Router);

  readonly widgets = signal<DashboardWidget[]>([]);
  readonly widgetDefs = signal<WidgetDefinition[]>([]);
  readonly seiten = signal<PortalSeite[]>([]);
  readonly editMode = signal(false);
  readonly showWidgetPicker = signal(false);
  readonly widgetData = signal<Record<string, any>>({});
  readonly posteingangsItems = signal<NachrichtItem[]>([]);

  pickerTab = 'ALLE';
  private dragging = false;
  private dragWidget: DashboardWidget | null = null;
  private dragStartX = 0;
  private dragStartY = 0;
  private dragOrigX = 0;
  private dragOrigY = 0;

  today = new Date().toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  readonly pickerTabs = [
    { label: 'Alle', value: 'ALLE' },
    { label: 'Portal', value: 'PORTAL' },
    { label: 'Apps', value: 'APP' },
    { label: 'Quicklinks', value: 'QUICKLINK' },
  ];

  readonly filteredDefs = computed(() => {
    const tab = this.pickerTab;
    if (tab === 'ALLE') return this.widgetDefs();
    if (tab === 'QUICKLINK') return this.widgetDefs().filter(d => d.widgetTyp === 'QUICKLINK');
    return this.widgetDefs().filter(d => d.kategorie === tab);
  });

  readonly gridHeight = computed(() => {
    const ws = this.widgets();
    if (ws.length === 0) return 300;
    return Math.max(...ws.map(w => w.positionY + w.hoehe)) * (CELL_HEIGHT + GAP) + 40;
  });

  readonly recentApps = [
    { id: 'kv-ai-abrechnung', name: 'KV AI Abrechnung', iconColor: '#006EC7', iconInitials: 'KV', rating: 5 },
    { id: 'smile-kh', name: 'smile KH', iconColor: '#28DCAA', iconInitials: 'SK', rating: 4 },
    { id: 'arztregister', name: 'Arztregister', iconColor: '#76C800', iconInitials: 'AR', rating: 4 },
    { id: 'wb-foerderung', name: 'WB-Foerderung', iconColor: '#FF9868', iconInitials: 'WB', rating: 4 },
  ];

  readonly sampleBars = [
    { label: 'Mo', pct: 60, color: '#006EC7' },
    { label: 'Di', pct: 80, color: '#006EC7' },
    { label: 'Mi', pct: 45, color: '#006EC7' },
    { label: 'Do', pct: 90, color: '#006EC7' },
    { label: 'Fr', pct: 70, color: '#006EC7' },
  ];

  ngOnInit(): void {
    this.loadDashboard();
    this.dashboardService.getWidgetDefinitionen().subscribe({ next: d => this.widgetDefs.set(d), error: () => {} });
    this.dashboardService.getSeiten().subscribe({ next: s => this.seiten.set(s), error: () => {} });
  }

  loadDashboard(): void {
    this.dashboardService.getUserWidgets().subscribe({
      next: w => { this.widgets.set(w); this.loadData(); },
      error: () => this.loadDefaults()
    });
  }

  private loadDefaults(): void {
    const mk = (id: string, key: string, t: string, b: string, typ: any, x: number, y: number, w: number, h: number, link: string | null): DashboardWidget => ({
      id, positionX: x, positionY: y, breite: w, hoehe: h, konfiguration: null, sichtbar: true, sortierung: 0,
      definition: { id, widgetKey: key, titel: t, beschreibung: b, kategorie: 'PORTAL', widgetTyp: typ,
        appId: null, appName: null, iconPath: null, standardBreite: w, standardHoehe: h,
        minBreite: 1, minHoehe: 1, maxBreite: 4, maxHoehe: 4, datenEndpunkt: null, linkZiel: link, konfigurierbar: false }
    });
    this.widgets.set([
      mk('wd-willkommen', 'portal.willkommen', 'Willkommen', '', 'ZAHL', 0, 0, 4, 1, null),
      mk('wd-offene-aufgaben', 'portal.offene-aufgaben', 'Offene Aufgaben', 'Anzahl der offenen Aufgaben', 'ZAHL', 0, 1, 1, 1, '/nachrichten'),
      mk('wd-ungelesene', 'portal.ungelesene-nachrichten', 'Ungelesene Nachrichten', 'Anzahl ungelesener Nachrichten', 'ZAHL', 1, 1, 1, 1, '/nachrichten'),
      mk('wd-apps', 'portal.installierte-apps', 'Installierte Apps', 'Installierte Anwendungen', 'ZAHL', 2, 1, 1, 1, '/appstore/installiert'),
      mk('wd-letzte', 'portal.letzte-apps', 'Zuletzt genutzte Apps', 'Kuerzlich verwendete Anwendungen', 'LISTE', 3, 1, 1, 2, '/appstore'),
    ]);
    this.loadData();
  }

  private loadData(): void {
    this.nachrichtService.getUngelesenAnzahl().subscribe({
      next: r => this.widgetData.update(d => ({ ...d, 'portal.offene-aufgaben': r.anzahl, 'portal.ungelesene-nachrichten': r.anzahl })),
      error: () => this.widgetData.update(d => ({ ...d, 'portal.offene-aufgaben': 7, 'portal.ungelesene-nachrichten': 3, 'portal.installierte-apps': 6 }))
    });
    this.nachrichtService.getPosteingang().subscribe({
      next: items => this.posteingangsItems.set(items),
      error: () => this.posteingangsItems.set([])
    });
  }

  getData(w: DashboardWidget): any { return this.widgetData()[w.definition.widgetKey]; }

  getLeft(w: DashboardWidget): string { return `calc(${(w.positionX / GRID_COLS) * 100}% + ${GAP / 2}px)`; }
  getTop(w: DashboardWidget): string { return `${w.positionY * (CELL_HEIGHT + GAP)}px`; }
  getWidth(w: DashboardWidget): string { return `calc(${(w.breite / GRID_COLS) * 100}% - ${GAP}px)`; }
  getHeight(w: DashboardWidget): string { return `${w.hoehe * CELL_HEIGHT + (w.hoehe - 1) * GAP}px`; }

  toggleEditMode(): void {
    if (this.editMode()) this.loadDashboard();
    this.editMode.update(v => !v);
  }

  speichernLayout(): void {
    const items = this.widgets().map((w, i) => ({
      id: w.id, positionX: w.positionX, positionY: w.positionY, breite: w.breite, hoehe: w.hoehe, sortierung: i
    }));
    this.dashboardService.layoutSpeichern(items).subscribe({ next: () => this.editMode.set(false), error: () => this.editMode.set(false) });
  }

  resize(w: DashboardWidget, dw: number, dh: number): void {
    this.widgets.update(ws => ws.map(widget => {
      if (widget.id !== w.id) return widget;
      const nb = Math.max(w.definition.minBreite, Math.min(w.definition.maxBreite, widget.breite + dw));
      const nh = Math.max(w.definition.minHoehe, Math.min(w.definition.maxHoehe, widget.hoehe + dh));
      return { ...widget, breite: Math.min(nb, GRID_COLS - widget.positionX), hoehe: nh };
    }));
  }

  removeWidget(w: DashboardWidget): void {
    this.dashboardService.widgetEntfernen(w.id).subscribe({
      next: () => this.widgets.update(ws => ws.filter(x => x.id !== w.id)),
      error: () => this.widgets.update(ws => ws.filter(x => x.id !== w.id))
    });
  }

  startDrag(event: MouseEvent | TouchEvent, w: DashboardWidget): void {
    if (!this.editMode()) return;
    event.preventDefault();
    this.dragging = true;
    this.dragWidget = w;
    const e = event instanceof MouseEvent ? event : event.touches[0];
    this.dragStartX = e.clientX; this.dragStartY = e.clientY;
    this.dragOrigX = w.positionX; this.dragOrigY = w.positionY;

    const onMove = (ev: MouseEvent | TouchEvent) => {
      if (!this.dragging || !this.dragWidget) return;
      const p = ev instanceof MouseEvent ? ev : ev.touches[0];
      const gridW = (document.querySelector('.relative')?.clientWidth || 800) / GRID_COLS;
      const nx = Math.max(0, Math.min(GRID_COLS - this.dragWidget.breite, Math.round(this.dragOrigX + (p.clientX - this.dragStartX) / gridW)));
      const ny = Math.max(0, Math.round(this.dragOrigY + (p.clientY - this.dragStartY) / (CELL_HEIGHT + GAP)));
      if (nx !== this.dragWidget.positionX || ny !== this.dragWidget.positionY) {
        this.widgets.update(ws => ws.map(x => x.id === this.dragWidget!.id ? { ...x, positionX: nx, positionY: ny } : x));
      }
    };
    const onEnd = () => {
      this.dragging = false; this.dragWidget = null;
      document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onEnd);
      document.removeEventListener('touchmove', onMove); document.removeEventListener('touchend', onEnd);
    };
    document.addEventListener('mousemove', onMove); document.addEventListener('mouseup', onEnd);
    document.addEventListener('touchmove', onMove); document.addEventListener('touchend', onEnd);
  }

  addFromPicker(def: WidgetDefinition): void {
    const pos = this.findFree(def.standardBreite, def.standardHoehe);
    this.dashboardService.widgetHinzufuegen({
      widgetDefinitionId: def.id, positionX: pos.x, positionY: pos.y,
      breite: def.standardBreite, hoehe: def.standardHoehe
    }).subscribe({
      next: w => { this.widgets.update(ws => [...ws, w]); this.loadData(); this.showWidgetPicker.set(false); },
      error: () => this.showWidgetPicker.set(false)
    });
  }

  addQuicklink(seite: PortalSeite): void {
    const pos = this.findFree(1, 1);
    this.dashboardService.widgetHinzufuegen({
      widgetDefinitionId: 'wd-quicklink', positionX: pos.x, positionY: pos.y, breite: 1, hoehe: 1,
      konfiguration: JSON.stringify({ seitenKey: seite.seitenKey, titel: seite.titel, route: seite.route })
    }).subscribe({
      next: w => { this.widgets.update(ws => [...ws, w]); this.showWidgetPicker.set(false); },
      error: () => this.showWidgetPicker.set(false)
    });
  }

  private findFree(w: number, h: number): { x: number; y: number } {
    const ws = this.widgets();
    for (let y = 0; y < 20; y++)
      for (let x = 0; x <= GRID_COLS - w; x++)
        if (!ws.some(o => x < o.positionX + o.breite && x + w > o.positionX && y < o.positionY + o.hoehe && y + h > o.positionY))
          return { x, y };
    return { x: 0, y: Math.max(0, ...ws.map(o => o.positionY + o.hoehe)) };
  }

  navigateWidget(w: DashboardWidget): void {
    if (w.konfiguration) { try { const c = JSON.parse(w.konfiguration); if (c.route) { this.router.navigateByUrl(c.route); return; } } catch {} }
    if (w.definition.linkZiel) this.router.navigateByUrl(w.definition.linkZiel);
  }

  getLabel(w: DashboardWidget): string {
    if (w.konfiguration) { try { return JSON.parse(w.konfiguration).titel || w.definition.titel; } catch {} }
    return w.definition.titel;
  }

  formatWidgetDatum(iso: string): string {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
  }
}
