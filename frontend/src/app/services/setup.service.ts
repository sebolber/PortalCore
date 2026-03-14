import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from './api.service';

export interface SetupStatus {
  istInitialisiert: boolean;
  smtpKonfiguriert: boolean;
  mandantAngelegt: boolean;
  superuserAngelegt: boolean;
}

export interface SmtpKonfiguration {
  host: string;
  port: number;
  benutzername: string;
  passwort: string;
  verschluesselung: 'NONE' | 'TLS' | 'SSL';
  absenderName: string;
  absenderEmail: string;
  authentifizierungAktiv: boolean;
}

export interface SetupMandant {
  name: string;
  kuerzel: string;
  strasse?: string;
  hausnummer?: string;
  plz?: string;
  ort?: string;
  telefon?: string;
  email?: string;
}

export interface SetupSuperuser {
  vorname: string;
  nachname: string;
  email: string;
  passwort: string;
  passwortBestaetigung: string;
  sprache: string;
  zeitzone: string;
}

@Injectable({ providedIn: 'root' })
export class SetupService {

  constructor(private http: HttpClient) {}

  getStatus() {
    return this.http.get<SetupStatus>(`${API_URL}/setup/status`);
  }

  speichereSmtp(config: SmtpKonfiguration) {
    return this.http.post<{ message: string }>(`${API_URL}/setup/smtp`, config);
  }

  testeSmtp(config: SmtpKonfiguration) {
    return this.http.post<{ message: string }>(`${API_URL}/setup/smtp/test`, config);
  }

  erstelleMandant(mandant: SetupMandant) {
    return this.http.post<any>(`${API_URL}/setup/mandant`, mandant);
  }

  erstelleSuperuser(superuser: SetupSuperuser) {
    return this.http.post<{ message: string }>(`${API_URL}/setup/superuser`, superuser);
  }
}
