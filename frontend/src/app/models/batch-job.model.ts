export type BatchStatus = 'geplant' | 'wartend' | 'laeuft' | 'pausiert' | 'gestoppt' | 'erfolgreich' | 'fehlgeschlagen';

export interface BatchJob {
  id: string;
  name: string;
  beschreibung: string;
  produktId: string;
  schedule: string;
  status: BatchStatus;
  gestartetUm?: string;
  beendetUm?: string;
  naechsterLauf: string;
  dauer?: string;
  fortschritt?: number;
  protokoll: BatchProtokollEintrag[];
}

export interface BatchProtokollEintrag {
  zeit: string;
  level: 'info' | 'warn' | 'error';
  nachricht: string;
}
