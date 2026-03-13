-- Add repository and application URLs to portal_apps
ALTER TABLE portal_apps ADD COLUMN repository_url VARCHAR(500);
ALTER TABLE portal_apps ADD COLUMN application_url VARCHAR(500);

-- Update existing apps with sample URLs
UPDATE portal_apps SET application_url = '/apps/kv-ai' WHERE id = 'kv-ai-abrechnung';
UPDATE portal_apps SET application_url = '/apps/smile-kh' WHERE id = 'smile-kh';
UPDATE portal_apps SET application_url = '/arztregister' WHERE id = 'arztregister';
UPDATE portal_apps SET application_url = '/wb-foerderung' WHERE id = 'wb-foerderung';
UPDATE portal_apps SET application_url = '/apps/dmp' WHERE id = 'dmp-manager';
UPDATE portal_apps SET application_url = '/apps/smile-kv' WHERE id = 'smile-kv';
