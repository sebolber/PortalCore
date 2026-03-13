export interface PortalParameter {
  id: string;
  key: string;
  label: string;
  description: string;
  appId: string;
  appName: string;
  group: string;
  type: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'EMAIL' | 'URL' | 'SELECT' | 'DATE' | 'PASSWORD' | 'TEXTAREA';
  value: string;
  defaultValue: string;
  required: boolean;
  validationRules: string;
  options?: string;
  unit?: string;
  sensitive: boolean;
  hotReload: boolean;
  lastModified: string;
  lastModifiedBy: string;
  createdAt: string;
  gueltigVon?: string;
  gueltigBis?: string;
}

export interface ParameterAuditLog {
  id: string;
  parameterId: string;
  paramKey: string;
  appId: string;
  appName: string;
  alterWert: string;
  neuerWert: string;
  geaendertVon: string;
  geaendertAm: string;
  grund: string;
}
