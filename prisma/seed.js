const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed de la base de datos...');

  // Crear doctor de prueba
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const doctor = await prisma.user.upsert({
    where: { email: 'doctor@neudrasil.com' },
    update: {},
    create: {
      email: 'doctor@neudrasil.com',
      passwordHash: hashedPassword,
      name: 'Dr. Juan Pérez',
      specialty: 'Neuroterapia',
      role: 'DOCTOR',
    },
  });

  console.log('✓ Doctor creado:', doctor.email);

  // Crear paciente de prueba
  const patient = await prisma.patient.create({
    data: {
      name: 'María González',
      birthdate: new Date('1990-05-15'),
      diagnosis: 'Rehabilitación neuromotora',
      medicalHistory: 'Paciente con lesión cerebral leve, en proceso de rehabilitación.',
      assignedDoctorId: doctor.id,
      contactInfo: {
        phone: '+34 612 345 678',
        email: 'maria. gonzalez@example.com',
        address: 'Calle Principal 123, Madrid'
      }
    },
  });

  console.log('✓ Paciente creado:', patient.name);

  console.log('\n=================================');
  console.log('Seed completado exitosamente');
  console.log('=================================');
  console.log('Credenciales de prueba:');
  console.log('Email:  doctor@neudrasil.com');
  console.log('Password: admin123');
  console.log('=================================\n');
}

main()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });