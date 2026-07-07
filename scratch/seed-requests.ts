import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Finding student and admin users for service request seeding...');
  
  // Find Student User
  let student = await prisma.user.findFirst({
    where: { role: 'STUDENT' }
  });
  if (!student) {
    student = await prisma.user.findFirst({
      where: { email: 'student@campus.edu' }
    });
  }

  // Find Admin User
  let admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  });
  if (!admin) {
    admin = await prisma.user.findFirst({
      where: { email: 'admin@campus.edu' }
    });
  }

  if (!student || !admin) {
    throw new Error('Required seed users (Student/Admin) not found in database. Please run seed.ts first.');
  }

  console.log(`Using Student: ${student.name} (${student.email})`);
  console.log(`Using Admin: ${admin.name} (${admin.email})`);

  // Clean existing Service Request issues first
  const SERVICE_NAMES = [
    'ID Card Request',
    'Bonafide Certificate',
    'Hostel Request',
    'Parking Pass',
    'Leave Application',
    'Library Card Request',
    'Degree/Transcript Request'
  ];

  const deleted = await prisma.issue.deleteMany({
    where: {
      category: {
        in: SERVICE_NAMES
      }
    }
  });
  console.log(`Cleaned up ${deleted.count} existing service requests.`);

  // 1. Duplicate ID Card Request (APPROVED)
  console.log('Seeding ID Card Request (APPROVED)...');
  const req1 = await prisma.issue.create({
    data: {
      title: 'Issuance of Duplicate ID Card',
      description: 'My physical campus ID card was lost in the main cafeteria yesterday. Requesting a duplicate card with the same details.',
      category: 'ID Card Request',
      status: 'APPROVED',
      severity: 'MEDIUM',
      attachmentUrl: 'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?auto=format&fit=crop&w=800&q=80',
      studentId: student.id,
    }
  });

  await prisma.statusHistory.create({
    data: {
      issueId: req1.id,
      status: 'PENDING',
      updatedBy: 'System',
      comment: 'Complaint raised and severity auto-classified by AI.',
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
    }
  });

  await prisma.statusHistory.create({
    data: {
      issueId: req1.id,
      status: 'UNDER_REVIEW',
      updatedBy: admin.name || 'Admin',
      comment: 'Verifying student roll number and library status clearance.',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    }
  });

  await prisma.statusHistory.create({
    data: {
      issueId: req1.id,
      status: 'APPROVED',
      updatedBy: admin.name || 'Admin',
      comment: 'Duplicate ID Card has been printed successfully. Please collect it from the Student Welfare desk (Room 12) between 10 AM and 4 PM.',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    }
  });


  // 2. Bonafide Certificate Request (PENDING)
  console.log('Seeding Bonafide Certificate Request (PENDING)...');
  const req2 = await prisma.issue.create({
    data: {
      title: 'Bonafide Certificate for SBI Education Loan',
      description: 'Requesting a Bonafide Certificate to submit to State Bank of India for my educational loan renewal application for the academic year 2026-27.',
      category: 'Bonafide Certificate',
      status: 'PENDING',
      severity: 'MEDIUM',
      studentId: student.id,
    }
  });

  await prisma.statusHistory.create({
    data: {
      issueId: req2.id,
      status: 'PENDING',
      updatedBy: 'System',
      comment: 'Complaint raised and severity auto-classified by AI.',
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000) // 12 hrs ago
    }
  });


  // 3. Parking Pass Request (UNDER REVIEW)
  console.log('Seeding Parking Pass Request (UNDER_REVIEW)...');
  const req3 = await prisma.issue.create({
    data: {
      title: 'Two-Wheeler Campus Parking Pass (Autumn Sem)',
      description: 'Apply for a two-wheeler campus parking sticker. Model: Yamaha FZS, Registration Number: MH-12-AB-9876. I commute daily to college from off-campus housing.',
      category: 'Parking Pass',
      status: 'UNDER_REVIEW',
      severity: 'LOW',
      attachmentUrl: 'https://images.unsplash.com/photo-1506521788723-7811124eb95f?auto=format&fit=crop&w=800&q=80',
      studentId: student.id,
    }
  });

  await prisma.statusHistory.create({
    data: {
      issueId: req3.id,
      status: 'PENDING',
      updatedBy: 'System',
      comment: 'Complaint raised and severity auto-classified by AI.',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    }
  });

  await prisma.statusHistory.create({
    data: {
      issueId: req3.id,
      status: 'UNDER_REVIEW',
      updatedBy: admin.name || 'Admin',
      comment: 'Verifying registration certificate (RC) and insurance details submitted.',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    }
  });


  // 4. Transcript Request (REJECTED)
  console.log('Seeding Degree/Transcript Request (REJECTED)...');
  const req4 = await prisma.issue.create({
    data: {
      title: 'Official Transcripts for University Applications',
      description: 'Requesting 3 copies of official semester transcripts for my first 4 semesters to apply for winter internships and exchange programs.',
      category: 'Degree/Transcript Request',
      status: 'REJECTED',
      severity: 'MEDIUM',
      studentId: student.id,
    }
  });

  await prisma.statusHistory.create({
    data: {
      issueId: req4.id,
      status: 'PENDING',
      updatedBy: 'System',
      comment: 'Complaint raised and severity auto-classified by AI.',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    }
  });

  await prisma.statusHistory.create({
    data: {
      issueId: req4.id,
      status: 'UNDER_REVIEW',
      updatedBy: admin.name || 'Admin',
      comment: 'Verifying fee clearance reports from finance department.',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    }
  });

  await prisma.statusHistory.create({
    data: {
      issueId: req4.id,
      status: 'REJECTED',
      updatedBy: admin.name || 'Admin',
      comment: 'Request rejected. Our records show an outstanding library fine of $45 from last semester. Please clear library dues and apply again.',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    }
  });

  console.log('Seeding complete! 4 service requests created successfully.');
}

main()
  .catch((e) => {
    console.error('Error during seeding requests:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
