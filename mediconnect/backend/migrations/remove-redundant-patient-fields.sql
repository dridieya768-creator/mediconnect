-- Migration : suppression des champs redondants de la table patients
-- Ces données existent déjà dans users (first_name, last_name, phone, email)
-- À exécuter APRÈS avoir vérifié que le code ne les utilise plus

ALTER TABLE patients DROP COLUMN IF EXISTS nom;
ALTER TABLE patients DROP COLUMN IF EXISTS prenom;
ALTER TABLE patients DROP COLUMN IF EXISTS telephone;
ALTER TABLE patients DROP COLUMN IF EXISTS email;
