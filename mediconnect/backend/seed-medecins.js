const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'mediconnectt',
  user: 'postgres',
  password: 'aya',
});

const medecins = [
  // Médecins généralistes
  { firstName: 'Mohamed', lastName: 'Ben Ali', role: 'MEDECIN_GENERALISTE', ville: 'Tunis', phone: '+21671234501' },
  { firstName: 'Fatma', lastName: 'Trabelsi', role: 'MEDECIN_GENERALISTE', ville: 'Sfax', phone: '+21674234502' },
  { firstName: 'Ahmed', lastName: 'Chaabane', role: 'MEDECIN_GENERALISTE', ville: 'Sousse', phone: '+21673234503' },
  { firstName: 'Leila', lastName: 'Mansouri', role: 'MEDECIN_GENERALISTE', ville: 'Tunis', phone: '+21671234504' },
  { firstName: 'Karim', lastName: 'Jebali', role: 'MEDECIN_GENERALISTE', ville: 'Bizerte', phone: '+21672234505' },
  { firstName: 'Sonia', lastName: 'Gharbi', role: 'MEDECIN_GENERALISTE', ville: 'Nabeul', phone: '+21672234506' },
  { firstName: 'Riadh', lastName: 'Hamdi', role: 'MEDECIN_GENERALISTE', ville: 'Ariana', phone: '+21671234507' },
  { firstName: 'Nadia', lastName: 'Belhaj', role: 'MEDECIN_GENERALISTE', ville: 'Tunis', phone: '+21671234508' },
  { firstName: 'Slim', lastName: 'Elloumi', role: 'MEDECIN_GENERALISTE', ville: 'Sfax', phone: '+21674234509' },
  { firstName: 'Amira', lastName: 'Khelifi', role: 'MEDECIN_GENERALISTE', ville: 'Monastir', phone: '+21673234510' },

  // Médecins spécialistes
  { firstName: 'Khaled', lastName: 'Bouaziz', role: 'MEDECIN_SPECIALISTE', ville: 'Tunis', phone: '+21671234511', specialite: 'Cardiologue' },
  { firstName: 'Ines', lastName: 'Dridi', role: 'MEDECIN_SPECIALISTE', ville: 'Sfax', phone: '+21674234512', specialite: 'Dermatologue' },
  { firstName: 'Tarek', lastName: 'Sassi', role: 'MEDECIN_SPECIALISTE', ville: 'Tunis', phone: '+21671234513', specialite: 'Neurologue' },
  { firstName: 'Monia', lastName: 'Turki', role: 'MEDECIN_SPECIALISTE', ville: 'Sousse', phone: '+21673234514', specialite: 'Gynécologue' },
  { firstName: 'Bassem', lastName: 'Riahi', role: 'MEDECIN_SPECIALISTE', ville: 'Tunis', phone: '+21671234515', specialite: 'Ophtalmologue' },
  { firstName: 'Olfa', lastName: 'Hadj', role: 'MEDECIN_SPECIALISTE', ville: 'Ariana', phone: '+21671234516', specialite: 'Pédiatre' },
  { firstName: 'Maher', lastName: 'Zaouali', role: 'MEDECIN_SPECIALISTE', ville: 'Tunis', phone: '+21671234517', specialite: 'Radiologue' },
  { firstName: 'Samia', lastName: 'Karray', role: 'MEDECIN_SPECIALISTE', ville: 'Sfax', phone: '+21674234518', specialite: 'Cardiologue' },
  { firstName: 'Lotfi', lastName: 'Nefzi', role: 'MEDECIN_SPECIALISTE', ville: 'Monastir', phone: '+21673234519', specialite: 'ORL' },
  { firstName: 'Dorra', lastName: 'Mejri', role: 'MEDECIN_SPECIALISTE', ville: 'Tunis', phone: '+21671234520', specialite: 'Psychiatre' },
  { firstName: 'Hatem', lastName: 'Chaker', role: 'MEDECIN_SPECIALISTE', ville: 'Sousse', phone: '+21673234521', specialite: 'Rhumatologue' },
  { firstName: 'Rim', lastName: 'Dhouib', role: 'MEDECIN_SPECIALISTE', ville: 'Tunis', phone: '+21671234522', specialite: 'Gynécologue' },
  { firstName: 'Walid', lastName: 'Ferchichi', role: 'MEDECIN_SPECIALISTE', ville: 'Bizerte', phone: '+21672234523', specialite: 'Urologue' },
  { firstName: 'Hana', lastName: 'Boukthir', role: 'MEDECIN_SPECIALISTE', ville: 'Ariana', phone: '+21671234524', specialite: 'Dermatologue' },
  { firstName: 'Jamel', lastName: 'Chtioui', role: 'MEDECIN_SPECIALISTE', ville: 'Tunis', phone: '+21671234525', specialite: 'Neurologue' },

  // Urgentistes
  { firstName: 'Aymen', lastName: 'Tlili', role: 'MEDECIN_URGENTISTE', ville: 'Tunis', phone: '+21671234526' },
  { firstName: 'Salma', lastName: 'Missaoui', role: 'MEDECIN_URGENTISTE', ville: 'Sfax', phone: '+21674234527' },
  { firstName: 'Zied', lastName: 'Oueslati', role: 'MEDECIN_URGENTISTE', ville: 'Sousse', phone: '+21673234528' },

  // Chefs de service
  { firstName: 'Mondher', lastName: 'Jemai', role: 'MEDECIN_CHEF_SERVICE', ville: 'Tunis', phone: '+21671234529' },
  { firstName: 'Hela', lastName: 'Fakhfakh', role: 'MEDECIN_CHEF_SERVICE', ville: 'Sfax', phone: '+21674234530' },
];

async function seed() {
  await client.connect();
  console.log('✅ Connecté à PostgreSQL');

  const hashedPassword = await bcrypt.hash('Test1234!', 12);
  let created = 0;

  for (const med of medecins) {
    const email = `${med.firstName.toLowerCase()}.${med.lastName.toLowerCase().replace(' ', '')}@mediconnect.tn`;
    
    // Vérifier si existe déjà
    const existing = await client.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      console.log(`⏭ Déjà existant: ${email}`);
      continue;
    }

    const id = uuidv4();
    await client.query(`
      INSERT INTO users (id, email, password, first_name, last_name, phone, role, status, country_code, is_email_verified, mfa_enabled, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'ACTIVE', 'TN', true, false, NOW(), NOW())
    `, [id, email, hashedPassword, med.firstName, med.lastName, med.phone, med.role]);

    console.log(`✅ Créé: Dr. ${med.firstName} ${med.lastName} (${med.role}) — ${email}`);
    created++;
  }

  console.log(`\n🎉 ${created} médecins créés avec succès !`);
  console.log('Mot de passe pour tous: Test1234!');
  await client.end();
}

seed().catch(err => {
  console.error('❌ Erreur:', err.message);
  process.exit(1);
});