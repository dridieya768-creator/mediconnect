import { createConnection } from "typeorm";
import * as bcrypt from "bcryptjs";

async function seed() {
  const connection = await createConnection();

  console.log("🌱 Début du seed...");

  const userRepo = connection.getRepository("User");
  const patientRepo = connection.getRepository("Patient");

  const users = [
    { email: "patient@test.com", firstName: "Ahmed", lastName: "Mansouri", role: "PATIENT" },
    { email: "medecin@test.com",     firstName: "Kamel",  lastName: "Jebali",    role: "MEDECIN" },
    { email: "pharmacien@test.com",  firstName: "Leila",  lastName: "Baccouche", role: "PHARMACIEN" },
    { email: "biologiste@test.com",  firstName: "Raouf",  lastName: "Boubaker",  role: "MEDECIN" },
    { email: "radiologue@test.com",  firstName: "Samy",   lastName: "Rezgui",    role: "MEDECIN" },
    { email: "admin@test.com",       firstName: "Admin",  lastName: "System",    role: "ADMIN" },
  ];

  const hashedPassword = await bcrypt.hash("Test1234!", 12);

  for (const u of users) {
    const existing = await userRepo.findOne({ where: { email: u.email } });
    if (!existing) {
      await userRepo.save(userRepo.create({ ...u, password: hashedPassword, status: "ACTIVE" }));
      console.log(` Créé: ${u.email} (${u.role})`);
    } else {
      console.log(`⏭ Existe déjà: ${u.email}`);
    }
  }

  await connection.close();
  console.log("\n Seed terminé avec succès!");
}

seed().catch(console.error);
