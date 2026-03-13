import { Routes } from '@angular/router';
import { authGuard, loginGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
    canActivate: [loginGuard]
  },
  {
    path: '',
    loadComponent: () => import('./layout/portal-layout.component').then(m => m.PortalLayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: '', loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'appstore', loadComponent: () => import('./pages/appstore/app-store.component').then(m => m.AppStoreComponent) },
      { path: 'appstore/installiert', loadComponent: () => import('./pages/appstore/installed-apps.component').then(m => m.InstalledAppsComponent) },
      { path: 'appstore/:appId', loadComponent: () => import('./pages/appstore/app-detail.component').then(m => m.AppDetailComponent) },
      { path: 'nachrichten', loadComponent: () => import('./pages/messages/messages.component').then(m => m.MessagesComponent) },
      { path: 'cms', loadComponent: () => import('./pages/cms/cms.component').then(m => m.CmsComponent) },
      { path: 'batch', loadComponent: () => import('./pages/batch-jobs/batch-jobs.component').then(m => m.BatchJobsComponent) },
      { path: 'formulare', loadComponent: () => import('./pages/forms/forms.component').then(m => m.FormsComponent) },
      { path: 'ki-agenten', loadComponent: () => import('./pages/ai-agents/ai-agents.component').then(m => m.AiAgentsComponent) },
      { path: 'einstellungen', loadComponent: () => import('./pages/settings/settings.component').then(m => m.SettingsComponent) },
      { path: 'admin', loadComponent: () => import('./pages/admin/admin.component').then(m => m.AdminComponent) },
      { path: 'parameter', loadComponent: () => import('./pages/parameter/parameter.component').then(m => m.ParameterComponent) },
      { path: 'benutzer', loadComponent: () => import('./pages/users/users.component').then(m => m.UsersComponent) },
      { path: 'gruppen', loadComponent: () => import('./pages/gruppen/gruppen.component').then(m => m.GruppenComponent) },
      { path: 'mandanten', loadComponent: () => import('./pages/mandanten/mandanten.component').then(m => m.MandantenComponent) },
      { path: 'wb-foerderung', loadComponent: () => import('./pages/wb-foerderung/wb-foerderung.component').then(m => m.WbFoerderungComponent) },
      { path: 'arztregister', loadComponent: () => import('./pages/arztregister/arztregister.component').then(m => m.ArztregisterComponent) },
      { path: 'aufgaben', loadComponent: () => import('./pages/aufgabensteuerung/aufgabensteuerung.component').then(m => m.AufgabensteuerungComponent) },
    ]
  },
  { path: '**', redirectTo: '' }
];
