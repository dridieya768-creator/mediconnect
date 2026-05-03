-- Migration : création de la table pharmaciens
-- Liée à la table users via user_id (OneToOne)

CREATE TABLE IF NOT EXISTS pharmaciens (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,

  -- Informations professionnelles
  numero_ordre        VARCHAR(50),
  nom_pharmacie       VARCHAR(255),

  -- Localisation
  adresse_pharmacie   TEXT,
  ville               VARCHAR(100),
  code_postal         VARCHAR(10),
  latitude            DECIMAL(10, 7),
  longitude           DECIMAL(10, 7),

  -- Contact
  telephone_pharmacie VARCHAR(20),
  email_pharmacie     VARCHAR(255),

  -- Horaires & Disponibilité
  horaires_ouverture  JSONB,
  is_garde            BOOLEAN NOT NULL DEFAULT FALSE,
  is_ouverte_24h      BOOLEAN NOT NULL DEFAULT FALSE,

  -- Médias
  photo_url           TEXT,

  -- Timestamps
  created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Index pour recherche par ville et garde
CREATE INDEX IF NOT EXISTS idx_pharmaciens_ville    ON pharmaciens(ville);
CREATE INDEX IF NOT EXISTS idx_pharmaciens_is_garde ON pharmaciens(is_garde);
