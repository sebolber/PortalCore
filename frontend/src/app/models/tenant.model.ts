export interface Tenant {
  id: string;
  name: string;
  shortName: string;
  strasse?: string;
  hausnummer?: string;
  plz?: string;
  ort?: string;
  land?: string;
  telefon?: string;
  email?: string;
  webseite?: string;
  ansprechpartner?: string;
  aktiv?: boolean;
}
