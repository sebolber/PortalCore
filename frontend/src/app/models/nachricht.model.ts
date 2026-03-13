export type NachrichtTyp = 'NACHRICHT' | 'AUFGABE';
export type NachrichtPrioritaet = 'NIEDRIG' | 'NORMAL' | 'HOCH' | 'DRINGEND';
export type NachrichtStatus = 'OFFEN' | 'IN_BEARBEITUNG' | 'ERLEDIGT' | 'ABGEBROCHEN';

export interface NachrichtEmpfaenger {
  id: string;
  name: string;
  initialen: string;
  gelesen: boolean;
  archiviert: boolean;
  erledigt: boolean;
}

export interface NachrichtAnhang {
  id: string;
  dateiname: string;
  dateityp: string;
  dateigroesse: number;
  erstelltAm: string;
}

export interface NachrichtItem {
  id: string;
  typ: NachrichtTyp;
  betreff: string;
  inhalt: string;
  erstellerId: string;
  erstellerName: string;
  erstellerInitialen: string;
  prioritaet: NachrichtPrioritaet;
  status: NachrichtStatus;
  frist: string | null;
  erinnerungAm: string | null;
  erstelltAm: string;
  systemGeneriert: boolean;
  referenzTyp: string | null;
  referenzId: string | null;
  empfaenger: NachrichtEmpfaenger[];
  anhaenge: NachrichtAnhang[];
  gelesen: boolean;
  archiviert: boolean;
  erledigt: boolean;
}

export interface NachrichtErstellen {
  typ: NachrichtTyp;
  betreff: string;
  inhalt: string;
  prioritaet?: NachrichtPrioritaet;
  frist?: string;
  erinnerungAm?: string;
  empfaengerIds: string[];
  referenzTyp?: string;
  referenzId?: string;
}
