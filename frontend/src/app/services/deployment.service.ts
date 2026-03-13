import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InstalledApp, DeploymentStatus } from '../models/app.model';
import { API_URL } from './api.service';

@Injectable({ providedIn: 'root' })
export class DeploymentService {

  private basePath = `${API_URL}/deployments`;

  constructor(private http: HttpClient) {}

  deploy(installedAppId: string): Observable<void> {
    return this.http.post<void>(`${this.basePath}/${installedAppId}/deploy`, {});
  }

  deploySync(installedAppId: string): Observable<InstalledApp> {
    return this.http.post<InstalledApp>(`${this.basePath}/${installedAppId}/deploy-sync`, {});
  }

  undeploy(installedAppId: string): Observable<InstalledApp> {
    return this.http.post<InstalledApp>(`${this.basePath}/${installedAppId}/undeploy`, {});
  }

  getStatus(installedAppId: string): Observable<DeploymentStatus> {
    return this.http.get<DeploymentStatus>(`${this.basePath}/${installedAppId}/status`);
  }
}
