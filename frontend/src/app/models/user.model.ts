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
  anrede?: string;
  titel?: string;
  telefon?: string;
  mobil?: string;
  abteilung?: string;
  positionTitel?: string;
  geburtsdatum?: string;
  // Neue Felder
  fehlgeschlageneLogins?: number;
  letzteLoginIp?: string;
  sprache?: string;
  zeitzone?: string;
  darkMode?: boolean;
  standardDashboard?: string;
  emailBenachrichtigungen?: boolean;
  pushBenachrichtigungen?: boolean;
  smsBenachrichtigungen?: boolean;
  newsletterEinwilligung?: boolean;
  letzteAenderungAm?: string;
  erstelltVon?: string;
  zuletztGeaendertVon?: string;
  auditTrailId?: string;
  delegationsrechte?: boolean;
  stellvertreterIds?: string[];
  adressen?: UserAdresse[];
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

export interface UserAdresse {
  id: string;
  typ: string;
  bezeichnung?: string;
  strasse?: string;
  hausnummer?: string;
  plz?: string;
  ort?: string;
  land?: string;
  zusatz?: string;
  istHauptadresse: boolean;
}

export interface Gruppe {
  id: string;
  name: string;
  beschreibung?: string;
  tenantId?: string;
  systemGruppe: boolean;
  farbe?: string;
  berechtigungen: GruppenBerechtigung[];
  benutzer?: PortalUser[];
}

export interface GruppenBerechtigung {
  id: string;
  useCase: string;
  useCaseLabel: string;
  anzeigen: boolean;
  lesen: boolean;
  schreiben: boolean;
  loeschen: boolean;
  appId?: string;
}

export interface UseCaseBerechtigung {
  useCase: string;
  label: string;
  anzeigen: boolean;
  lesen: boolean;
  schreiben: boolean;
  loeschen: boolean;
}
