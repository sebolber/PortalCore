import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AufgabenZuweisung, AufgabenGruppe } from '../models/aufgaben.model';
import { API_URL } from './api.service';

@Injectable({ providedIn: 'root' })
export class AufgabenService {

  private zuweisungenPath = `${API_URL}/aufgaben/zuweisungen`;
  private gruppenPath = `${API_URL}/aufgaben/gruppen`;

  constructor(private http: HttpClient) {}

  // Zuweisungen
  getAllZuweisungen(): Observable<AufgabenZuweisung[]> {
    return this.http.get<AufgabenZuweisung[]>(this.zuweisungenPath);
  }

  getZuweisungById(id: string): Observable<AufgabenZuweisung> {
    return this.http.get<AufgabenZuweisung>(`${this.zuweisungenPath}/${id}`);
  }

  getZuweisungenByProdukt(produktId: string): Observable<AufgabenZuweisung[]> {
    return this.http.get<AufgabenZuweisung[]>(this.zuweisungenPath, {
      params: { produktId }
    });
  }

  createZuweisung(zuweisung: Partial<AufgabenZuweisung>): Observable<AufgabenZuweisung> {
    return this.http.post<AufgabenZuweisung>(this.zuweisungenPath, zuweisung);
  }

  updateZuweisung(id: string, zuweisung: Partial<AufgabenZuweisung>): Observable<AufgabenZuweisung> {
    return this.http.put<AufgabenZuweisung>(`${this.zuweisungenPath}/${id}`, zuweisung);
  }

  deleteZuweisung(id: string): Observable<void> {
    return this.http.delete<void>(`${this.zuweisungenPath}/${id}`);
  }

  // Gruppen
  getAllGruppen(): Observable<AufgabenGruppe[]> {
    return this.http.get<AufgabenGruppe[]>(this.gruppenPath);
  }

  getGruppeById(id: string): Observable<AufgabenGruppe> {
    return this.http.get<AufgabenGruppe>(`${this.gruppenPath}/${id}`);
  }

  createGruppe(gruppe: Partial<AufgabenGruppe>): Observable<AufgabenGruppe> {
    return this.http.post<AufgabenGruppe>(this.gruppenPath, gruppe);
  }

  updateGruppe(id: string, gruppe: Partial<AufgabenGruppe>): Observable<AufgabenGruppe> {
    return this.http.put<AufgabenGruppe>(`${this.gruppenPath}/${id}`, gruppe);
  }

  deleteGruppe(id: string): Observable<void> {
    return this.http.delete<void>(`${this.gruppenPath}/${id}`);
  }

  addMitglied(gruppeId: string, mitgliedId: string): Observable<AufgabenGruppe> {
    return this.http.post<AufgabenGruppe>(`${this.gruppenPath}/${gruppeId}/mitglieder`, { mitgliedId });
  }

  removeMitglied(gruppeId: string, mitgliedId: string): Observable<void> {
    return this.http.delete<void>(`${this.gruppenPath}/${gruppeId}/mitglieder/${mitgliedId}`);
  }
}
