export type AppCategory = 'ABRECHNUNG' | 'FALLMANAGEMENT' | 'VERWALTUNG' | 'KI_AGENTEN' | 'ANALYSE' | 'KOMMUNIKATION' | 'INTEGRATION' | 'FORMULARE';
export type MarketSegment = 'STEUERUNG_PRUEFSTELLEN' | 'KOSTENTRAEGER' | 'ABRECHNUNGSDIENSTLEISTER' | 'LEISTUNGSERBRINGER' | 'INFRASTRUKTUR_PLATTFORMEN' | 'OEFFENTLICHE_HAND_FORSCHUNG';
export type AppType = 'anwendung' | 'integration';
export type AppVendor = 'health_portal' | 'platform' | 'community' | 'drittanbieter';

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
}

export interface InstalledApp {
  id: string;
  tenantId: string;
  appId: string;
  installedAt: string;
  installedBy: string;
  status: string;
  app?: PortalApp;
}
