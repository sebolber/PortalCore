export interface PortalParameter {
  id: string;
  key: string;
  label: string;
  description: string;
  appId: string;
  appName: string;
  group: string;
  type: 'string' | 'number' | 'boolean' | 'email' | 'url' | 'select' | 'date' | 'password' | 'textarea';
  value: string;
  defaultValue: string;
  required: boolean;
  validationRules: any[];
  options?: string[];
  unit?: string;
  sensitive: boolean;
  hotReload: boolean;
  lastModified: string;
  lastModifiedBy: string;
  createdAt: string;
}
