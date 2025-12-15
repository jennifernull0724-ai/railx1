/**
 * THE RAIL EXCHANGE™ — NextAuth API Route Handler
 * @version 2.0.0 - bcrypt fix deployed 2025-12-15
 */

import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
