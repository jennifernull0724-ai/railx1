/**
 * THE RAIL EXCHANGE™ — Seller Tools Promo Card
 * 
 * A clearly-labeled platform tool card for seller placement options.
 * Visually distinct from inventory listings.
 */

'use client';

import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface FeaturedListingPromoCardProps {
  className?: string;
}

export const FeaturedListingPromoCard: React.FC<FeaturedListingPromoCardProps> = ({
  className,
}) => {
  return (
    <div className={cn(
      "bg-slate-50 border border-slate-200 rounded-xl p-5",
      className
    )}>
      {/* Seller Tools Label */}
      <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
        Seller Tools
      </div>
      
      {/* Icon */}
      <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mb-3">
        <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      </div>
      
      {/* Title */}
      <h4 className="text-[14px] font-semibold text-navy-900 mb-1">
        Elite Placement
      </h4>
      
      {/* Description */}
      <p className="text-[12px] text-slate-500 mb-3 leading-relaxed">
        Boost your listing visibility with priority positioning.
      </p>
      
      {/* CTA */}
      <Link 
        href="/dashboard/upgrade"
        className="text-[12px] font-medium text-amber-600 hover:text-amber-700 hover:underline"
      >
        Learn more →
      </Link>
    </div>
  );
};

export default FeaturedListingPromoCard;
