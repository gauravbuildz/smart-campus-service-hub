import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const items = await db.lostAndFound.findMany({
      include: {
        reporter: {
          select: { name: true, email: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching lost & found items:', error);
    return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { itemName, description, type, location, category, imageUrl } = await req.json();
    if (!itemName || !description || !type || !location) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const item = await db.lostAndFound.create({
      data: {
        itemName,
        description,
        type,
        location,
        category: category || 'OTHER',
        imageUrl: imageUrl || null,
        reporterId: (session.user as any).id,
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error('Error creating lost & found item:', error);
    return NextResponse.json({ error: 'Failed to report item' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing item ID' }, { status: 400 });
    }

    const item = await db.lostAndFound.findUnique({
      where: { id },
    });

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // Allow deletion if admin OR if the reporter is the logged-in user
    const { id: userId } = session.user as any;
    const dbUser = await db.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    const isAdmin = dbUser?.role === 'ADMIN';
    if (!isAdmin && item.reporterId !== userId) {
      return NextResponse.json({ error: 'Forbidden. You did not report this item.' }, { status: 403 });
    }

    await db.lostAndFound.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting lost & found item:', error);
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}
