import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const owner = await prisma.user.upsert({
    where: { email: 'dexter@pyramid.dev' },
    update: {},
    create: {
      name: 'Dexter',
      email: 'dexter@pyramid.dev',
      googleId: 'seed-google-id-dexter',
    },
  });

  const project = await prisma.project.create({
    data: {
      name: 'Pyramid',
      ownerId: owner.id,
      boards: {
        create: {
          name: 'Tasks',
          columns: {
            create: [
              { name: 'To Do', order: 0, colorKey: 'neutral' },
              { name: 'Doing', order: 1, colorKey: 'blue' },
              { name: 'Completed', order: 2, colorKey: 'emerald' },
              { name: 'On Hold', order: 3, colorKey: 'orange' },
            ],
          },
        },
      },
    },
    include: { boards: { include: { columns: true } } },
  });

  const [todo, doing, completed, onHold] = project.boards[0].columns;

  await prisma.task.createMany({
    data: [
      {
        title: 'Design Homepage',
        priority: 'HIGH',
        status: 'NOT_STARTED',
        dueDate: new Date('2026-09-12'),
        columnId: todo.id,
        reporterId: owner.id,
        position: 0,
      },
      {
        title: 'Develop Login Feature',
        priority: 'LOW',
        status: 'NOT_STARTED',
        dueDate: new Date('2026-09-15'),
        columnId: todo.id,
        reporterId: owner.id,
        position: 1,
      },
      {
        title: 'Test Payment Gateway',
        priority: 'MEDIUM',
        status: 'NOT_STARTED',
        dueDate: new Date('2026-09-18'),
        columnId: todo.id,
        reporterId: owner.id,
        position: 2,
      },
      {
        title: 'Code Review Completed',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        dueDate: new Date('2026-07-29'),
        columnId: doing.id,
        reporterId: owner.id,
        position: 0,
      },
      {
        title: 'Feature Testing Passed',
        priority: 'MEDIUM',
        status: 'DONE',
        dueDate: new Date('2026-07-30'),
        columnId: completed.id,
        reporterId: owner.id,
        position: 0,
      },
      {
        title: 'UI Review Pending',
        priority: 'MEDIUM',
        status: 'BLOCKED',
        dueDate: new Date('2026-09-20'),
        columnId: onHold.id,
        reporterId: owner.id,
        position: 0,
      },
    ],
  });

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
