export const dynamic = 'force-dynamic';

/**
 * DEBUG ENDPOINT - Session check
 * Tests if authorize() succeeded and session was created
 * DELETE AFTER FIXING AUTH ISSUE
 */
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    console.log('[DEBUG SESSION] Raw session:', JSON.stringify(session));
    
    return NextResponse.json({
      hasSession: !!session,
      session: session ? {
        user: session.user ? {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
          isAdmin: session.user.isAdmin,
          role: session.user.role,
        } : null,
        expires: session.expires,
      } : null,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[DEBUG SESSION] Error:', error);
    return NextResponse.json({
      hasSession: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
