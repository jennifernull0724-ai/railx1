/**
 * THE RAIL EXCHANGE™ — Pricing Content
 * =====================================
 * BATCH 12 REQUIREMENTS:
 * - Tabs: Seller Plans | Contractor Plans | Add-ons ✓
 * - Seller plans prioritized (default tab) ✓
 * - No comparison table ✓
 * - Add-ons: Top 3 + "See all add-ons" link ✓
 * - FAQ collapsed (accordion) ✓
 * - CTA labels: Free→"Get Started Free", Paid(out)→"Get Started", Paid(in)→"Upgrade Now"
 * - OMIT: Stacked pricing sections, large promo banners, duplicate feature lists
 */

'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  SELLER_TIER_CONFIG,
  CONTRACTOR_TIER_CONFIG,
  ADD_ON_METADATA,
  ADD_ON_PRICING,
  SELLER_TIERS,
  CONTRACTOR_TIERS,
  ADD_ON_TYPES,
  formatPrice,
  formatAddOnDuration,
} from '@/config/pricing';
import SiteHeader from '@/components/SiteHeader';
import PricingCheckoutButton from '@/components/PricingCheckoutButton';
import { Check, Crown, Star, TrendingUp } from 'lucide-react';

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
  const searchParams = useSearchParams();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [activeTab, setActiveTab] = useState<'seller' | 'contractor' | 'addons'>('seller');
  
  // Get promo code from URL
  const promoCode = searchParams.get('promo') || undefined;

  const sellerTiers = [
    SELLER_TIER_CONFIG[SELLER_TIERS.BASIC],
    SELLER_TIER_CONFIG[SELLER_TIERS.PLUS],
    SELLER_TIER_CONFIG[SELLER_TIERS.PRO],
  ];

  // Professional Plan - unified for Contractors and Companies
  const professionalTiers = [
    CONTRACTOR_TIER_CONFIG[CONTRACTOR_TIERS.PROFESSIONAL],
  ];

  // Elite is the ONLY placement tier (no Premium/Featured)
  const top3Addons = [
    { type: ADD_ON_TYPES.ELITE, ...ADD_ON_METADATA[ADD_ON_TYPES.ELITE], price: ADD_ON_PRICING[ADD_ON_TYPES.ELITE], icon: Crown },
    { type: ADD_ON_TYPES.AI_ENHANCEMENT, ...ADD_ON_METADATA[ADD_ON_TYPES.AI_ENHANCEMENT], price: ADD_ON_PRICING[ADD_ON_TYPES.AI_ENHANCEMENT], icon: Star },
    { type: ADD_ON_TYPES.SPEC_SHEET, ...ADD_ON_METADATA[ADD_ON_TYPES.SPEC_SHEET], price: ADD_ON_PRICING[ADD_ON_TYPES.SPEC_SHEET], icon: TrendingUp },
  ];

  const getPrice = (tier: { priceMonthly: number; priceYearly?: number }) => {
    if (billingPeriod === 'yearly' && tier.priceYearly) {
      return tier.priceYearly / 12;
    }
    return tier.priceMonthly;
  };

  const getSavings = (tier: { priceMonthly: number; priceYearly?: number }) => {
    if (!tier.priceYearly || tier.priceMonthly === 0) return 0;
    const yearlyTotal = tier.priceYearly;
    const monthlyTotal = tier.priceMonthly * 12;
    return monthlyTotal - yearlyTotal;
  };

  // CTA Label logic: Free→"Get Started Free", Paid(out)→"Get Started", Paid(in)→"Upgrade Now"
  const getCtaLabel = (tier: { priceMonthly: number }) => {
    if (tier.priceMonthly === 0) return 'Get Started Free';
    if (!isLoggedIn) return 'Get Started';
    return 'Upgrade Now';
  };

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
              No hidden fees, cancel anytime.
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center gap-2 p-1 bg-surface-secondary rounded-full mb-8">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  billingPeriod === 'monthly'
                    ? 'bg-white text-navy-900 shadow-sm'
                    : 'text-text-secondary'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                  billingPeriod === 'yearly'
                    ? 'bg-white text-navy-900 shadow-sm'
                    : 'text-text-secondary'
                }`}
              >
                Yearly
                <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                  Save 17%
                </span>
              </button>
            </div>

            {/* Tabs: Seller | Contractor | Add-ons */}
            <div className="flex justify-center gap-1 border-b border-surface-border">
              <button
                onClick={() => setActiveTab('seller')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'seller'
                    ? 'border-rail-orange text-rail-orange'
                    : 'border-transparent text-text-secondary hover:text-navy-900'
                }`}
              >
                Seller Plans
              </button>
              <button
                onClick={() => setActiveTab('contractor')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'contractor'
                    ? 'border-rail-orange text-rail-orange'
                    : 'border-transparent text-text-secondary hover:text-navy-900'
                }`}
              >
                Contractor Plans
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
            {/* Seller Plans */}
            {activeTab === 'seller' && (
              <div className="max-w-5xl mx-auto">
                <p className="text-center text-sm text-text-secondary mb-6">
                  Seller verification ($29/year) is required to publish listings and is separate from optional subscription tiers.
                </p>
                <div className="grid md:grid-cols-3 gap-6">
                {sellerTiers.map((tier) => {
                  const monthlyPrice = getPrice(tier);
                  const savings = getSavings(tier);
                  
                  return (
                    <div
                      key={tier.id}
                      className={`bg-white rounded-xl p-6 ${
                        tier.isPopular 
                          ? 'ring-2 ring-rail-orange shadow-lg' 
                          : 'border border-surface-border'
                      }`}
                    >
                      {tier.isPopular && (
                        <div className="text-xs font-semibold text-rail-orange mb-2">Most Popular</div>
                      )}
                      <h3 className="text-lg font-bold text-navy-900 mb-1">{tier.name}</h3>
                      <p className="text-sm text-text-secondary mb-4">{tier.description}</p>
                      
                      <div className="mb-4">
                        <span className="text-3xl font-bold text-navy-900">
                          {formatPrice(monthlyPrice)}
                        </span>
                        {monthlyPrice > 0 && <span className="text-text-secondary">/mo</span>}
                      </div>

                      {billingPeriod === 'yearly' && savings > 0 && (
                        <p className="text-sm text-green-600 mb-4">Save {formatPrice(savings)}/year</p>
                      )}

                      <p className="text-sm font-medium text-navy-900 mb-4">
                        {tier.listingLimit === -1 ? 'Unlimited listings' : `Up to ${tier.listingLimit} listings`}
                      </p>

                      <ul className="space-y-2 mb-6">
                        {tier.features.slice(0, 5).map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-text-secondary">
                            <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                            {feature}
                          </li>
                        ))}
                      </ul>

                      {isLoggedIn ? (
                        tier.priceMonthly === 0 ? (
                          <Link
                            href="/dashboard"
                            className={`block text-center w-full py-3 rounded-lg font-medium transition-colors ${
                              tier.isPopular 
                                ? 'bg-rail-orange text-white hover:bg-[#e55f15]' 
                                : 'bg-navy-900 text-white hover:bg-navy-800'
                            }`}
                          >
                            {getCtaLabel(tier)}
                          </Link>
                        ) : (
                          <PricingCheckoutButton
                            tier={tier.id}
                            type="seller"
                            billingPeriod={billingPeriod}
                            promoCode={promoCode}
                            className={`block text-center w-full py-3 rounded-lg font-medium transition-colors ${
                              tier.isPopular 
                                ? 'bg-rail-orange text-white hover:bg-[#e55f15]' 
                                : 'bg-navy-900 text-white hover:bg-navy-800'
                            }`}
                          >
                            {getCtaLabel(tier)}
                          </PricingCheckoutButton>
                        )
                      ) : (
                        <Link
                          href="/auth/register"
                          className={`block text-center w-full py-3 rounded-lg font-medium transition-colors ${
                            tier.isPopular 
                              ? 'bg-rail-orange text-white hover:bg-[#e55f15]' 
                              : 'bg-navy-900 text-white hover:bg-navy-800'
                          }`}
                        >
                          {getCtaLabel(tier)}
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Contractor/Company Plans - Professional Access */}
            {activeTab === 'contractor' && (
              <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                  <h2 className="text-xl font-bold text-navy-900 mb-2">Professional Access</h2>
                  <p className="text-text-secondary">
                    Both Contractors and Companies receive full Professional Access. Profile formats differ; access does not.
                  </p>
                </div>

                {/* Pricing Options */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Annual Prepay - Preferred */}
                  <div className="bg-white rounded-xl p-6 ring-2 ring-green-500 shadow-lg relative">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full">Best Value</span>
                    </div>
                    <div className="text-xs font-semibold text-green-600 mb-2 mt-2">Annual Prepay (Preferred)</div>
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-navy-900">$2,500</span>
                      <span className="text-text-secondary">/year</span>
                    </div>
                    <p className="text-sm text-green-600 font-medium mb-4">Save $2,000 vs installment option</p>
                    <ul className="space-y-2 mb-6">
                      <li className="flex items-start gap-2 text-sm text-text-secondary">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        Single annual payment
                      </li>
                      <li className="flex items-start gap-2 text-sm text-text-secondary">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        Verification included
                      </li>
                      <li className="flex items-start gap-2 text-sm text-text-secondary">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        Full analytics suite
                      </li>
                      <li className="flex items-start gap-2 text-sm text-text-secondary">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        Map visibility & directory listing
                      </li>
                      <li className="flex items-start gap-2 text-sm text-text-secondary">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        Full dashboard access
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
                        Get Annual Plan
                      </Link>
                    )}
                    <p className="text-xs text-center text-green-200 mt-2">Plan activates after account verification</p>
                  </div>

                  {/* Installment Option */}
                  <div className="bg-white rounded-xl p-6 border border-surface-border">
                    <div className="text-xs font-semibold text-text-tertiary mb-2">Installment Option</div>
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-navy-900">$1,500</span>
                      <span className="text-text-secondary">/5 months</span>
                    </div>
                    <p className="text-sm text-text-tertiary mb-4">3 payments per year • $4,500 total annually</p>
                    <ul className="space-y-2 mb-6">
                      <li className="flex items-start gap-2 text-sm text-text-secondary">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        Lower upfront cost
                      </li>
                      <li className="flex items-start gap-2 text-sm text-text-secondary">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        Verification included
                      </li>
                      <li className="flex items-start gap-2 text-sm text-text-secondary">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        Same features as annual
                      </li>
                      <li className="flex items-start gap-2 text-sm text-text-secondary">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        Auto-renews every 5 months
                      </li>
                    </ul>
                    {isLoggedIn ? (
                      <PricingCheckoutButton
                        tier="professional"
                        type="contractor"
                        billingPeriod="installment"
                        className="block text-center w-full py-3 rounded-lg font-medium transition-colors bg-navy-900 text-white hover:bg-navy-800"
                      >
                        Get Installment Plan
                      </PricingCheckoutButton>
                    ) : (
                      <Link
                        href="/auth/register"
                        className="block text-center w-full py-3 rounded-lg font-medium transition-colors bg-navy-900 text-white hover:bg-navy-800"
                      >
                        Get Installment Plan
                      </Link>
                    )}
                    <p className="text-xs text-center text-text-tertiary mt-2">Plan activates after account verification</p>
                  </div>
                </div>
                <p className="text-xs text-center text-text-secondary mt-4">
                  For contractors and companies. Verification reflects document review only.
                </p>
              </div>
            )}

            {/* Add-ons - Top 3 only + See All */}
            {activeTab === 'addons' && (
              <div className="max-w-4xl mx-auto">
                <p className="text-center text-sm text-text-secondary mb-6">
                  Elite is the only placement tier available. AI Enhancement and Spec Sheet are one-time purchases.
                </p>
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
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-bold text-navy-900">{formatPrice(addon.price)}</span>
                        </div>
                        <span className="text-xs text-text-tertiary">{formatAddOnDuration(addon.type)}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="text-center">
                  <Link
                    href="/dashboard/addons"
                    className="text-rail-orange font-medium hover:underline"
                  >
                    See all add-ons →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* FAQ - Collapsed */}
        <section className="py-12 border-t border-surface-border">
          <div className="container-rail">
            <h2 className="text-2xl font-bold text-navy-900 text-center mb-8">FAQ</h2>
            <div className="max-w-2xl mx-auto space-y-2">
              <details className="bg-white rounded-lg border border-surface-border group">
                <summary className="p-4 font-medium text-navy-900 cursor-pointer list-none flex items-center justify-between">
                  Can I change my plan at any time?
                  <svg className="w-5 h-5 text-text-tertiary group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-4 pb-4 text-sm text-text-secondary">
                  Yes! You can upgrade or downgrade your plan at any time. When upgrading, you&apos;ll be charged the prorated difference.
                </div>
              </details>
              <details className="bg-white rounded-lg border border-surface-border group">
                <summary className="p-4 font-medium text-navy-900 cursor-pointer list-none flex items-center justify-between">
                  What happens to my listings if I downgrade?
                  <svg className="w-5 h-5 text-text-tertiary group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-4 pb-4 text-sm text-text-secondary">
                  Your existing listings will remain active. However, if you exceed the listing limit of your new plan, you won&apos;t be able to create new listings.
                </div>
              </details>
              <details className="bg-white rounded-lg border border-surface-border group">
                <summary className="p-4 font-medium text-navy-900 cursor-pointer list-none flex items-center justify-between">
                  How long do add-ons last?
                  <svg className="w-5 h-5 text-text-tertiary group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-4 pb-4 text-sm text-text-secondary">
                  Featured, Premium, and Elite add-ons last 30 days. AI Enhancement and Spec Sheet are one-time purchases.
                </div>
              </details>
              <details className="bg-white rounded-lg border border-surface-border group">
                <summary className="p-4 font-medium text-navy-900 cursor-pointer list-none flex items-center justify-between">
                  Is there a free trial?
                  <svg className="w-5 h-5 text-text-tertiary group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-4 pb-4 text-sm text-text-secondary">
                  Buyers can browse and contact sellers completely free. Sellers can start with a basic plan.
                </div>
              </details>
              <details className="bg-white rounded-lg border border-surface-border group">
                <summary className="p-4 font-medium text-navy-900 cursor-pointer list-none flex items-center justify-between">
                  What&apos;s the difference between annual and installment billing for Professional Access?
                  <svg className="w-5 h-5 text-text-tertiary group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-4 pb-4 text-sm text-text-secondary">
                  Both options include identical features. Annual prepay ($2,500/year) saves $2,000 compared to installments ($1,500 every 5 months, totaling $4,500/year). Annual billing offers the best value.
                </div>
              </details>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
