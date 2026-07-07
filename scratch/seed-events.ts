import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Finding admin user for event seeding...');
  
  // Find the admin user to associate events with
  let admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  });

  if (!admin) {
    admin = await prisma.user.findFirst();
  }

  if (!admin) {
    throw new Error('No user found in the database. Please run seed.ts first.');
  }

  // Seed upcoming Events in Notice table
  const sampleEvents = [
    {
      title: 'Hackathon: Code for Campus 2026',
      category: 'EVENT',
      priority: 'HIGH',
      isPinned: true,
      description: JSON.stringify({
        description: '24-hour campus hackathon to design and build sustainable solutions for Smart Campus and student welfare. Teams of 2-4.',
        date: 'July 18, 2026',
        time: '09:00 AM',
        venue: 'CSE Department Seminar Block'
      }),
      expiryDate: new Date('2026-07-20T00:00:00Z')
    },
    {
      title: 'National Youth Leadership Summit',
      category: 'EVENT',
      priority: 'MEDIUM',
      isPinned: false,
      description: JSON.stringify({
        description: 'A prestigious youth leadership seminar hosting startup founders, social activists, and student welfare administrators.',
        date: 'July 25, 2026',
        time: '11:00 AM',
        venue: 'Main Convocation Auditorium'
      }),
      expiryDate: new Date('2026-07-27T00:00:00Z')
    },
    {
      title: 'SOP Placement Orientation Seminar',
      category: 'EVENT',
      priority: 'HIGH',
      isPinned: false,
      description: JSON.stringify({
        description: 'Mandatory orientation briefing session for all final year students preparing for campus placement registration and CV evaluations.',
        date: 'August 03, 2026',
        time: '02:30 PM',
        venue: 'LH-204 Lecture Hall'
      }),
      expiryDate: new Date('2026-08-04T00:00:00Z')
    }
  ];

  console.log('Seeding upcoming campus events...');
  for (const ev of sampleEvents) {
    await prisma.notice.create({
      data: {
        title: ev.title,
        description: ev.description,
        category: ev.category,
        priority: ev.priority,
        isPinned: ev.isPinned,
        authorId: admin.id,
        expiryDate: ev.expiryDate
      }
    });
  }

  console.log(`Seeded ${sampleEvents.length} upcoming events successfully!`);
}

main()
  .catch((e) => {
    console.error('Error seeding events:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
