const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@neudrasil.com' },
    update: {},
    create: {
      email: 'admin@neudrasil.com',
      passwordHash: adminPassword,
      name: 'Administrador Sistema',
      role: 'ADMIN',
      specialty: 'Administración'
    }
  });

  // Create demo doctor
  const doctorPassword = await bcrypt.hash('doctor123', 10);
  const doctor = await prisma.user.upsert({
    where: { email: 'doctor@neudrasil.com' },
    update: {},
    create: {
      email: 'doctor@neudrasil.com',
      passwordHash: doctorPassword,
      name: 'Dr. Juan Pérez',
      role: 'DOCTOR',
      specialty: 'Neurología'
    }
  });

  console.log('Seed data created successfully');
  console.log({ admin, doctor });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
