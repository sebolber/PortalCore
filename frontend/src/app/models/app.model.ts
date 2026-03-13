export type AppCategory = 'ABRECHNUNG' | 'FALLMANAGEMENT' | 'VERWALTUNG' | 'KI_AGENTEN' | 'ANALYSE' | 'KOMMUNIKATION' | 'INTEGRATION' | 'FORMULARE';
export type MarketSegment = 'STEUERUNG_PRUEFSTELLEN' | 'KOSTENTRAEGER' | 'ABRECHNUNGSDIENSTLEISTER' | 'LEISTUNGSERBRINGER' | 'INFRASTRUKTUR_PLATTFORMEN' | 'OEFFENTLICHE_HAND_FORSCHUNG';
export type AppType = 'ANWENDUNG' | 'INTEGRATION';
export type AppVendor = 'HEALTH_PORTAL' | 'PLATFORM' | 'COMMUNITY' | 'DRITTANBIETER';

export interface PortalApp {
  id: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  category: AppCategory;
  marketSegment: MarketSegment;
  appType: AppType;
  vendor: AppVendor;
  vendorName: string;
  version: string;
  iconColor: string;
  iconInitials: string;
  rating: number;
  reviewCount: number;
  installCount: number;
  tags: string[];
  price: 'kostenlos' | 'lizenzpflichtig';
  compatibility: string[];
  featured: boolean;
  isNew: boolean;
  route?: string;
  repositoryUrl?: string;
  applicationUrl?: string;
  manifestImage?: string;
  manifestPort?: number;
  manifestDockerfile?: string;
}

export type DeployStatus = 'PENDING' | 'DEPLOYING' | 'RUNNING' | 'STOPPED' | 'FAILED';

export interface InstalledApp {
  id: string;
  tenant?: { id: string; name: string; shortName: string };
  app?: PortalApp;
  installedAt: string;
  installedBy: string;
  status: string;
  deployStatus?: DeployStatus;
  containerName?: string;
  containerPort?: number;
  deployLog?: string;
  deployedAt?: string;
}

export interface DeploymentStatus {
  id: string;
  deployStatus: DeployStatus;
  containerRunning: boolean;
  containerName: string;
  containerPort: number;
  deployLog: string;
}
