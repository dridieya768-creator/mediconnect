-- Sprint 6 : Gestion du Stock Pharmacie
-- Exécuter dans PostgreSQL

CREATE TYPE stock_statut AS ENUM ('DISPONIBLE', 'RUPTURE', 'PERIME', 'RAPPEL');
CREATE TYPE type_mouvement AS ENUM ('RECEPTION', 'DELIVRANCE', 'RETOUR_FOURNISSEUR', 'INVENTAIRE_AJUSTEMENT', 'PEREMPTION');

CREATE TABLE IF NOT EXISTS stock_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cip VARCHAR NOT NULL UNIQUE,
  nom VARCHAR NOT NULL,
  dci VARCHAR,
  forme VARCHAR,
  dosage VARCHAR,
  fournisseur VARCHAR,
  quantite_totale INT NOT NULL DEFAULT 0,
  seuil_alerte INT NOT NULL DEFAULT 10,
  prix_achat DECIMAL(10,3) NOT NULL DEFAULT 0,
  prix_vente DECIMAL(10,3) NOT NULL DEFAULT 0,
  statut stock_statut NOT NULL DEFAULT 'DISPONIBLE',
  lots JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stock_mouvements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stock_item_id UUID NOT NULL REFERENCES stock_items(id) ON DELETE CASCADE,
  type type_mouvement NOT NULL,
  quantite INT NOT NULL,
  lot VARCHAR,
  motif VARCHAR,
  pharmacien_id UUID,
  avoir_montant DECIMAL(10,3),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stock_mouvements_item ON stock_mouvements(stock_item_id);
CREATE INDEX IF NOT EXISTS idx_stock_mouvements_date ON stock_mouvements(created_at DESC);
