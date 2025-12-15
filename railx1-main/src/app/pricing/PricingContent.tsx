/**
 * THE RAIL EXCHANGE™ — Pricing Content
 * =====================================
 * CANONICAL PRICING STRUCTURE (LOCKED - DO NOT MODIFY):
 * 
 * 1. BUYERS — $1 one-time identity verification (anti-spam)
 * 2. SELLERS — $29/year seller verification (required to publish)
 * 3. PROFESSIONAL SERVICES — $2,500/year OR $1,500/6 months
 *    - For BOTH contractors AND companies
 *    - Unlocks full services + analytics + visibility
 * 
 * ❌ NO SELLER TIERS (no Basic/Plus/Pro)
 * ❌ NO MONTHLY SUBSCRIPTIONS
 * ❌ NO CONTRACTOR TIERS (only Professional Services)
 * 
 * TABS: Verification | Professional Services | Add-ons
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ADD_ON_METADATA,
  ADD_ON_PRICING,
  ADD_ON_TYPES,
  formatPrice,
} from '@/config/pricing';
import SiteHeader from '@/components/SiteHeader';
import PricingCheckoutButton from '@/components/PricingCheckoutButton';
import { Check, Crown, Star, TrendingUp, ShieldCheck, User, Briefcase } from 'lucide-react';

// API-based session hook for public pages (no SessionProvider required)
function useOptionalSession() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  useEffect(() => {
    fetch('/api/auth/session')
      .then(res => res.ok ? res.json() : null)
      .then(data => setIsLoggedIn(!!data?.user))
      .catch(() => setIsLoggedIn(false));
  }, []);
  
  return isLoggedIn;
}

export default function PricingContent() {
  const isLoggedIn = useOptionalSession();
  const [activeTab, setActiveTab] = useState<'verification' | 'professional' | 'addons'>('verification');

  // Elite is the ONLY placement tier (no Premium/Featured)
  const top3Addons = [
    { type: ADD_ON_TYPES.ELITE, ...ADD_ON_METADATA[ADD_ON_TYPES.ELITE], price: ADD_ON_PRICING[ADD_ON_TYPES.ELITE], icon: Crown },
    { type: ADD_ON_TYPES.AI_ENHANCEMENT, ...ADD_ON_METADATA[ADD_ON_TYPES.AI_ENHANCEMENT], price: ADD_ON_PRICING[ADD_ON_TYPES.AI_ENHANCEMENT], icon: Star },
    { type: ADD_ON_TYPES.SPEC_SHEET, ...ADD_ON_METADATA[ADD_ON_TYPES.SPEC_SHEET], price: ADD_ON_PRICING[ADD_ON_TYPES.SPEC_SHEET], icon: TrendingUp },
  ];

  return (
    <>
      <SiteHeader />
      <div className="min-h-screen bg-white">
        {/* Header */}
        <section className="py-12 border-b border-surface-border">
          <div className="container-rail text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-navy-900 mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-text-secondary mb-8 max-w-xl mx-auto">
              No hidden fees. No monthly subscriptions. Pay for what you need.
            </p>

            {/* Tabs: Verification | Professional Services | Add-ons */}
            <div className="flex justify-center gap-1 border-b border-surface-border">
              <button
                onClick={() => setActiveTab('verification')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'verification'
                    ? 'border-rail-orange text-rail-orange'
                    : 'border-transparent text-text-secondary hover:text-navy-900'
                }`}
              >
                Verification
              </button>
              <button
                onClick={() => setActiveTab('professional')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'professional'
                    ? 'border-rail-orange text-rail-orange'
                    : 'border-transparent text-text-secondary hover:text-navy-900'
                }`}
              >
                Professional Services
              </button>
              <button
                onClick={() => setActiveTab('addons')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'addons'
                    ? 'border-rail-orange text-rail-orange'
                    : 'border-transparent text-text-secondary hover:text-navy-900'
                }`}
              >
                Add-ons
              </button>
            </div>
          </div>
        </section>

        {/* Tab Content */}
        <section className="py-12">
          <div className="container-rail">
            {/* Verification Tab - Buyers & Sellers */}
            {activeTab === 'verification' && (
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                  <h2 className="text-xl font-bold text-navy-900 mb-2">Identity Verification</h2>
                  <p className="text-text-secondary">
                    Simple verification to ensure trust and prevent spam on the platform.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Buyer Verification */}
                  <div className="bg-white rounded-xl p-6 border border-surface-border">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold text-navy-900 mb-1">Buyer Verification</h3>
                    <p className="text-sm text-text-secondary mb-4">
                      One-time identity confirmation for spam prevention and platform trust.
                    </p>
                    
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-navy-900">$1</span>
                      <span className="text-text-secondary ml-1">one-time</span>
                    </div>

                    <ul className="space-y-2 mb-6">
                      <li className="flex items-start gap-2 text-sm text-text-secondary">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        Contact sellers and submit inquiries
                      </li>
                      <li className="flex items-start gap-2 text-sm text-text-secondary">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        Message service providers
                      </li>
                      <li className="flex items-start gap-2 text-sm text-text-secondary">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        &quot;Identity Confirmed&quot; badge
                      </li>
                      <li className="flex items-start gap-2 text-sm text-text-secondary">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        Lifetime access — no renewal
                      </li>
                    </ul>

                    {isLoggedIn ? (
                      <Link
                        href="/dashboard/verification/buyer"
                        className="block text-center w-full py-3 rounded-lg font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700"
                      >
                        Verify Identity — $1
                      </Link>
                    ) : (
                      <Link
                        href="/auth/register"
                        className="block text-center w-full py-3 rounded-lg font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700"
                      >
                        Get Started
                      </Link>
                    )}
                    <p className="text-xs text-center text-text-tertiary mt-3">
                      Required to contact sellers. Browse listings free without verification.
                    </p>
                  </div>

                  {/* Seller Verification */}
                  <div className="bg-white rounded-xl p-6 border border-surface-border">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                      <ShieldCheck className="w-6 h-6 text-emerald-600" />
                    </div>
                    <h3 className="text-lg font-bold text-navy-900 mb-1">Seller Verification</h3>
                    <p className="text-sm text-text-secondary mb-4">
                      Required to publish equipment listings on the marketplace.
                    </p>
                    
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-navy-900">$29</span>
                      <span className="text-text-secondary ml-1">/year</span>
                    </div>

                    <ul className="space-y-2 mb-6">
                      <li className="flex items-start gap-2 text-sm text-text-secondary">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        Publish equipment listings
                      </li>
                      <li className="flex items-start gap-2 text-sm text-text-secondary">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        Receive buyer inquiries
                      </li>
                      <li className="flex items-start gap-2 text-sm text-text-secondary">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        &quot;Identity Verified&quot; seller badge
                      </li>
                      <li className="flex items-start gap-2 text-sm text-text-secondary">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        Access to listing add-ons
                      </li>
                    </ul>

                    {isLoggedIn ? (
                      <Link
                        href="/dashboard/verification"
                        className="block text-center w-full py-3 rounded-lg font-medium transition-colors bg-emerald-600 text-white hover:bg-emerald-700"
                      >
                        Get Verified — $29/year
                      </Link>
                    ) : (
                      <Link
                        href="/auth/register"
                        className="block text-center w-full py-3 rounded-lg font-medium transition-colors bg-emerald-600 text-white hover:bg-emerald-700"
                      >
                        Get Started
                      </Link>
                    )}
                    <p className="text-xs text-center text-text-tertiary mt-3">
                      Verification is not a subscription. No feature tiers.
                    </p>
                  </div>
                </div>

                {/* Disclaimer */}
                <p className="text-xs text-center text-text-tertiary mt-8 max-w-2xl mx-auto">
                  Verification confirms identity for platform trust. It does not imply endorsement, 
                  purchasing authority, or guarantee of transaction outcomes.
                </p>
              </div>
            )}

            {/* Professional Services Tab */}
            {activeTab === 'professional' && (
              <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                  <h2 className="text-xl font-bold text-navy-900 mb-2">Professional Services</h2>
                  <p className="text-text-secondary mb-4">
                    One product for both contractors and companies. Same access, same price, same unlocks.
                  </p>
                  <div className="inline-flex items-center gap-4 px-4 py-2 bg-slate-50 rounded-lg text-sm text-text-secondary">
                    <span className="flex items-center gap-1.5">
                      <span className="text-base">👷</span> Contractors
                    </span>
                    <span className="text-slate-300">|</span>
                    <span className="flex items-center gap-1.5">
                      <span className="text-base">🏢</span> Companies
                    </span>
                  </div>
                </div>

                {/* Pricing Options */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Annual Prepay - Preferred */}
                  <div className="bg-white rounded-xl p-6 ring-2 ring-green-500 shadow-lg relative">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full">Best Value</span>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 mt-2">
                      <Briefcase className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="text-xs font-semibold text-green-600 mb-2">Annual (Preferred)</div>
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-navy-900">$2,500</span>
                      <span className="text-text-secondary">/year</span>
                    </div>
                    <p className="text-sm text-green-600 font-medium mb-4">Save $500 vs 6-month option</p>
                    <ul className="space-y-2 mb-6">
                      <li className="flex items-start gap-2 text-sm text-text-secondary">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        Directory listing &amp; map visibility
                      </li>
                      <li className="flex items-start gap-2 text-sm text-text-secondary">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        Verification badge included
                      </li>
                      <li className="flex items-start gap-2 text-sm text-text-secondary">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        Full analytics dashboard
                      </li>
                      <li className="flex items-start gap-2 text-sm text-text-secondary">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        Receive service inquiries
                      </li>
                      <li className="flex items-start gap-2 text-sm text-text-secondary">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        Priority support
                      </li>
                    </ul>
                    {isLoggedIn ? (
                      <PricingCheckoutButton
                        tier="professional"
                        type="contractor"
                        billingPeriod="yearly"
                        className="block text-center w-full py-3 rounded-lg font-medium transition-colors bg-green-600 text-white hover:bg-green-700"
                      >
                        Get Annual Plan
                      </PricingCheckoutButton>
                    ) : (
                      <Link
                        href="/auth/register"
                        className="block text-center w-full py-3 rounded-lg font-medium transition-colors bg-green-600 text-white hover:bg-green-700"
                      >
                        Get Started
                      </Link>
                    )}
                  </div>

                  {/* 6-Month Option */}
                  <div className="bg-white rounded-xl p-6 border border-surface-border">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-4">
                      <Briefcase className="w-6 h-6 text-slate-600" />
                    </div>
                    <div className="text-xs font-semibold text-text-tertiary mb-2">6-Month Option</div>
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-navy-900">$1,500</span>
                      <span className="text-text-secondary">/6 months</span>
                    </div>
                    <p className="text-sm text-text-tertiary mb-4">$3,000 total if renewed twice per year</p>
                    <ul className="space-y-2 mb-6">
                      <li className="flex items-start gap-2 text-sm text-text-secondary">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        Lower upfront cost
                      </li>
                      <li className="flex items-start gap-2 text-sm text-text-secondary">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        Same features as annual
                      </li>
                      <li className="flex items-start gap-2 text-sm text-text-secondary">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        Verification badge included
                      </li>
                      <li className="flex items-start gap-2 text-sm text-text-secondary">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        Renews every 6 months
                      </li>
                    </ul>
                    {isLoggedIn ? (
                      <PricingCheckoutButton
                        tier="professional"
                        type="contractor"
                        billingPeriod="installment"
                        className="block text-center w-full py-3 rounded-lg font-medium transition-colors bg-navy-900 text-white hover:bg-navy-800"
                      >
                        Get 6-Month Plan
                      </PricingCheckoutButton>
                    ) : (
                      <Link
                        href="/auth/register"
                        className="block text-center w-full py-3 rounded-lg font-medium transition-colors bg-navy-900 text-white hover:bg-navy-800"
                      >
                        Get Started
                      </Link>
                    )}
                  </div>
                </div>

                {/* Disclaimer */}
                <p className="text-xs text-center text-text-tertiary mt-8 max-w-2xl mx-auto">
                  Professional Services applies to both contractors and companies. 
                  Verification reflects document review only — not endorsement or quality guarantee.
                </p>
              </div>
            )}

            {/* Add-ons Tab */}
            {activeTab === 'addons' && (
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                  <h2 className="text-xl font-bold text-navy-900 mb-2">Listing Add-ons</h2>
                  <p className="text-text-secondary">
                    Enhance your listings with visibility boosts and AI-powered tools.
                  </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  {top3Addons.map((addon) => {
                    const Icon = addon.icon;
                    return (
                      <div
                        key={addon.type}
                        className="bg-white rounded-xl p-6 border border-surface-border"
                      >
                        <div className="w-10 h-10 bg-rail-orange/10 rounded-lg flex items-center justify-center mb-4">
                          <Icon className="w-5 h-5 text-rail-orange" />
                        </div>
                        <h3 className="text-lg font-semibold text-navy-900 mb-1">{addon.name}</h3>
                        <p className="text-sm text-text-secondary mb-4">{addon.shortDescription}</p>
                        <div className="flex items-baseline gap-1 mb-4">
                          <span className="text-2xl font-bold text-navy-900">{formatPrice(addon.price)}</span>
                          {addon.type === ADD_ON_TYPES.ELITE && (
                            <span className="text-text-secondary text-sm">/30 days</span>
                          )}
                          {addon.type !== ADD_ON_TYPES.ELITE && (
                            <span className="text-text-secondary text-sm">one-time</span>
                          )}
                        </div>
                        {isLoggedIn ? (
                          <Link
                            href="/dashboard/listings"
                            className="block text-center w-full py-2 rounded-lg font-medium transition-colors bg-navy-900 text-white hover:bg-navy-800 text-sm"
                          >
                            Apply to Listing
                          </Link>
                        ) : (
                          <Link
                            href="/auth/register"
                            className="block text-center w-full py-2 rounded-lg font-medium transition-colors bg-navy-900 text-white hover:bg-navy-800 text-sm"
                          >
                            Get Started
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </div>

                <p className="text-xs text-center text-text-tertiary">
                  Add-ons are available to verified sellers. Elite Placement is the only visibility tier — 
                  no Premium or Featured tiers exist.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12 bg-slate-50">
          <div className="container-rail max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-navy-900 mb-8 text-center">
              Frequently Asked Questions
            </h2>
            
            <div className="space-y-4">
              <details className="bg-white rounded-xl border border-surface-border p-4 group">
                <summary className="font-medium text-navy-900 cursor-pointer list-none flex justify-between items-center">
                  Do I need to verify to browse listings?
                  <span className="text-text-tertiary group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="text-text-secondary mt-3 text-sm">
                  No. Anyone can browse listings and search the marketplace without any verification. 
                  Buyer verification ($1 one-time) is only required to contact sellers or submit inquiries.
                </p>
              </details>

              <details className="bg-white rounded-xl border border-surface-border p-4 group">
                <summary className="font-medium text-navy-900 cursor-pointer list-none flex justify-between items-center">
                  What&apos;s the difference between contractor and company?
                  <span className="text-text-tertiary group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="text-text-secondary mt-3 text-sm">
                  Both contractors and companies access Professional Services for the same price ($2,500/year or $1,500/6 months). 
                  The difference is in profile format only — the features, analytics, and visibility are identical.
                </p>
              </details>

              <details className="bg-white rounded-xl border border-surface-border p-4 group">
                <summary className="font-medium text-navy-900 cursor-pointer list-none flex justify-between items-center">
                  Are there monthly subscription plans?
                  <span className="text-text-tertiary group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="text-text-secondary mt-3 text-sm">
                  No. We do not offer monthly subscriptions for any product. Verification is one-time (buyers) or annual (sellers). 
                  Professional Services is annual or 6-month billing only.
                </p>
              </details>

              <details className="bg-white rounded-xl border border-surface-border p-4 group">
                <summary className="font-medium text-navy-900 cursor-pointer list-none flex justify-between items-center">
                  Is seller verification a subscription?
                  <span className="text-text-tertiary group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="text-text-secondary mt-3 text-sm">
                  Seller verification ($29/year) is a simple annual renewal to maintain listing privileges. 
                  It is not a tiered subscription — there are no Basic, Plus, or Pro plans.
                </p>
              </details>

              <details className="bg-white rounded-xl border border-surface-border p-4 group">
                <summary className="font-medium text-navy-900 cursor-pointer list-none flex justify-between items-center">
                  What does verification actually verify?
                  <span className="text-text-tertiary group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="text-text-secondary mt-3 text-sm">
                  Verification confirms identity and reviews submitted documentation. It does not guarantee 
                  work quality, licensing status, financial capability, or transaction outcomes. 
                  All negotiations and transactions occur directly between parties.
                </p>
              </details>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-navy-900 text-white">
          <div className="container-rail text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to get started?
            </h2>
            <p className="text-white/70 mb-8 max-w-xl mx-auto">
              Join thousands of rail professionals buying, selling, and connecting on The Rail Exchange.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center px-6 py-3 bg-rail-orange text-white font-semibold rounded-xl hover:bg-[#e55f15] transition-colors"
              >
                Create Free Account
              </Link>
              <Link
                href="/listings"
                className="inline-flex items-center justify-center px-6 py-3 bg-white/10 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors"
              >
                Browse Marketplace
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
