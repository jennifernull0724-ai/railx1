/**
 * THE RAIL EXCHANGE™ — Service Provider Tools Promo Card
 * 
 * A clearly-labeled platform tool card for service provider verification.
 * Visually distinct from contractor profile cards.
 */

'use client';

import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface FeaturedContractorPromoCardProps {
  className?: string;
}

export const FeaturedContractorPromoCard: React.FC<FeaturedContractorPromoCardProps> = ({
  className,
}) => {
  return (
    <div className={cn(
      "bg-slate-50 border border-slate-200 rounded-xl p-5",
      className
    )}>
      {/* For Service Providers Label */}
      <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
        For Service Providers
      </div>
      
      {/* Icon */}
      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mb-3">
        <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      </div>
      
      {/* Title */}
      <h4 className="text-[14px] font-semibold text-navy-900 mb-1">
        Get Listed
      </h4>
      
      {/* Description */}
      <p className="text-[12px] text-slate-500 mb-3 leading-relaxed">
        Contractors and rail service companies can create a verified profile.
      </p>
      
      {/* CTA */}
      <Link 
        href="/contractors/onboard"
        className="text-[12px] font-medium text-emerald-600 hover:text-emerald-700 hover:underline"
      >
        Create profile →
      </Link>
    </div>
  );
};
