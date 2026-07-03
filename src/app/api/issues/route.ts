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

    const { id, role } = session.user as any;

    let issues;
    if (role === 'ADMIN') {
      issues = await db.issue.findMany({
        include: {
          student: {
            select: { name: true, email: true },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } else {
      issues = await db.issue.findMany({
        where: { studentId: id },
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

    const { title, description, category } = await req.json();
    if (!title || !description || !category) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const issue = await db.issue.create({
      data: {
        title,
        description,
        category,
        studentId: (session.user as any).id,
      },
    });

    return NextResponse.json(issue);
  } catch (error) {
    console.error('Error creating issue:', error);
    return NextResponse.json({ error: 'Failed to create issue' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admins only.' }, { status: 403 });
    }

    const { id, status } = await req.json();
    if (!id || !status) {
      return NextResponse.json({ error: 'Missing id or status' }, { status: 400 });
    }

    const updatedIssue = await db.issue.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(updatedIssue);
  } catch (error) {
    console.error('Error updating issue:', error);
    return NextResponse.json({ error: 'Failed to update issue' }, { status: 500 });
  }
}
