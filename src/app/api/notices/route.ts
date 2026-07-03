import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const now = new Date();

    const notices = await db.notice.findMany({
      where: {
        OR: [
          { expiryDate: null },
          { expiryDate: { gte: now } },
        ],
      },
      include: {
        author: {
          select: { name: true, email: true },
        },
      },
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' },
      ],
    });
    return NextResponse.json(notices);
  } catch (error) {
    console.error('Error fetching notices:', error);
    return NextResponse.json({ error: 'Failed to fetch notices' }, { status: 500 });
  }
}

export async function POST(req: Request) {
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

    const { title, description, category, isPinned, expiryDate, priority, attachmentUrl } = await req.json();
    if (!title || !description || !category) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const parsedExpiryDate = expiryDate ? new Date(expiryDate) : null;

    const notice = await db.notice.create({
      data: {
        title,
        description,
        category,
        priority: priority || 'MEDIUM',
        attachmentUrl: attachmentUrl || null,
        isPinned: !!isPinned,
        expiryDate: parsedExpiryDate,
        authorId: (session.user as any).id,
      },
    });

    // Notify all users about the new notice
    const allUsers = await db.user.findMany({
      select: { id: true },
      where: { id: { not: (session.user as any).id } },
    });

    if (allUsers.length > 0) {
      await db.notification.create({
        data: {
          title: `New Notice: ${category} (${priority || 'MEDIUM'})`,
          message: `Announcement: "${title}" has been posted.`,
          link: '/dashboard/notices',
          senderId: (session.user as any).id,
          recipients: {
            createMany: {
              data: allUsers.map((u) => ({
                userId: u.id,
              })),
            },
          },
        },
      });
    }

    return NextResponse.json(notice);
  } catch (error) {
    console.error('Error creating notice:', error);
    return NextResponse.json({ error: 'Failed to create notice' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
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

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing notice ID' }, { status: 400 });
    }

    await db.notice.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Notice deleted successfully' });
  } catch (error) {
    console.error('Error deleting notice:', error);
    return NextResponse.json({ error: 'Failed to delete notice' }, { status: 500 });
  }
}
