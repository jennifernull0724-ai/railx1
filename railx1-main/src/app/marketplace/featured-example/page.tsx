/**
 * THE RAIL EXCHANGE™ — Featured Example Page (Removed)
 * 
 * This page previously displayed demo/example content with placeholder images.
 * Per UX consolidation guide: demo pages with placeholder content must not be public.
 * Redirects to pricing page.
 */

export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';

export default function FeaturedExamplePage() {
  redirect('/pricing');
}
