-- ============================================================
-- Migration : Gestion des profils familiaux
-- ============================================================

-- 1. Créer le type ENUM pour la relation familiale
DO $$ BEGIN
  CREATE TYPE relation_type AS ENUM ('ENFANT', 'CONJOINT', 'PARENT', 'AUTRE');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 2. Créer la table family_members
CREATE TABLE IF NOT EXISTS family_members (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id      UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    prenom          VARCHAR(100) NOT NULL,
    nom             VARCHAR(100) NOT NULL,
    date_naissance  DATE NOT NULL,
    relation        relation_type NOT NULL,
    sexe            CHAR(1) NOT NULL CHECK (sexe IN ('M', 'F')),
    nss             VARCHAR(50),
    allergies       JSONB DEFAULT '[]',
    groupe_sanguin  VARCHAR(5),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

-- 3. Index partiel sur patient_id (exclut les enregistrements supprimés)
CREATE INDEX IF NOT EXISTS idx_family_members_patient_id
    ON family_members(patient_id)
    WHERE deleted_at IS NULL;

-- 4. Ajouter les colonnes bénéficiaire sur la table appointments
ALTER TABLE appointments
    ADD COLUMN IF NOT EXISTS beneficiary_id     UUID REFERENCES family_members(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS beneficiary_nom    VARCHAR(100),
    ADD COLUMN IF NOT EXISTS beneficiary_prenom VARCHAR(100);

-- ============================================================
-- Fin de la migration
-- ============================================================
