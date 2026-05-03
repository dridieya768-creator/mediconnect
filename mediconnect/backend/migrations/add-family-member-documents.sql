-- ============================================================
-- Migration : Documents justificatifs pour membres familiaux
-- Ajoute 2 colonnes PDF dans family_members :
--   - doc_membre_path  : مضمون ولادة du membre (enfant/conjoint/parent)
--   - doc_patient_path : مضمون ولادة du patient (preuve du lien)
-- ============================================================

ALTER TABLE family_members
    ADD COLUMN IF NOT EXISTS doc_membre_path  VARCHAR(500),
    ADD COLUMN IF NOT EXISTS doc_patient_path VARCHAR(500);

-- ============================================================
-- Fin de la migration
-- ============================================================
