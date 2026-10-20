-- ==========================================================
-- Multi-Tenant Schema Setup: australian_proficiency
-- ==========================================================
CREATE SCHEMA IF NOT EXISTS australian_proficiency;

-- Grant schema access to Supabase API roles
GRANT USAGE ON SCHEMA australian_proficiency TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA australian_proficiency TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA australian_proficiency TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA australian_proficiency TO anon, authenticated, service_role;

-- Ensure future tables inherit full access
ALTER DEFAULT PRIVILEGES IN SCHEMA australian_proficiency GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA australian_proficiency GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA australian_proficiency GRANT ALL ON ROUTINES TO anon, authenticated, service_role;
