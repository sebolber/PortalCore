export type KriteriumTyp = 'IK_NUMMER' | 'PLZ' | 'BETRIEBSNUMMER' | 'GEBURTSDATUM' | 'NAME';

export interface AufgabenGruppe {
  id: string;
  name: string;
  beschreibung: string;
  mitgliederIds: string[];
}

export interface AufgabenZuweisung {
  id: string;
  bezeichnung: string;
  kriterium: KriteriumTyp;
  kriteriumWert: string;
  zuweisungTyp: 'mitarbeiter' | 'gruppe';
  mitarbeiterId?: string;
  gruppeId?: string;
  produktId: string;
  gueltigVon: string;
  gueltigBis: string;
  prioritaet: 'hoch' | 'mittel' | 'niedrig';
  erstelltAm: string;
  erstelltVon: string;
  beschreibung?: string;
}
