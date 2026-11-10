/**
 * Development seed data — Nigerian universities for registration testing.
 * Run: npm run seed
 */
import { PrismaClient, AcademicLevel } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Academia NG...');

  const unilag = await prisma.university.upsert({
    where: { id: 'seed-unilag' },
    update: {},
    create: {
      id: 'seed-unilag',
      name: 'University of Lagos',
      shortName: 'UNILAG',
      state: 'Lagos',
      isActive: true,
    },
  });

  await prisma.university.upsert({
    where: { id: 'seed-ui' },
    update: {},
    create: {
      id: 'seed-ui',
      name: 'University of Ibadan',
      shortName: 'UI',
      state: 'Oyo',
      isActive: true,
    },
  });

  await prisma.university.upsert({
    where: { id: 'seed-oau' },
    update: {},
    create: {
      id: 'seed-oau',
      name: 'Obafemi Awolowo University',
      shortName: 'OAU',
      state: 'Osun',
      isActive: true,
    },
  });

  await prisma.university.upsert({
    where: { id: 'seed-abu' },
    update: {},
    create: {
      id: 'seed-abu',
      name: 'Ahmadu Bello University',
      shortName: 'ABU',
      state: 'Kaduna',
      isActive: true,
    },
  });

  await prisma.university.upsert({
    where: { id: 'seed-unn' },
    update: {},
    create: {
      id: 'seed-unn',
      name: 'University of Nigeria, Nsukka',
      shortName: 'UNN',
      state: 'Enugu',
      isActive: true,
    },
  });

  const sci = await prisma.faculty.upsert({
    where: { universityId_name: { universityId: unilag.id, name: 'Faculty of Science' } },
    update: {},
    create: { name: 'Faculty of Science', universityId: unilag.id },
  });

  const eng = await prisma.faculty.upsert({
    where: { universityId_name: { universityId: unilag.id, name: 'Faculty of Engineering' } },
    update: {},
    create: { name: 'Faculty of Engineering', universityId: unilag.id },
  });

  await prisma.department.upsert({
    where: { facultyId_name: { facultyId: sci.id, name: 'Computer Science' } },
    update: {},
    create: { name: 'Computer Science', facultyId: sci.id },
  });
  await prisma.department.upsert({
    where: { facultyId_name: { facultyId: sci.id, name: 'Mathematics' } },
    update: {},
    create: { name: 'Mathematics', facultyId: sci.id },
  });
  await prisma.department.upsert({
    where: { facultyId_name: { facultyId: eng.id, name: 'Electrical Engineering' } },
    update: {},
    create: { name: 'Electrical Engineering', facultyId: eng.id },
  });

  const passwordHash = await bcrypt.hash('Student123', 12);
  await prisma.user.upsert({
    where: { email: 'demo@academia.ng' },
    update: {},
    create: {
      email: 'demo@academia.ng',
      passwordHash,
      fullName: 'Demo Student',
      universityId: unilag.id,
      facultyId: sci.id,
      academicLevel: AcademicLevel.YEAR_2,
      currentSemester: 1,
      isEmailVerified: true,
    },
  });

  console.log('Seed complete. Demo: demo@academia.ng / Student123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
