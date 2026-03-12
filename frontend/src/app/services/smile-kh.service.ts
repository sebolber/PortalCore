import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EingereichterFall, OffeneRechnung } from '../models/smile-kh.model';
import { API_URL } from './api.service';

@Injectable({ providedIn: 'root' })
export class SmileKhService {

  private faellePath = `${API_URL}/smile-kh/faelle`;
  private rechnungenPath = `${API_URL}/smile-kh/rechnungen`;

  constructor(private http: HttpClient) {}

  // Eingereichte Faelle
  getAllFaelle(): Observable<EingereichterFall[]> {
    return this.http.get<EingereichterFall[]>(this.faellePath);
  }

  getFallById(id: string): Observable<EingereichterFall> {
    return this.http.get<EingereichterFall>(`${this.faellePath}/${id}`);
  }

  getFaelleByAmpel(ampel: EingereichterFall['ampel']): Observable<EingereichterFall[]> {
    return this.http.get<EingereichterFall[]>(this.faellePath, {
      params: { ampel }
    });
  }

  createFall(fall: Partial<EingereichterFall>): Observable<EingereichterFall> {
    return this.http.post<EingereichterFall>(this.faellePath, fall);
  }

  updateFall(id: string, fall: Partial<EingereichterFall>): Observable<EingereichterFall> {
    return this.http.put<EingereichterFall>(`${this.faellePath}/${id}`, fall);
  }

  deleteFall(id: string): Observable<void> {
    return this.http.delete<void>(`${this.faellePath}/${id}`);
  }

  // Offene Rechnungen
  getAllRechnungen(): Observable<OffeneRechnung[]> {
    return this.http.get<OffeneRechnung[]>(this.rechnungenPath);
  }

  getRechnungById(id: string): Observable<OffeneRechnung> {
    return this.http.get<OffeneRechnung>(`${this.rechnungenPath}/${id}`);
  }

  getRechnungenByStatus(status: OffeneRechnung['status']): Observable<OffeneRechnung[]> {
    return this.http.get<OffeneRechnung[]>(this.rechnungenPath, {
      params: { status }
    });
  }

  createRechnung(rechnung: Partial<OffeneRechnung>): Observable<OffeneRechnung> {
    return this.http.post<OffeneRechnung>(this.rechnungenPath, rechnung);
  }

  updateRechnung(id: string, rechnung: Partial<OffeneRechnung>): Observable<OffeneRechnung> {
    return this.http.put<OffeneRechnung>(`${this.rechnungenPath}/${id}`, rechnung);
  }

  deleteRechnung(id: string): Observable<void> {
    return this.http.delete<void>(`${this.rechnungenPath}/${id}`);
  }
}
