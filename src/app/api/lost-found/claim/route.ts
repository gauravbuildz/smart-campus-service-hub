import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// GET all claim requests (for admins or the reporter of the items)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: userId } = session.user as any;
    const dbUser = await db.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    const isAdmin = dbUser?.role === 'ADMIN';

    let claims;
    if (isAdmin) {
      // Admins see all claims
      claims = await db.claimRequest.findMany({
        include: {
          item: true,
          requester: {
            select: { name: true, email: true },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } else {
      // Students see claims they raised, or claims on items they reported
      claims = await db.claimRequest.findMany({
        where: {
          OR: [
            { requesterId: userId },
            { item: { reporterId: userId } },
          ],
        },
        include: {
          item: true,
          requester: {
            select: { name: true, email: true },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    return NextResponse.json(claims);
  } catch (error) {
    console.error('Error fetching claim requests:', error);
    return NextResponse.json({ error: 'Failed to fetch claims' }, { status: 500 });
  }
}

// POST a new claim request (Student claims a found/lost item)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: requesterId } = session.user as any;
    const { itemId, proof, imageUrl } = await req.json();

    if (!itemId || !proof) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify item exists
    const item = await db.lostAndFound.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    if (item.status === 'RESOLVED' || item.status === 'CLAIMED') {
      return NextResponse.json({ error: 'Item is already resolved/claimed' }, { status: 400 });
    }

    // Prevent duplicate claims from the same student
    const existing = await db.claimRequest.findFirst({
      where: { itemId, requesterId },
    });

    if (existing) {
      return NextResponse.json({ error: 'You have already submitted a claim for this item' }, { status: 400 });
    }

    // Create claim request
    const claim = await db.claimRequest.create({
      data: {
        itemId,
        requesterId,
        proof,
        imageUrl: imageUrl || null,
        status: 'PENDING',
      },
    });

    // Create notification for the reporter of the item
    if (item.reporterId !== requesterId) {
      await db.notification.create({
        data: {
          title: 'New Claim Request',
          message: `Someone has requested to claim the item: "${item.itemName}".`,
          link: '/dashboard/lost-found',
          senderId: requesterId,
          recipients: {
            create: {
              userId: item.reporterId,
            },
          },
        },
      });
    }

    // Also notify admins
    const admins = await db.user.findMany({
      where: { role: 'ADMIN', id: { not: requesterId } },
    });

    if (admins.length > 0) {
      await db.notification.create({
        data: {
          title: 'New Claim Submitted',
          message: `A claim request was submitted for: "${item.itemName}".`,
          link: '/dashboard',
          senderId: requesterId,
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

    return NextResponse.json(claim);
  } catch (error) {
    console.error('Error creating claim request:', error);
    return NextResponse.json({ error: 'Failed to submit claim request' }, { status: 500 });
  }
}

// PATCH to approve/reject a claim (Admins only)
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
      return NextResponse.json({ error: 'Unauthorized. Admin only.' }, { status: 403 });
    }

    const { claimId, status } = await req.json(); // status: APPROVED or REJECTED

    if (!claimId || !status || !['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status or missing claimId' }, { status: 400 });
    }

    const claim = await db.claimRequest.findUnique({
      where: { id: claimId },
      include: { item: true },
    });

    if (!claim) {
      return NextResponse.json({ error: 'Claim request not found' }, { status: 404 });
    }

    // Update claim status
    const updatedClaim = await db.claimRequest.update({
      where: { id: claimId },
      data: { status },
    });

    if (status === 'APPROVED') {
      // Mark item as resolved/claimed
      await db.lostAndFound.update({
        where: { id: claim.itemId },
        data: { status: 'CLAIMED' },
      });

      // Reject all other pending claims on this item
      await db.claimRequest.updateMany({
        where: {
          itemId: claim.itemId,
          id: { not: claimId },
          status: 'PENDING',
        },
        data: { status: 'REJECTED' },
      });
    }

    // Notify the requester
    await db.notification.create({
      data: {
        title: status === 'APPROVED' ? 'Claim Request Approved! 🎉' : 'Claim Request Rejected',
        message: status === 'APPROVED'
          ? `Your claim for "${claim.item.itemName}" was approved. Please collect it from the desk.`
          : `Your claim for "${claim.item.itemName}" was rejected. Please contact the desk for info.`,
        link: '/dashboard/lost-found',
        recipients: {
          create: {
            userId: claim.requesterId,
          },
        },
      },
    });

    return NextResponse.json(updatedClaim);
  } catch (error) {
    console.error('Error updating claim request:', error);
    return NextResponse.json({ error: 'Failed to update claim request' }, { status: 500 });
  }
}
