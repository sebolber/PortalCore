export interface EingereichterFall {
  id: string;
  fallNr: string;
  patient: string;
  krankenhaus: string;
  drgCode: string;
  einreichungsDatum: string;
  betrag: number;
  ampel: 'gruen' | 'gelb' | 'rot';
  ampelGrund: string;
}

export interface OffeneRechnung {
  id: string;
  rechnungsNr: string;
  krankenhaus: string;
  patient: string;
  rechnungsDatum: string;
  faelligkeitsDatum: string;
  betrag: number;
  bezahlt: number;
  status: 'offen' | 'in_pruefung' | 'gemahnt' | 'teilbezahlt';
  tageOffen: number;
  bemerkung?: string;
}
