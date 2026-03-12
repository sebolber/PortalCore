import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Leistungsort {
  id: number;
  typ: string;
  name: string;
  strasse: string;
  hausnummer: string;
  plz: string;
  ort: string;
  telefon: string;
  fax: string;
  email: string;
  website: string;
  aerzte: number;
  barrierefrei: boolean;
}

interface Sprechzeit {
  tag: string;
  von: string;
  bis: string;
  typ: string;
}

interface Arzt {
  id: number;
  name: string;
  lanr: string;
  fachgebiet: string;
  selected: boolean;
}

interface BarrierefreiheitGruppe {
  label: string;
  optionen: { label: string; checked: boolean }[];
}

@Component({
  selector: 'app-arztregister',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- PAGE HEADER -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900" style="font-family: 'Fira Sans', sans-serif">Arztregister</h1>
        <p class="text-sm text-gray-500 mt-1">Verwaltung von Leistungsorten und Aerzten</p>
      </div>
      <div class="flex gap-3">
        <button *ngIf="view === 'list'" (click)="startWizard()"
          class="px-4 py-2 bg-[#006EC7] text-white text-sm font-medium rounded-lg hover:bg-[#0058A1] transition-colors flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
          </svg>
          Neuer Leistungsort
        </button>
        <button *ngIf="view !== 'list'" (click)="view = 'list'; currentStep = 1; resetWizard()"
          class="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
          Zurueck zur Liste
        </button>
      </div>
    </div>

    <!-- ===================== LIST VIEW ===================== -->
    <ng-container *ngIf="view === 'list'">
      <!-- Search -->
      <div class="relative mb-6">
        <svg class="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35"/>
        </svg>
        <input type="text" [(ngModel)]="searchTerm" placeholder="Leistungsorte durchsuchen..."
          class="pl-10 pr-4 py-2.5 w-full bg-white border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#006EC7] focus:border-transparent" />
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div *ngFor="let stat of stats" class="bg-white rounded-xl border border-gray-200 p-5">
          <p class="text-sm text-gray-500 mb-1">{{ stat.label }}</p>
          <p class="text-2xl font-bold text-gray-900">{{ stat.value }}</p>
        </div>
      </div>

      <!-- Leistungsort Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <div *ngFor="let lo of filteredLeistungsorte()" (click)="showDetail(lo)"
          class="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-[#006EC7]/30 transition-all cursor-pointer group">
          <div class="flex items-start justify-between mb-3">
            <span class="inline-block px-2.5 py-1 bg-blue-50 text-[#006EC7] text-xs font-semibold rounded-full">{{ lo.typ }}</span>
            <span class="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              {{ lo.aerzte }}
            </span>
          </div>
          <h3 class="text-base font-semibold text-gray-900 mb-2 group-hover:text-[#006EC7] transition-colors">{{ lo.name }}</h3>
          <p class="text-sm text-gray-500 mb-1">{{ lo.strasse }} {{ lo.hausnummer }}, {{ lo.plz }} {{ lo.ort }}</p>
          <p class="text-sm text-gray-500 mb-1">{{ lo.telefon }}</p>
          <p class="text-sm text-gray-500">{{ lo.email }}</p>
          <div *ngIf="lo.barrierefrei" class="mt-3 flex items-center gap-1 text-green-600 text-xs font-medium">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
            </svg>
            Barrierefrei
          </div>
        </div>
      </div>
    </ng-container>

    <!-- ===================== DETAIL VIEW ===================== -->
    <ng-container *ngIf="view === 'detail' && selectedLeistungsort">
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <ng-container *ngTemplateOutlet="zusammenfassungTpl; context: { lo: selectedLeistungsort }"></ng-container>
      </div>
    </ng-container>

    <!-- ===================== WIZARD VIEW ===================== -->
    <ng-container *ngIf="view === 'wizard'">
      <!-- Stepper -->
      <div class="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div class="flex items-center justify-between">
          <div *ngFor="let step of stepLabels; let i = index" class="flex items-center" [class.flex-1]="i < stepLabels.length - 1">
            <div class="flex items-center gap-2">
              <div class="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-colors"
                [ngClass]="{
                  'bg-[#006EC7] text-white': currentStep === i + 1,
                  'bg-green-500 text-white': currentStep > i + 1,
                  'bg-gray-200 text-gray-500': currentStep < i + 1
                }">
                <svg *ngIf="currentStep > i + 1" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                </svg>
                <span *ngIf="currentStep <= i + 1">{{ i + 1 }}</span>
              </div>
              <span class="text-sm font-medium hidden md:inline"
                [ngClass]="{ 'text-gray-900': currentStep >= i + 1, 'text-gray-400': currentStep < i + 1 }">
                {{ step }}
              </span>
            </div>
            <div *ngIf="i < stepLabels.length - 1" class="flex-1 h-px mx-4"
              [ngClass]="{ 'bg-green-500': currentStep > i + 1, 'bg-gray-200': currentStep <= i + 1 }"></div>
          </div>
        </div>
      </div>

      <!-- STEP 1: Art & Adresse -->
      <div *ngIf="currentStep === 1" class="bg-white rounded-xl border border-gray-200 p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-6">Art & Adresse</h2>

        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-1">Leistungsort-Typ</label>
          <select [(ngModel)]="wizardData.typ"
            class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#006EC7] focus:border-transparent bg-white">
            <option value="">Bitte waehlen...</option>
            <option *ngFor="let t of leistungsortTypen" [value]="t">{{ t }}</option>
          </select>
        </div>

        <h3 class="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">Adresse</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Strasse</label>
            <input type="text" [(ngModel)]="wizardData.strasse" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#006EC7] focus:border-transparent" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Hausnummer</label>
            <input type="text" [(ngModel)]="wizardData.hausnummer" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#006EC7] focus:border-transparent" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">PLZ</label>
            <input type="text" [(ngModel)]="wizardData.plz" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#006EC7] focus:border-transparent" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Ort</label>
            <input type="text" [(ngModel)]="wizardData.ort" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#006EC7] focus:border-transparent" />
          </div>
        </div>

        <h3 class="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">Kontakt</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
            <input type="text" [(ngModel)]="wizardData.telefon" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#006EC7] focus:border-transparent" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Fax</label>
            <input type="text" [(ngModel)]="wizardData.fax" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#006EC7] focus:border-transparent" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" [(ngModel)]="wizardData.email" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#006EC7] focus:border-transparent" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Website</label>
            <input type="text" [(ngModel)]="wizardData.website" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#006EC7] focus:border-transparent" />
          </div>
        </div>
      </div>

      <!-- STEP 2: Sprechzeiten -->
      <div *ngIf="currentStep === 2" class="bg-white rounded-xl border border-gray-200 p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-6">Sprechzeiten</h2>

        <!-- Weekly calendar grid -->
        <div class="overflow-x-auto mb-6">
          <div class="min-w-[700px]">
            <!-- Header row -->
            <div class="grid grid-cols-6 gap-px bg-gray-200 rounded-t-lg overflow-hidden">
              <div class="bg-gray-50 p-3 text-xs font-semibold text-gray-500 uppercase">Zeit</div>
              <div *ngFor="let day of wochentage" class="bg-gray-50 p-3 text-xs font-semibold text-gray-700 uppercase text-center">{{ day }}</div>
            </div>
            <!-- Time rows -->
            <div *ngFor="let hour of stundenRaster" class="grid grid-cols-6 gap-px bg-gray-200">
              <div class="bg-white p-2 text-xs text-gray-500 font-mono">{{ hour }}:00</div>
              <div *ngFor="let day of wochentage" class="bg-white p-1 min-h-[36px] relative">
                <ng-container *ngFor="let sz of getSprechzeitenForSlot(day, hour)">
                  <div class="text-[10px] px-1.5 py-0.5 rounded font-medium truncate"
                    [ngClass]="{
                      'bg-blue-100 text-blue-700': sz.typ === 'Sprechzeit',
                      'bg-green-100 text-green-700': sz.typ === 'Offene Sprechzeit',
                      'bg-yellow-100 text-yellow-800': sz.typ === 'Telefonisch',
                      'bg-orange-100 text-orange-700': sz.typ === 'Bereitschaft'
                    }">
                    {{ sz.von }}-{{ sz.bis }}
                  </div>
                </ng-container>
              </div>
            </div>
          </div>
        </div>

        <!-- Legend -->
        <div class="flex flex-wrap gap-4 mb-6">
          <div class="flex items-center gap-1.5"><span class="w-3 h-3 rounded bg-blue-100 border border-blue-300"></span><span class="text-xs text-gray-600">Sprechzeit</span></div>
          <div class="flex items-center gap-1.5"><span class="w-3 h-3 rounded bg-green-100 border border-green-300"></span><span class="text-xs text-gray-600">Offene Sprechzeit</span></div>
          <div class="flex items-center gap-1.5"><span class="w-3 h-3 rounded bg-yellow-100 border border-yellow-300"></span><span class="text-xs text-gray-600">Telefonisch</span></div>
          <div class="flex items-center gap-1.5"><span class="w-3 h-3 rounded bg-orange-100 border border-orange-300"></span><span class="text-xs text-gray-600">Bereitschaft</span></div>
        </div>

        <!-- Add Sprechzeit form -->
        <div class="border border-gray-200 rounded-lg p-4">
          <h3 class="text-sm font-semibold text-gray-900 mb-3">Sprechzeit hinzufuegen</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Tag</label>
              <select [(ngModel)]="newSprechzeit.tag"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#006EC7] bg-white">
                <option *ngFor="let d of wochentage" [value]="d">{{ d }}</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Von</label>
              <input type="time" [(ngModel)]="newSprechzeit.von"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#006EC7]" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Bis</label>
              <input type="time" [(ngModel)]="newSprechzeit.bis"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#006EC7]" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Typ</label>
              <select [(ngModel)]="newSprechzeit.typ"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#006EC7] bg-white">
                <option *ngFor="let t of sprechzeitTypen" [value]="t">{{ t }}</option>
              </select>
            </div>
            <div>
              <button (click)="addSprechzeit()"
                class="w-full px-4 py-2 bg-[#006EC7] text-white text-sm font-medium rounded-lg hover:bg-[#0058A1] transition-colors">
                Hinzufuegen
              </button>
            </div>
          </div>
        </div>

        <!-- Added Sprechzeiten list -->
        <div *ngIf="wizardData.sprechzeiten.length > 0" class="mt-4 space-y-2">
          <div *ngFor="let sz of wizardData.sprechzeiten; let i = index"
            class="flex items-center justify-between px-3 py-2 rounded-lg text-sm"
            [ngClass]="{
              'bg-blue-50': sz.typ === 'Sprechzeit',
              'bg-green-50': sz.typ === 'Offene Sprechzeit',
              'bg-yellow-50': sz.typ === 'Telefonisch',
              'bg-orange-50': sz.typ === 'Bereitschaft'
            }">
            <span class="font-medium">{{ sz.tag }}: {{ sz.von }} - {{ sz.bis }} ({{ sz.typ }})</span>
            <button (click)="wizardData.sprechzeiten.splice(i, 1)" class="text-red-500 hover:text-red-700">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- STEP 3: Barrierefreiheit -->
      <div *ngIf="currentStep === 3" class="bg-white rounded-xl border border-gray-200 p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-6">Barrierefreiheit</h2>

        <div class="space-y-8">
          <div *ngFor="let gruppe of barrierefreiheitGruppen">
            <h3 class="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-[#006EC7]"></span>
              {{ gruppe.label }}
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <label *ngFor="let opt of gruppe.optionen"
                class="flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors"
                [ngClass]="opt.checked ? 'border-[#006EC7] bg-blue-50' : 'border-gray-200 hover:border-gray-300'">
                <input type="checkbox" [(ngModel)]="opt.checked"
                  class="w-4 h-4 text-[#006EC7] border-gray-300 rounded focus:ring-[#006EC7]" />
                <span class="text-sm text-gray-700">{{ opt.label }}</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- STEP 4: Taetige Aerzte -->
      <div *ngIf="currentStep === 4" class="bg-white rounded-xl border border-gray-200 p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-6">Taetige Aerzte</h2>

        <!-- Search -->
        <div class="relative mb-4">
          <svg class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35"/>
          </svg>
          <input type="text" [(ngModel)]="arztSearchTerm" placeholder="Arzt suchen..."
            class="pl-9 pr-4 py-2 w-full border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#006EC7] focus:border-transparent" />
        </div>

        <!-- Doctor list -->
        <div class="space-y-2 mb-6">
          <label *ngFor="let arzt of filteredAerzte()"
            class="flex items-center gap-4 p-3 border rounded-lg cursor-pointer transition-colors"
            [ngClass]="arzt.selected ? 'border-[#006EC7] bg-blue-50' : 'border-gray-200 hover:border-gray-300'">
            <input type="checkbox" [(ngModel)]="arzt.selected"
              class="w-4 h-4 text-[#006EC7] border-gray-300 rounded focus:ring-[#006EC7]" />
            <div class="flex-1">
              <p class="text-sm font-medium text-gray-900">{{ arzt.name }}</p>
              <p class="text-xs text-gray-500">LANR: {{ arzt.lanr }} &middot; {{ arzt.fachgebiet }}</p>
            </div>
          </label>
        </div>

        <!-- Selected doctors -->
        <div *ngIf="getSelectedAerzte().length > 0">
          <h3 class="text-sm font-semibold text-gray-900 mb-3">Ausgewaehlte Aerzte ({{ getSelectedAerzte().length }})</h3>
          <div class="flex flex-wrap gap-2">
            <span *ngFor="let arzt of getSelectedAerzte()"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#006EC7] text-white text-xs font-medium rounded-full">
              {{ arzt.name }}
              <button (click)="arzt.selected = false" class="hover:text-blue-200">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </span>
          </div>
        </div>
      </div>

      <!-- STEP 5: Zusammenfassung -->
      <div *ngIf="currentStep === 5" class="bg-white rounded-xl border border-gray-200 p-6">
        <ng-container *ngTemplateOutlet="zusammenfassungTpl; context: { lo: buildSummaryLeistungsort() }"></ng-container>
      </div>

      <!-- Wizard Navigation -->
      <div class="flex items-center justify-between mt-6">
        <button *ngIf="currentStep > 1" (click)="currentStep = currentStep - 1"
          class="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
          Zurueck
        </button>
        <div *ngIf="currentStep === 1"></div>
        <button *ngIf="currentStep < 5" (click)="currentStep = currentStep + 1"
          class="px-5 py-2.5 bg-[#006EC7] text-white text-sm font-medium rounded-lg hover:bg-[#0058A1] transition-colors">
          Weiter
        </button>
        <button *ngIf="currentStep === 5" (click)="saveLeistungsort()"
          class="px-5 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors">
          Speichern
        </button>
      </div>
    </ng-container>

    <!-- ===================== ZUSAMMENFASSUNG TEMPLATE ===================== -->
    <ng-template #zusammenfassungTpl let-lo="lo">
      <h2 class="text-lg font-semibold text-gray-900 mb-6">Zusammenfassung</h2>

      <!-- Art & Adresse -->
      <div class="mb-6">
        <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Art & Adresse</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
          <div class="flex justify-between py-1.5 border-b border-gray-100">
            <span class="text-sm text-gray-500">Typ</span>
            <span class="text-sm font-medium text-gray-900">{{ lo?.typ || wizardData.typ }}</span>
          </div>
          <div class="flex justify-between py-1.5 border-b border-gray-100">
            <span class="text-sm text-gray-500">Name</span>
            <span class="text-sm font-medium text-gray-900">{{ lo?.name || '-' }}</span>
          </div>
          <div class="flex justify-between py-1.5 border-b border-gray-100">
            <span class="text-sm text-gray-500">Adresse</span>
            <span class="text-sm font-medium text-gray-900">{{ lo?.strasse || wizardData.strasse }} {{ lo?.hausnummer || wizardData.hausnummer }}, {{ lo?.plz || wizardData.plz }} {{ lo?.ort || wizardData.ort }}</span>
          </div>
          <div class="flex justify-between py-1.5 border-b border-gray-100">
            <span class="text-sm text-gray-500">Telefon</span>
            <span class="text-sm font-medium text-gray-900">{{ lo?.telefon || wizardData.telefon }}</span>
          </div>
          <div class="flex justify-between py-1.5 border-b border-gray-100">
            <span class="text-sm text-gray-500">Email</span>
            <span class="text-sm font-medium text-gray-900">{{ lo?.email || wizardData.email }}</span>
          </div>
          <div class="flex justify-between py-1.5 border-b border-gray-100">
            <span class="text-sm text-gray-500">Website</span>
            <span class="text-sm font-medium text-gray-900">{{ wizardData.website || lo?.website || '-' }}</span>
          </div>
        </div>
      </div>

      <!-- Sprechzeiten -->
      <div class="mb-6">
        <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Sprechzeiten</h3>
        <div *ngIf="wizardData.sprechzeiten.length === 0" class="text-sm text-gray-400 italic">Keine Sprechzeiten eingetragen</div>
        <div class="space-y-1">
          <div *ngFor="let sz of wizardData.sprechzeiten"
            class="flex items-center gap-2 py-1.5 text-sm">
            <span class="w-2 h-2 rounded-full"
              [ngClass]="{
                'bg-blue-500': sz.typ === 'Sprechzeit',
                'bg-green-500': sz.typ === 'Offene Sprechzeit',
                'bg-yellow-500': sz.typ === 'Telefonisch',
                'bg-orange-500': sz.typ === 'Bereitschaft'
              }"></span>
            <span class="font-medium text-gray-700 w-12">{{ sz.tag }}</span>
            <span class="text-gray-900">{{ sz.von }} - {{ sz.bis }}</span>
            <span class="text-gray-500">({{ sz.typ }})</span>
          </div>
        </div>
      </div>

      <!-- Barrierefreiheit -->
      <div class="mb-6">
        <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Barrierefreiheit</h3>
        <div class="flex flex-wrap gap-2">
          <ng-container *ngFor="let gruppe of barrierefreiheitGruppen">
            <ng-container *ngFor="let opt of gruppe.optionen">
              <span *ngIf="opt.checked"
                class="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full border border-green-200">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                </svg>
                {{ opt.label }}
              </span>
            </ng-container>
          </ng-container>
        </div>
        <div *ngIf="getCheckedBarrierefreiheitCount() === 0" class="text-sm text-gray-400 italic">Keine Angaben</div>
      </div>

      <!-- Taetige Aerzte -->
      <div>
        <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Taetige Aerzte</h3>
        <div *ngIf="getSelectedAerzte().length === 0" class="text-sm text-gray-400 italic">Keine Aerzte zugeordnet</div>
        <div class="space-y-2">
          <div *ngFor="let arzt of getSelectedAerzte()"
            class="flex items-center gap-3 py-2 px-3 bg-gray-50 rounded-lg">
            <div class="w-8 h-8 rounded-full bg-[#006EC7] flex items-center justify-center text-white text-xs font-bold">
              {{ arzt.name.charAt(0) }}
            </div>
            <div>
              <p class="text-sm font-medium text-gray-900">{{ arzt.name }}</p>
              <p class="text-xs text-gray-500">LANR: {{ arzt.lanr }} &middot; {{ arzt.fachgebiet }}</p>
            </div>
          </div>
        </div>
      </div>
    </ng-template>
  `
})
export class ArztregisterComponent {
  view: 'list' | 'wizard' | 'detail' = 'list';
  currentStep = 1;
  searchTerm = '';
  arztSearchTerm = '';
  selectedLeistungsort: Leistungsort | null = null;

  stepLabels = ['Art & Adresse', 'Sprechzeiten', 'Barrierefreiheit', 'Taetige Aerzte', 'Zusammenfassung'];
  wochentage = ['Mo', 'Di', 'Mi', 'Do', 'Fr'];
  stundenRaster = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];

  leistungsortTypen = [
    'Einzelpraxis', 'BAG', 'TBAG', 'MVZ', 'Praxisklinik',
    'Ambulanz', 'Tagesklinik', 'Medikamentoeser Behandlungsplatz', 'Dialysezentrum', 'Sonstiger'
  ];

  sprechzeitTypen = ['Sprechzeit', 'Offene Sprechzeit', 'Telefonisch', 'Bereitschaft'];

  stats = [
    { label: 'Leistungsorte', value: '5' },
    { label: 'Aerzte', value: '12' },
    { label: 'Barrierefreie', value: '3' },
    { label: 'Letzte Aktualisierung', value: 'heute' }
  ];

  leistungsorte: Leistungsort[] = [
    { id: 1, typ: 'Einzelpraxis', name: 'Praxis Dr. Mueller', strasse: 'Hauptstr.', hausnummer: '12', plz: '50667', ort: 'Koeln', telefon: '0221 1234567', fax: '0221 1234568', email: 'mueller@praxis.de', website: 'www.praxis-mueller.de', aerzte: 2, barrierefrei: true },
    { id: 2, typ: 'BAG', name: 'Gemeinschaftspraxis am Dom', strasse: 'Domstr.', hausnummer: '5', plz: '50668', ort: 'Koeln', telefon: '0221 9876543', fax: '0221 9876544', email: 'info@bag-dom.de', website: 'www.bag-dom.de', aerzte: 4, barrierefrei: true },
    { id: 3, typ: 'MVZ', name: 'MVZ Rheinland', strasse: 'Rheinuferstr.', hausnummer: '78', plz: '40213', ort: 'Duesseldorf', telefon: '0211 5554433', fax: '0211 5554434', email: 'kontakt@mvz-rheinland.de', website: 'www.mvz-rheinland.de', aerzte: 3, barrierefrei: true },
    { id: 4, typ: 'Praxisklinik', name: 'Praxisklinik Westfalen', strasse: 'Westfalenweg', hausnummer: '22', plz: '44137', ort: 'Dortmund', telefon: '0231 7778899', fax: '0231 7778800', email: 'info@pk-westfalen.de', website: 'www.pk-westfalen.de', aerzte: 2, barrierefrei: false },
    { id: 5, typ: 'Einzelpraxis', name: 'Praxis Dr. Schmidt', strasse: 'Berliner Allee', hausnummer: '33', plz: '40212', ort: 'Duesseldorf', telefon: '0211 3334455', fax: '0211 3334456', email: 'schmidt@praxis-dd.de', website: '', aerzte: 1, barrierefrei: false }
  ];

  aerzte: Arzt[] = [
    { id: 1, name: 'Dr. Anna Mueller', lanr: '123456789', fachgebiet: 'Allgemeinmedizin', selected: false },
    { id: 2, name: 'Dr. Thomas Weber', lanr: '234567890', fachgebiet: 'Innere Medizin', selected: false },
    { id: 3, name: 'Dr. Sabine Fischer', lanr: '345678901', fachgebiet: 'Kinder- und Jugendmedizin', selected: false },
    { id: 4, name: 'Dr. Markus Braun', lanr: '456789012', fachgebiet: 'Chirurgie', selected: false },
    { id: 5, name: 'Dr. Claudia Hoffmann', lanr: '567890123', fachgebiet: 'Gynaekologie', selected: false },
    { id: 6, name: 'Dr. Peter Schneider', lanr: '678901234', fachgebiet: 'Orthopaedie', selected: false }
  ];

  barrierefreiheitGruppen: BarrierefreiheitGruppe[] = [
    {
      label: 'Seh-Einschraenkungen',
      optionen: [
        { label: 'Taktile Leitsysteme', checked: false },
        { label: 'Braille-Beschriftung', checked: false },
        { label: 'Kontrastreiche Beschilderung', checked: false },
        { label: 'Sprachausgabe', checked: false },
        { label: 'Grosse Schrift', checked: false }
      ]
    },
    {
      label: 'Mobilitaet',
      optionen: [
        { label: 'Stufenloser Zugang', checked: false },
        { label: 'Aufzug', checked: false },
        { label: 'Breite Tueren', checked: false },
        { label: 'Behinderten-WC', checked: false },
        { label: 'Rollstuhlgerechte Untersuchungsliege', checked: false }
      ]
    },
    {
      label: 'Kognitive Einschraenkungen',
      optionen: [
        { label: 'Leichte Sprache', checked: false },
        { label: 'Piktogramme', checked: false },
        { label: 'Ruheraum', checked: false },
        { label: 'Begleitperson moeglich', checked: false }
      ]
    }
  ];

  wizardData = {
    typ: '',
    strasse: '',
    hausnummer: '',
    plz: '',
    ort: '',
    telefon: '',
    fax: '',
    email: '',
    website: '',
    sprechzeiten: [] as Sprechzeit[]
  };

  newSprechzeit: Sprechzeit = { tag: 'Mo', von: '08:00', bis: '12:00', typ: 'Sprechzeit' };

  filteredLeistungsorte(): Leistungsort[] {
    if (!this.searchTerm.trim()) return this.leistungsorte;
    const term = this.searchTerm.toLowerCase();
    return this.leistungsorte.filter(lo =>
      lo.name.toLowerCase().includes(term) ||
      lo.typ.toLowerCase().includes(term) ||
      lo.ort.toLowerCase().includes(term)
    );
  }

  filteredAerzte(): Arzt[] {
    if (!this.arztSearchTerm.trim()) return this.aerzte;
    const term = this.arztSearchTerm.toLowerCase();
    return this.aerzte.filter(a =>
      a.name.toLowerCase().includes(term) ||
      a.lanr.includes(term) ||
      a.fachgebiet.toLowerCase().includes(term)
    );
  }

  getSelectedAerzte(): Arzt[] {
    return this.aerzte.filter(a => a.selected);
  }

  getSprechzeitenForSlot(tag: string, stunde: number): Sprechzeit[] {
    return this.wizardData.sprechzeiten.filter(sz => {
      const vonHour = parseInt(sz.von.split(':')[0], 10);
      const bisHour = parseInt(sz.bis.split(':')[0], 10);
      return sz.tag === tag && vonHour <= stunde && bisHour > stunde;
    });
  }

  addSprechzeit(): void {
    this.wizardData.sprechzeiten.push({ ...this.newSprechzeit });
    this.newSprechzeit = { tag: 'Mo', von: '08:00', bis: '12:00', typ: 'Sprechzeit' };
  }

  getCheckedBarrierefreiheitCount(): number {
    return this.barrierefreiheitGruppen.reduce(
      (sum, g) => sum + g.optionen.filter(o => o.checked).length, 0
    );
  }

  startWizard(): void {
    this.view = 'wizard';
    this.currentStep = 1;
  }

  showDetail(lo: Leistungsort): void {
    this.selectedLeistungsort = lo;
    this.view = 'detail';
  }

  buildSummaryLeistungsort(): Partial<Leistungsort> {
    return {
      typ: this.wizardData.typ,
      name: this.wizardData.typ,
      strasse: this.wizardData.strasse,
      hausnummer: this.wizardData.hausnummer,
      plz: this.wizardData.plz,
      ort: this.wizardData.ort,
      telefon: this.wizardData.telefon,
      email: this.wizardData.email,
      website: this.wizardData.website
    };
  }

  saveLeistungsort(): void {
    const newLo: Leistungsort = {
      id: this.leistungsorte.length + 1,
      typ: this.wizardData.typ,
      name: this.wizardData.typ + ' - ' + this.wizardData.ort,
      strasse: this.wizardData.strasse,
      hausnummer: this.wizardData.hausnummer,
      plz: this.wizardData.plz,
      ort: this.wizardData.ort,
      telefon: this.wizardData.telefon,
      fax: this.wizardData.fax,
      email: this.wizardData.email,
      website: this.wizardData.website,
      aerzte: this.getSelectedAerzte().length,
      barrierefrei: this.getCheckedBarrierefreiheitCount() > 0
    };
    this.leistungsorte.push(newLo);
    this.stats[0].value = String(this.leistungsorte.length);
    this.resetWizard();
    this.view = 'list';
  }

  resetWizard(): void {
    this.currentStep = 1;
    this.wizardData = { typ: '', strasse: '', hausnummer: '', plz: '', ort: '', telefon: '', fax: '', email: '', website: '', sprechzeiten: [] };
    this.aerzte.forEach(a => a.selected = false);
    this.barrierefreiheitGruppen.forEach(g => g.optionen.forEach(o => o.checked = false));
    this.newSprechzeit = { tag: 'Mo', von: '08:00', bis: '12:00', typ: 'Sprechzeit' };
  }
}
