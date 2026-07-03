import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = session.user as any;
    const dbUser = await db.user.findUnique({
      where: { id },
      select: { role: true },
    });
    const isAdmin = dbUser?.role === 'ADMIN';

    let issues;
    if (isAdmin) {
      issues = await db.issue.findMany({
        include: {
          student: {
            select: { name: true, email: true },
          },
          history: {
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } else {
      issues = await db.issue.findMany({
        where: { studentId: id },
        include: {
          history: {
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    return NextResponse.json(issues);
  } catch (error) {
    console.error('Error fetching issues:', error);
    return NextResponse.json({ error: 'Failed to fetch issues' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, description, category, attachmentUrl } = await req.json();
    if (!title || !description || !category) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // AI Feature: Auto-categorize severity based on keywords
    let severity = 'MEDIUM';
    const text = (title + ' ' + description).toLowerCase();
    if (
      text.includes('fire') ||
      text.includes('shock') ||
      text.includes('leak') ||
      text.includes('broken glass') ||
      text.includes('danger') ||
      text.includes('injury') ||
      text.includes('medical')
    ) {
      severity = 'HIGH';
    } else if (
      text.includes('slow') ||
      text.includes('dusty') ||
      text.includes('dirty') ||
      text.includes('bulb') ||
      text.includes('fan speed')
    ) {
      severity = 'LOW';
    }

    const issue = await db.issue.create({
      data: {
        title,
        description,
        category,
        severity,
        attachmentUrl: attachmentUrl || null,
        studentId: (session.user as any).id,
        history: {
          create: {
            status: 'PENDING',
            updatedBy: 'System',
            comment: 'Complaint raised and severity auto-classified by AI.',
          },
        },
      },
    });

    // Notify admins about the new complaint
    const admins = await db.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true },
    });

    if (admins.length > 0) {
      await db.notification.create({
        data: {
          title: `New Issue Raised (${severity})`,
          message: `Student raised complaint: "${title}" under ${category}.`,
          link: '/dashboard',
          senderId: (session.user as any).id,
          recipients: {
            createMany: {
              data: admins.map((admin) => ({
                userId: admin.id,
              })),
            },
          },
        },
      });
    }

    return NextResponse.json(issue);
  } catch (error) {
    console.error('Error creating issue:', error);
    return NextResponse.json({ error: 'Failed to create issue' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user as any;
    const dbUser = await db.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    });
    const isAdmin = dbUser?.role === 'ADMIN';
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized. Admins only.' }, { status: 403 });
    }

    const { id, status, severity, comment } = await req.json();
    if (!id || !status) {
      return NextResponse.json({ error: 'Missing id or status' }, { status: 400 });
    }

    // Get original issue to see student ID
    const originalIssue = await db.issue.findUnique({
      where: { id },
    });

    if (!originalIssue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }

    const updatedIssue = await db.issue.update({
      where: { id },
      data: {
        status,
        ...(severity ? { severity } : {}),
      },
    });

    // Create history record
    await db.statusHistory.create({
      data: {
        issueId: id,
        status,
        updatedBy: (session.user as any).name || 'Admin',
        comment: comment || `Status updated to ${status}.`,
      },
    });

    // Notify the student who raised the issue
    await db.notification.create({
      data: {
        title: 'Complaint Status Update',
        message: `Your issue "${originalIssue.title}" status is now "${status}".`,
        link: '/dashboard',
        recipients: {
          create: {
            userId: originalIssue.studentId,
          },
        },
      },
    });

    return NextResponse.json(updatedIssue);
  } catch (error) {
    console.error('Error updating issue:', error);
    return NextResponse.json({ error: 'Failed to update issue' }, { status: 500 });
  }
}
