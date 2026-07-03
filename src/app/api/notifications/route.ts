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

    const { id: userId } = session.user as any;

    const recipients = await db.notificationRecipient.findMany({
      where: { userId },
      include: {
        notification: {
          include: {
            sender: {
              select: { name: true, role: true },
            },
          },
        },
      },
      orderBy: {
        notification: {
          createdAt: 'desc',
        },
      },
      take: 20,
    });

    // Map to a cleaner format
    const list = recipients.map((r) => ({
      id: r.id,
      notificationId: r.notificationId,
      title: r.notification.title,
      message: r.notification.message,
      link: r.notification.link,
      isRead: r.isRead,
      createdAt: r.notification.createdAt,
      senderName: r.notification.sender?.name || 'System',
    }));

    return NextResponse.json(list);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: userId } = session.user as any;
    const { id, all } = await req.json();

    if (all) {
      // Mark all notifications as read for this user
      await db.notificationRecipient.updateMany({
        where: { userId, isRead: false },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });
      return NextResponse.json({ message: 'All notifications marked as read' });
    }

    if (!id) {
      return NextResponse.json({ error: 'Missing notification recipient ID' }, { status: 400 });
    }

    // Mark single notification as read
    const recipient = await db.notificationRecipient.findUnique({
      where: { id },
    });

    if (!recipient || recipient.userId !== userId) {
      return NextResponse.json({ error: 'Notification not found or access denied' }, { status: 404 });
    }

    await db.notificationRecipient.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return NextResponse.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
  }
}
