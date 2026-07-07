'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function updateProfile(name: string, phone: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error('Unauthorized');
  
  const userId = (session.user as any).id;
  await db.user.update({
    where: { id: userId },
    data: { name },
  });
  return { success: true };
}

export async function updatePassword(currentPass: string, newPass: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error('Unauthorized');

  const userId = (session.user as any).id;
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  const isPasswordCorrect = await bcrypt.compare(currentPass, user.password);
  if (!isPasswordCorrect) {
    throw new Error('Incorrect current password.');
  }

  const hashedPassword = await bcrypt.hash(newPass, 10);
  await db.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });
  return { success: true };
}
