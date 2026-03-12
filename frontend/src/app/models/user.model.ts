import { Tenant } from './tenant.model';

export interface PortalUser {
  id: string;
  vorname: string;
  nachname: string;
  email: string;
  iamId: string;
  tenant: Tenant;
  mandant: string;
  mandantId: string;
  status: 'aktiv' | 'inaktiv' | 'gesperrt';
  rollenIds: string[];
  letzterLogin: string;
  erstelltAm: string;
  iamSync: boolean;
  initialen: string;
}

export interface PortalRolle {
  id: string;
  name: string;
  beschreibung: string;
  hierarchie: number;
  berechtigungIds: string[];
  scope: string;
  benutzerAnzahl: number;
  systemRolle: boolean;
  farbe: string;
}

export interface Berechtigung {
  id: string;
  key: string;
  label: string;
  beschreibung: string;
  typ: 'lesen' | 'schreiben' | 'loeschen' | 'admin';
  appId: string;
  appName: string;
  gruppe: string;
}
