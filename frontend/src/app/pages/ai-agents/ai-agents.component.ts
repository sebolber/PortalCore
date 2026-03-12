import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface AiAgent {
  id: string;
  name: string;
  beschreibung: string;
  status: 'deployed' | 'draft' | 'paused';
  modell: string;
  mcpServers: string[];
  aufrufe: number;
  tokens: string;
  latenz: string;
}

@Component({
  selector: 'app-ai-agents',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6" style="font-family: 'Fira Sans', sans-serif">

      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">KI-Agenten</h1>
          <p class="text-sm text-gray-500 mt-1">KI-Agenten verwalten und ueberwachen</p>
        </div>
        <button class="px-4 py-2 text-sm font-medium text-white bg-[#006EC7] hover:bg-[#005ba3] rounded-lg transition-colors flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
          </svg>
          Neuer Agent
        </button>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white border border-gray-200 rounded-xl p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">Agenten</p>
              <p class="text-2xl font-bold text-gray-900 mt-1">{{ agents().length }}</p>
            </div>
            <div class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="9" cy="16" r="1" fill="currentColor"/><circle cx="15" cy="16" r="1" fill="currentColor"/><path d="M8 11V7a4 4 0 118 0v4"/>
              </svg>
            </div>
          </div>
        </div>
        <div class="bg-white border border-gray-200 rounded-xl p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">Aufrufe</p>
              <p class="text-2xl font-bold text-gray-900 mt-1">12.450</p>
            </div>
            <div class="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
              </svg>
            </div>
          </div>
        </div>
        <div class="bg-white border border-gray-200 rounded-xl p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">Tokens</p>
              <p class="text-2xl font-bold text-gray-900 mt-1">2.3M</p>
            </div>
            <div class="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
              <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
              </svg>
            </div>
          </div>
        </div>
        <div class="bg-white border border-gray-200 rounded-xl p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">Latenz</p>
              <p class="text-2xl font-bold text-gray-900 mt-1">340ms</p>
            </div>
            <div class="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
              <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Agent Cards -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div *ngFor="let agent of agents()"
             class="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all duration-200">
          <!-- Header -->
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-[#006EC7] to-[#0094ff] flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                  <rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="9" cy="16" r="1" fill="currentColor"/><circle cx="15" cy="16" r="1" fill="currentColor"/><path d="M8 11V7a4 4 0 118 0v4"/>
                </svg>
              </div>
              <div>
                <h3 class="text-sm font-semibold text-gray-900">{{ agent.name }}</h3>
                <p class="text-xs text-gray-500 mt-0.5">{{ agent.beschreibung }}</p>
              </div>
            </div>
            <span class="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full"
                  [ngClass]="getStatusBadgeClass(agent.status)">
              <span class="w-1.5 h-1.5 rounded-full"
                    [ngClass]="{
                      'bg-green-500': agent.status === 'deployed',
                      'bg-yellow-500': agent.status === 'draft',
                      'bg-gray-400': agent.status === 'paused'
                    }"></span>
              {{ getStatusLabel(agent.status) }}
            </span>
          </div>

          <!-- Model -->
          <div class="flex items-center gap-2 mb-3">
            <span class="text-xs text-gray-500">Modell:</span>
            <span class="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">{{ agent.modell }}</span>
          </div>

          <!-- MCP Servers -->
          <div class="mb-4">
            <span class="text-xs text-gray-500 block mb-1.5">MCP-Server:</span>
            <div class="flex flex-wrap gap-1.5">
              <span *ngFor="let server of agent.mcpServers"
                    class="px-2 py-0.5 text-[10px] font-medium bg-blue-50 text-blue-700 rounded-full">
                {{ server }}
              </span>
            </div>
          </div>

          <!-- Metrics -->
          <div class="grid grid-cols-3 gap-3 py-3 border-t border-gray-100">
            <div class="text-center">
              <p class="text-xs text-gray-500">Aufrufe</p>
              <p class="text-sm font-semibold text-gray-900 mt-0.5">{{ agent.aufrufe | number }}</p>
            </div>
            <div class="text-center">
              <p class="text-xs text-gray-500">Tokens</p>
              <p class="text-sm font-semibold text-gray-900 mt-0.5">{{ agent.tokens }}</p>
            </div>
            <div class="text-center">
              <p class="text-xs text-gray-500">Latenz</p>
              <p class="text-sm font-semibold text-gray-900 mt-0.5">{{ agent.latenz }}</p>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
            <button class="flex-1 px-3 py-1.5 text-xs font-medium text-[#006EC7] bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
              Bearbeiten
            </button>
            <button *ngIf="agent.status === 'deployed'"
                    class="px-3 py-1.5 text-xs font-medium text-yellow-600 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors">
              Pausieren
            </button>
            <button *ngIf="agent.status === 'paused'"
                    class="px-3 py-1.5 text-xs font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
              Aktivieren
            </button>
            <button class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

    </div>
  `,
})
export class AiAgentsComponent {
  readonly agents = signal<AiAgent[]>([
    {
      id: 'ai-1',
      name: 'Kodierassistent',
      beschreibung: 'Unterstuetzt bei der ICD/OPS-Kodierung',
      status: 'deployed',
      modell: 'Claude 3.5 Sonnet',
      mcpServers: ['ICD-Katalog', 'OPS-Katalog', 'Fallakte'],
      aufrufe: 5230,
      tokens: '980K',
      latenz: '280ms',
    },
    {
      id: 'ai-2',
      name: 'Dokumenten-Analyse',
      beschreibung: 'Automatische Analyse eingehender Dokumente',
      status: 'deployed',
      modell: 'Claude 3.5 Sonnet',
      mcpServers: ['DMS', 'OCR-Service', 'Klassifikation'],
      aufrufe: 4120,
      tokens: '850K',
      latenz: '420ms',
    },
    {
      id: 'ai-3',
      name: 'Abrechnungs-Pruefung',
      beschreibung: 'Plausibilitaetspruefung von Abrechnungsdaten',
      status: 'draft',
      modell: 'GPT-4o',
      mcpServers: ['SMILE-API', 'Regelwerk'],
      aufrufe: 0,
      tokens: '0',
      latenz: '-',
    },
    {
      id: 'ai-4',
      name: 'Chatbot Portal-Hilfe',
      beschreibung: 'Beantwortet Benutzerfragen zum Portal',
      status: 'paused',
      modell: 'Claude 3 Haiku',
      mcpServers: ['CMS', 'FAQ-Datenbank'],
      aufrufe: 3100,
      tokens: '470K',
      latenz: '190ms',
    },
  ]);

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'deployed': return 'bg-green-100 text-green-700';
      case 'draft': return 'bg-yellow-100 text-yellow-700';
      case 'paused': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'deployed': return 'Deployed';
      case 'draft': return 'Entwurf';
      case 'paused': return 'Pausiert';
      default: return status;
    }
  }
}
