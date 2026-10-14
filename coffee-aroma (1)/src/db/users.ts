import { db } from './index.js';
import { users } from './schema.js';
import { eq } from 'drizzle-orm';
import { User } from '../types.js';

export async function getOrCreateFirebaseUser(uid: string, email: string, name?: string): Promise<User> {
  try {
    const existing = await db.select().from(users).where(eq(users.uid, uid));
    if (existing && existing.length > 0) {
      const u = existing[0];
      return {
        id: u.id,
        username: u.username,
        name: u.name,
        role: (u.role as 'ADMIN' | 'EMPLOYEE') || 'EMPLOYEE',
        phone: u.phone || undefined,
        status: (u.status as 'ACTIVE' | 'INACTIVE') || 'ACTIVE',
        createdAt: u.createdAt.toISOString(),
      };
    }

    const newId = `usr-fb-${Date.now()}`;
    const username = email.split('@')[0] || `user_${Date.now()}`;
    const displayName = name || username;

    const inserted = await db
      .insert(users)
      .values({
        id: newId,
        uid,
        username,
        name: displayName,
        role: 'EMPLOYEE',
        status: 'ACTIVE',
        passwordHash: 'FIREBASE_AUTH_OAUTH',
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          name: displayName,
        },
      })
      .returning();

    const u = inserted[0];
    return {
      id: u.id,
      username: u.username,
      name: u.name,
      role: (u.role as 'ADMIN' | 'EMPLOYEE') || 'EMPLOYEE',
      phone: u.phone || undefined,
      status: (u.status as 'ACTIVE' | 'INACTIVE') || 'ACTIVE',
      createdAt: u.createdAt.toISOString(),
    };
  } catch (error) {
    console.error('Failed to getOrCreateFirebaseUser in Cloud SQL:', error);
    throw new Error('Database user lookup failed', { cause: error });
  }
}
