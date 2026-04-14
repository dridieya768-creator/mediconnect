-- Migration: ajouter colonne signature_image dans prescriptions
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS signature_image TEXT;
