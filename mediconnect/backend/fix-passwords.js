// Run this in: mediconnect\backend\
// Command: node fix-passwords.js
const bcrypt = require('bcryptjs');
const { Client } = require('pg');
require('dotenv').config();

async function fixPasswords() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE || 'mediconnect',
  });

  console.log('Connexion à PostgreSQL...');
  await client.connect();
  console.log('✅ Connecté!\n');

  const hash = await bcrypt.hash('Test1234!', 12);
  console.log('Hash généré:', hash.substring(0, 20) + '...');

  const emails = [
    'patient@test.com',
    'medecin@test.com', 
    'pharmacien@test.com',
    'biologiste@test.com',
    'radiologue@test.com',
    'admin@test.com',
  ];

  for (const email of emails) {
    // Check if user exists
    const check = await client.query('SELECT id FROM users WHERE email = $1', [email]);
    if (check.rows.length > 0) {
      await client.query('UPDATE users SET password = $1, status = $2, is_email_verified = $3 WHERE email = $4', 
        [hash, 'ACTIVE', true, email]);
      console.log(`✅ Mot de passe mis à jour: ${email}`);
    } else {
      // Insert user
      await client.query(
        `INSERT INTO users (email, password, first_name, last_name, role, status, country_code, is_email_verified)
         VALUES ($1, $2, $3, $4, $5, 'ACTIVE', 'TN', true)
         ON CONFLICT (email) DO UPDATE SET password = $2, status = 'ACTIVE'`,
        [email, hash, email.split('@')[0], 'Test', getRoleForEmail(email)]
      );
      console.log(`✅ Utilisateur créé: ${email}`);
    }
  }

  // Create patient profile if missing
  const patientResult = await client.query("SELECT id FROM users WHERE email = 'patient@test.com'");
  if (patientResult.rows.length > 0) {
    const userId = patientResult.rows[0].id;
    await client.query(
      `INSERT INTO patients (user_id, qr_code, nss, date_of_birth, gender, blood_group, allergies, chronic_conditions)
       VALUES ($1, 'QR-PAT-AHME0001', '10190123456789', '1990-03-15', 'M', 'O+', '["Pénicilline"]', '["Hypertension"]')
       ON CONFLICT (qr_code) DO NOTHING`,
      [userId]
    );
    console.log('✅ Profil patient créé');
  }

  await client.end();
  
  console.log('\n🎉 Terminé! Vous pouvez maintenant vous connecter avec:');
  console.log('   Email: patient@test.com');
  console.log('   Mot de passe: Test1234!');
}

function getRoleForEmail(email) {
  const roles = {
    'patient@test.com': 'PATIENT',
    'medecin@test.com': 'MEDECIN_GENERALISTE',
    'pharmacien@test.com': 'PHARMACIEN_TITULAIRE',
    'biologiste@test.com': 'BIOLOGISTE',
    'radiologue@test.com': 'RADIOLOGUE',
    'admin@test.com': 'ADMIN_SYSTEM',
  };
  return roles[email] || 'PATIENT';
}

fixPasswords().catch(err => {
  console.error('❌ Erreur:', err.message);
  process.exit(1);
});