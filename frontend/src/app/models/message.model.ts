export interface PortalMessage {
  id: string;
  title: string;
  body: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  category: 'system' | 'app' | 'admin';
  sender: string;
  timestamp: string;
  read: boolean;
  appId?: string;
}
