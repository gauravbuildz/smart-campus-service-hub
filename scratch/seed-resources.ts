import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Finding admin user for resource seeding...');
  
  // Find the admin user to associate resources with
  let admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  });

  if (!admin) {
    console.log('Admin user not found, checking for any available user...');
    admin = await prisma.user.findFirst();
  }

  if (!admin) {
    throw new Error('No user found in the database. Please run the main db seed first.');
  }

  console.log(`Using user: ${admin.name} (${admin.email}) as author.`);

  // Clean existing resource notices first
  const resourceCategories = ['Academic Forms', 'Study Resources', 'Important Documents', 'Downloads'];
  const deleted = await prisma.notice.deleteMany({
    where: {
      category: {
        in: resourceCategories
      }
    }
  });
  console.log(`Cleaned up ${deleted.count} existing resources.`);

  const sampleResources = [
    // 📄 Academic Forms
    {
      title: 'Bonafide Certificate Application Form',
      category: 'Academic Forms',
      attachmentUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      description: JSON.stringify({
        text: 'Official campus form required to request a Bonafide Certificate for visa processing, passport verification, or student loan applications.',
        fileSize: '1.4 MB',
        fileType: 'PDF',
        subcategory: 'Bonafide Form'
      })
    },
    {
      title: 'Merit-cum-Means Scholarship Form 2026',
      category: 'Academic Forms',
      attachmentUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      description: JSON.stringify({
        text: 'Application form for the Campus Merit-cum-Means Financial Aid. Please attach parent income certificate and academic transcripts before submitting.',
        fileSize: '1.8 MB',
        fileType: 'PDF',
        subcategory: 'Scholarship Form'
      })
    },
    {
      title: 'Hostel Room Allocation & Re-registration Form',
      category: 'Academic Forms',
      attachmentUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      description: JSON.stringify({
        text: 'Form to reserve or renew room allocation in Hostel Blocks A, B, or C for the upcoming semester. Submit before July 30th.',
        fileSize: '850 KB',
        fileType: 'PDF',
        subcategory: 'Hostel Form'
      })
    },
    {
      title: 'Medical & Outstation Leave Application',
      category: 'Academic Forms',
      attachmentUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      description: JSON.stringify({
        text: 'Official leave slip for students requesting sick leave or outstation leave permissions from the warden and department head.',
        fileSize: '620 KB',
        fileType: 'PDF',
        subcategory: 'Leave Form'
      })
    },

    // 📚 Study Resources
    {
      title: 'Computer Science & Engineering Syllabus (B.Tech)',
      category: 'Study Resources',
      attachmentUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      description: JSON.stringify({
        text: 'Complete credit structure, course description, textbook references, and laboratory details for the 4-year undergraduate CSE program.',
        fileSize: '3.5 MB',
        fileType: 'PDF',
        subcategory: 'Syllabus'
      })
    },
    {
      title: 'Official Academic Calendar 2026-27',
      category: 'Study Resources',
      attachmentUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      description: JSON.stringify({
        text: 'Calendar highlighting key academic schedule dates: semester start/end, mid-term examinations, cultural fests, national holidays, and grade submissions.',
        fileSize: '1.2 MB',
        fileType: 'PDF',
        subcategory: 'Academic Calendar'
      })
    },
    {
      title: 'Autumn 2026 Lecture Timetable (All Departments)',
      category: 'Study Resources',
      attachmentUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      description: JSON.stringify({
        text: 'Weekly master schedule with lecture timings, section allotments, tutor details, and lecture hall (LH-101 to LH-304) assignments.',
        fileSize: '420 KB',
        fileType: 'PDF',
        subcategory: 'Timetable'
      })
    },
    {
      title: 'End-Semester Theory Exam Schedule',
      category: 'Study Resources',
      attachmentUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      description: JSON.stringify({
        text: 'Examination date sheet, seating arrangement charts, and block allocation for the Autumn semester final examinations.',
        fileSize: '950 KB',
        fileType: 'PDF',
        subcategory: 'Examination Schedule'
      })
    },

    // 📑 Important Documents
    {
      title: 'Student Code of Conduct & Rules Regulations',
      category: 'Important Documents',
      attachmentUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      description: JSON.stringify({
        text: 'Official campus charter on code of conduct, dress codes, library regulations, anti-ragging bylaws, and penalties for indiscipline.',
        fileSize: '2.1 MB',
        fileType: 'PDF',
        subcategory: 'College Rules'
      })
    },
    {
      title: 'Campus Life & Hostel Handbook',
      category: 'Important Documents',
      attachmentUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      description: JSON.stringify({
        text: 'Comprehensive handbook detailing hostel mess timings, curfew restrictions, library borrowing rules, security contacts, and sports facilities.',
        fileSize: '4.8 MB',
        fileType: 'PDF',
        subcategory: 'Student Handbook'
      })
    },
    {
      title: 'Green Campus & Plastic Ban Circular',
      category: 'Important Documents',
      attachmentUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80',
      description: JSON.stringify({
        text: 'Circular highlighting mandatory guidelines to make the university campus single-use plastic free, waste disposal routines, and tree plantation fests.',
        fileSize: '1.2 MB',
        fileType: 'IMAGE',
        subcategory: 'Circulars'
      })
    },
    {
      title: 'Internship Guidelines & Placement SOP',
      category: 'Important Documents',
      attachmentUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      description: JSON.stringify({
        text: 'Standard Operating Procedure (SOP) for industrial training, NOC requests, internships, and placement board registry requirements.',
        fileSize: '1.1 MB',
        fileType: 'PDF',
        subcategory: 'Guidelines'
      })
    },

    // 📥 Downloads
    {
      title: 'Campus High-Resolution Map',
      category: 'Downloads',
      attachmentUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      description: JSON.stringify({
        text: 'High-res blueprint illustrating layout maps of all academic wings, hostels, cafeteria, laboratory clusters, library, and sports center.',
        fileSize: '2.7 MB',
        fileType: 'PDF',
        subcategory: 'PDF Documents'
      })
    },
    {
      title: 'Major Project Report MS Word Template',
      category: 'Downloads',
      attachmentUrl: 'https://calibre-ebook.com/downloads/demos/demo.docx',
      description: JSON.stringify({
        text: 'Pre-formatted Microsoft Word document structured with standard chapter layouts, references index style, and typography specifications for project reporting.',
        fileSize: '180 KB',
        fileType: 'DOC',
        subcategory: 'DOC Files'
      })
    },
    {
      title: 'Secure Campus WiFi Certificates',
      category: 'Downloads',
      attachmentUrl: 'https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-zip-file.zip',
      description: JSON.stringify({
        text: 'Compressed ZIP directory containing local security certificates and instructions for configuring 802.1X secure campus WiFi connection.',
        fileSize: '5.2 MB',
        fileType: 'ZIP',
        subcategory: 'ZIP Files'
      })
    }
  ];

  console.log('Seeding sample resources...');
  for (const res of sampleResources) {
    await prisma.notice.create({
      data: {
        title: res.title,
        description: res.description,
        category: res.category,
        attachmentUrl: res.attachmentUrl,
        authorId: admin.id,
        priority: 'LOW',
        isPinned: false
      }
    });
  }

  console.log(`Seeded ${sampleResources.length} sample resources successfully!`);
}

main()
  .catch((e) => {
    console.error('Error during resource seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
