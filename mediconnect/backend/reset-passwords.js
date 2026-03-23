// Exécuter dans: mediconnect\backend\
// Commande: node reset-passwords.js
const bcrypt = require("bcryptjs");
const { Client } = require("pg");
require("dotenv").config();

async function main() {
  const client = new Client({
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE || "mediconnect",
  });

  await client.connect();
  console.log("Connecte a PostgreSQL\n");

  // Recuperer tous les utilisateurs
  const { rows: users } = await client.query("SELECT id, email, role FROM users ORDER BY created_at");
  console.log(`${users.length} utilisateurs trouves:\n`);

  for (const user of users) {
    // Chaque utilisateur garde son propre mot de passe = Test1234! par defaut
    // Sauf les comptes crees par inscription (on remet aussi Test1234!)
    const newPassword = "Test1234!";
    const hash = await bcrypt.hash(newPassword, 12);

    await client.query(
      "UPDATE users SET password = $1, status = $2 WHERE id = $3",
      [hash, "ACTIVE", user.id]
    );
    console.log("✅ " + user.email + " (" + user.role + ") => mot de passe: Test1234!");
  }

  await client.end();
  console.log("\n✅ Tous les mots de passe reinitialises a: Test1234!");
  console.log("   Vous pouvez maintenant vous connecter avec nimporte quel compte.");
}

main().catch(err => {
  console.error("Erreur:", err.message);
  process.exit(1);
});
