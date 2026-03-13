-- V8: Mandantenspezifische Parameter
-- Parameter koennen einem Mandanten zugeordnet werden.
-- Wenn tenant_id NULL ist, gilt der Parameter uebergreifend fuer alle Mandanten.

ALTER TABLE portal_parameters ADD COLUMN tenant_id VARCHAR(50) REFERENCES tenants(id);

ALTER TABLE parameter_audit_log ADD COLUMN tenant_id VARCHAR(50);

-- Index fuer schnelle Mandanten-Abfragen
CREATE INDEX idx_portal_parameters_tenant ON portal_parameters(tenant_id);
CREATE INDEX idx_parameter_audit_log_tenant ON parameter_audit_log(tenant_id);
