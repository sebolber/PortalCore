export type WidgetKategorie = 'PORTAL' | 'APP' | 'QUICKLINK';
export type WidgetTyp = 'ZAHL' | 'TABELLE' | 'TORTE' | 'BALKEN' | 'QUICKLINK' | 'LISTE';

export interface WidgetDefinition {
  id: string;
  widgetKey: string;
  titel: string;
  beschreibung: string;
  kategorie: WidgetKategorie;
  widgetTyp: WidgetTyp;
  appId: string | null;
  appName: string | null;
  iconPath: string | null;
  standardBreite: number;
  standardHoehe: number;
  minBreite: number;
  minHoehe: number;
  maxBreite: number;
  maxHoehe: number;
  datenEndpunkt: string | null;
  linkZiel: string | null;
  konfigurierbar: boolean;
}

export interface DashboardWidget {
  id: string;
  definition: WidgetDefinition;
  positionX: number;
  positionY: number;
  breite: number;
  hoehe: number;
  konfiguration: string | null;
  sichtbar: boolean;
  sortierung: number;
}

export interface PortalSeite {
  id: string;
  seitenKey: string;
  titel: string;
  beschreibung: string;
  route: string;
  iconPath: string | null;
  kategorie: string;
  appId: string | null;
}
