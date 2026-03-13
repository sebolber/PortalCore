-- Deployment fields for container-based app management

ALTER TABLE installed_apps ADD COLUMN container_id VARCHAR(100);
ALTER TABLE installed_apps ADD COLUMN container_name VARCHAR(200);
ALTER TABLE installed_apps ADD COLUMN container_port INT;
ALTER TABLE installed_apps ADD COLUMN deploy_status VARCHAR(30) DEFAULT 'PENDING';
ALTER TABLE installed_apps ADD COLUMN deploy_log TEXT;
ALTER TABLE installed_apps ADD COLUMN deployed_at TIMESTAMP;

-- App-level deployment config (from portal-app.yaml manifest)
ALTER TABLE portal_apps ADD COLUMN manifest_image VARCHAR(500);
ALTER TABLE portal_apps ADD COLUMN manifest_port INT;
ALTER TABLE portal_apps ADD COLUMN manifest_dockerfile VARCHAR(200);
ALTER TABLE portal_apps ADD COLUMN manifest_env TEXT;
ALTER TABLE portal_apps ADD COLUMN manifest_health_check VARCHAR(200);
