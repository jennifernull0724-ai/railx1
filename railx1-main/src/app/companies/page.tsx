/**
export const dynamic = 'force-dynamic';
 * THE RAIL EXCHANGE™ — Companies Directory
 * 
 * Browse and filter rail service companies.
 * Parallel to /contractors but specifically for company entities.
 * 
 * ENTITY DIFFERENTIATION:
 * - Companies: Business entities offering professional rail services
 * - Contractors: Individual contractors or small contractor teams
 * 
 * SAME ENTITLEMENT:
 * - Both use Professional Services ($2,500/year)
 * - Same access, same unlocks
 * - Only profile format differs
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import connectDB from '@/lib/db';
import ContractorProfile from '@/models/ContractorProfile';
import { SERVICE_CATEGORIES, US_STATES } from '@/lib/constants';
import { CONTRACTOR_TYPES, CONTRACTOR_TYPE_CONFIG, type ContractorType } from '@/config/contractor-types';

export const metadata: Metadata = {
  title: 'Rail Service Companies Directory | The Rail Exchange',
  description: 'Find verified rail industry service companies. Browse companies offering track work, signaling, electrical, bridge construction, and more professional rail services.',
};

interface SearchParams {
  service?: string;
  region?: string;
  contractorType?: string;
  search?: string;
  page?: string;
}

interface Company {
  _id: string;
  businessName: string;
  businessDescription: string;
  logo?: string;
  services: string[];
  contractorTypes?: string[];
  subServices?: Record<string, string[]>;
  regionsServed: string[];
  yearsInBusiness: number;
  verificationStatus: string;
  visibilityTier: 'verified' | 'featured' | 'priority';
  address: {
    city: string;
    state: string;
  };
  entityType?: 'company' | 'contractor';
}

async function getCompanies(searchParams: SearchParams) {
  try {
    await connectDB();
  } catch (dbError) {
    console.error('Database connection error in companies:', dbError);
    return {
      companies: [] as Company[],
      total: 0,
      pages: 1,
      currentPage: 1,
    };
  }

  const { service, region, contractorType, search, page = '1' } = searchParams;
  const limit = 12;
  const skip = (parseInt(page) - 1) * limit;
  const now = new Date();

  // ================================================================
  // HARD VISIBILITY GATE — NO FREE COMPANIES
  // ================================================================
  // Companies MUST be:
  // 1. Verified (verificationStatus === 'verified')
  // 2. Have an active paid visibility tier (visibilityTier !== 'none')
  // 3. Subscription must be active (visibilitySubscriptionStatus === 'active')
  // 4. Entity type is 'company' (if field exists) OR infer from profile data
  // ================================================================
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: any = {
    isActive: true,
    isPublished: true,
    // HARD GATE: Must be verified
    verificationStatus: 'verified',
    // HARD GATE: Must have a paid visibility tier
    visibilityTier: { $in: ['verified', 'featured', 'priority'] },
    // HARD GATE: Subscription must be active
    visibilitySubscriptionStatus: 'active',
    // COMPANY FILTER: Only show entities marked as companies
    // If entityType field exists, filter by it. Otherwise, show all (backwards compat)
    $or: [
      { entityType: 'company' },
      { entityType: { $exists: false } }, // Include legacy entries without entityType
    ],
    // HARD GATE: Visibility not expired
    $and: [
      {
        $or: [
          { visibilityExpiresAt: { $gt: now } },
          { visibilityExpiresAt: { $exists: false } },
          { visibilityExpiresAt: null },
        ],
      },
      // HARD GATE: Verification not expired
      {
        $or: [
          { verifiedBadgeExpiresAt: { $gt: now } },
          { verifiedBadgeExpiresAt: { $exists: false } },
          { verifiedBadgeExpiresAt: null },
        ],
      },
    ],
  };

  if (service) {
    query.services = service;
  }

  if (region) {
    query.regionsServed = region;
  }

  // Filter by contractor type (new structured types)
  if (contractorType) {
    query.contractorTypes = contractorType;
  }

  if (search) {
    query.$and = query.$and || [];
    query.$and.push({
      $or: [
        { businessName: { $regex: search, $options: 'i' } },
        { businessDescription: { $regex: search, $options: 'i' } },
      ],
    });
  }

  try {
    const [companies, total] = await Promise.all([
      ContractorProfile.find(query)
        .select('businessName businessDescription logo services contractorTypes subServices regionsServed yearsInBusiness verificationStatus visibilityTier entityType address.city address.state')
        .sort({ 
          // Priority tier first, then Featured, then Verified
          visibilityTier: -1, 
          yearsInBusiness: -1 
        })
        .skip(skip)
        .limit(limit)
        .lean(),
      ContractorProfile.countDocuments(query),
    ]);

    return {
      companies: companies as unknown as Company[],
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
    };
  } catch (queryError) {
    console.error('Companies query error:', queryError);
    return {
      companies: [] as Company[],
      total: 0,
      pages: 1,
      currentPage: parseInt(page),
    };
  }
}

function CompanyCard({ company }: { company: Company }) {
  // Use new contractor types if available, fallback to legacy services
  const hasContractorTypes = company.contractorTypes && company.contractorTypes.length > 0;
  
  const typeLabels = hasContractorTypes
    ? company.contractorTypes!.slice(0, 3).map((typeId) => {
        const config = CONTRACTOR_TYPE_CONFIG[typeId as ContractorType];
        return config?.label || typeId;
      })
    : company.services.slice(0, 3).map((serviceId) => {
        const service = SERVICE_CATEGORIES.find((s) => s.id === serviceId);
        return service?.label || serviceId;
      });

  const totalCount = hasContractorTypes 
    ? company.contractorTypes!.length 
    : company.services.length;

  // Visibility tier badge styling
  const getTierBadge = () => {
    switch (company.visibilityTier) {
      case 'priority':
        return (
          <span 
            className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-xs font-semibold rounded-full shadow-md"
            title="This placement reflects paid visibility options, not company quality or endorsement."
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Sponsored
          </span>
        );
      case 'featured':
        return (
          <span 
            className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-rail-orange to-orange-500 text-white text-xs font-semibold rounded-full"
            title="This placement reflects paid visibility options, not company quality or endorsement."
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zm7-10a1 1 0 01.707.293l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L13.586 6l-2.293-2.293A1 1 0 0112 2z" clipRule="evenodd" />
            </svg>
            Sponsored
          </span>
        );
      default:
        return (
          <span 
            className="badge-verified text-xs"
            title="Verified indicates business documents were submitted and reviewed. It does not guarantee work quality, licensing, or project outcomes."
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            ID Verified
          </span>
        );
    }
  };

  return (
    <Link
      href={`/contractors/${company._id}`}
      className="group bg-white rounded-2xl shadow-card border border-surface-border hover:shadow-elevated transition-all duration-300 overflow-hidden"
    >
      {/* Header - Company styling with building icon */}
      <div className="h-32 bg-gradient-to-br from-blue-900 to-blue-800 relative">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute top-4 left-4">
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/20 backdrop-blur text-white text-xs font-medium rounded-full">
            🏢 Company
          </span>
        </div>
        <div className="absolute top-4 right-4">
          {getTierBadge()}
        </div>
      </div>

      {/* Logo & Content */}
      <div className="p-6 pt-0 -mt-10 relative">
        <div className="w-20 h-20 bg-white rounded-xl border border-surface-border shadow-card flex items-center justify-center overflow-hidden mb-4">
          {company.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={company.logo}
              alt={company.businessName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-2xl font-bold text-text-tertiary">
              {company.businessName.charAt(0)}
            </span>
          )}
        </div>

        <h3 className="heading-md group-hover:text-rail-orange transition-colors line-clamp-1">
          {company.businessName}
        </h3>
        <p className="text-body-sm text-text-secondary mt-1">
          {company.address.city}, {company.address.state} • {company.yearsInBusiness} yrs <span className="text-text-tertiary">(Self-reported)</span>
        </p>

        <p className="text-body-sm text-text-secondary mt-3 line-clamp-2">
          {company.businessDescription}
        </p>

        {/* Services / Contractor Types */}
        <div className="flex flex-wrap gap-2 mt-4">
          {typeLabels.map((label) => (
            <span
              key={label}
              className="px-2 py-1 bg-surface-secondary rounded text-caption font-medium text-navy-900"
            >
              {label}
            </span>
          ))}
          {totalCount > 3 && (
            <span className="px-2 py-1 bg-surface-secondary rounded text-caption text-text-tertiary">
              +{totalCount - 3}
            </span>
          )}
        </div>

        {/* CTA */}
        <div className="mt-4 pt-4 border-t border-surface-border">
          <span className="text-body-sm font-semibold text-rail-orange group-hover:text-rail-orange-dark flex items-center gap-1">
            View Company Profile
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  if (hasFilters) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
        <div className="w-20 h-20 bg-surface-secondary rounded-full flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h3 className="heading-md mb-2">No companies found</h3>
        <p className="text-body-md text-text-secondary max-w-md">
          Try adjusting your filters or search terms to find more companies.
        </p>
      </div>
    );
  }

  return (
    <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      </div>
      <h3 className="heading-md mb-2">No Service Companies Yet</h3>
      <p className="text-body-md text-text-secondary max-w-md mb-6">
        Rail service companies can activate Professional Services to be listed here.
      </p>
      <Link href="/dashboard/contractor/verify" className="btn-primary">
        Activate Professional Services
      </Link>
    </div>
  );
}

function Pagination({ currentPage, pages }: { currentPage: number; pages: number }) {
  if (pages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-12">
      {currentPage > 1 && (
        <Link
          href={`/companies?page=${currentPage - 1}`}
          className="px-4 py-2 bg-white border border-surface-border rounded-lg text-body-sm font-medium text-navy-900 hover:bg-surface-secondary transition-colors"
        >
          Previous
        </Link>
      )}
      <span className="px-4 py-2 text-body-sm text-text-secondary">
        Page {currentPage} of {pages}
      </span>
      {currentPage < pages && (
        <Link
          href={`/companies?page=${currentPage + 1}`}
          className="px-4 py-2 bg-white border border-surface-border rounded-lg text-body-sm font-medium text-navy-900 hover:bg-surface-secondary transition-colors"
        >
          Next
        </Link>
      )}
    </div>
  );
}

async function CompaniesList({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const { companies, total, pages, currentPage } = await getCompanies(params);
  const hasFilters = !!(params.service || params.contractorType || params.region || params.search);

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <p className="text-body-md text-text-secondary">
          {total > 0 ? (
            <>
              Showing <span className="font-semibold text-navy-900">{companies.length}</span> of{' '}
              <span className="font-semibold text-navy-900">{total}</span> companies
            </>
          ) : (
            'No companies found'
          )}
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.length > 0 ? (
          companies.map((company) => (
            <CompanyCard key={company._id} company={company} />
          ))
        ) : (
          <EmptyState hasFilters={hasFilters} />
        )}
      </div>

      <Pagination currentPage={currentPage} pages={pages} />
    </>
  );
}

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  return (
    <div className="min-h-screen bg-surface-primary">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-900 to-blue-800 text-white py-16 md:py-20">
        <div className="container-rail max-w-[1280px] mx-auto px-6 md:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur border border-white/20 rounded-full mb-6">
              <span className="text-base">🏢</span>
              <span className="text-sm font-medium">Professional Services</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Rail Service Companies
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-8">
              Find document-reviewed companies offering professional rail services. 
              Search by service type, region, and specialization.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/contractors"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-sm font-medium transition-colors"
              >
                <span>👷</span> View Contractors
              </Link>
              <Link
                href="/dashboard/contractor/verify"
                className="inline-flex items-center gap-2 px-4 py-2 bg-rail-orange hover:bg-[#e55f15] rounded-lg text-sm font-medium transition-colors"
              >
                Activate Professional Services
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="bg-white border-b border-surface-border py-6">
        <div className="container-rail max-w-[1280px] mx-auto px-6 md:px-8">
          <form className="flex flex-wrap gap-4" action="/companies" method="GET">
            {/* Service Filter */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-navy-900 mb-1.5">Service Type</label>
              <select
                name="contractorType"
                defaultValue={params.contractorType || ''}
                className="w-full px-3 py-2 border border-surface-border rounded-lg text-sm focus:ring-2 focus:ring-rail-orange focus:border-rail-orange"
              >
                <option value="">All Services</option>
                {Object.values(CONTRACTOR_TYPE_CONFIG).map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Region Filter */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-navy-900 mb-1.5">Region</label>
              <select
                name="region"
                defaultValue={params.region || ''}
                className="w-full px-3 py-2 border border-surface-border rounded-lg text-sm focus:ring-2 focus:ring-rail-orange focus:border-rail-orange"
              >
                <option value="">All Regions</option>
                {US_STATES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div className="flex-1 min-w-[250px]">
              <label className="block text-sm font-medium text-navy-900 mb-1.5">Search</label>
              <input
                type="text"
                name="search"
                defaultValue={params.search || ''}
                placeholder="Company name or description..."
                className="w-full px-3 py-2 border border-surface-border rounded-lg text-sm focus:ring-2 focus:ring-rail-orange focus:border-rail-orange"
              />
            </div>

            {/* Submit */}
            <div className="flex items-end">
              <button
                type="submit"
                className="px-6 py-2 bg-navy-900 text-white rounded-lg text-sm font-medium hover:bg-navy-800 transition-colors"
              >
                Search
              </button>
            </div>
          </form>

          {/* Entity Type Note */}
          <p className="mt-4 text-xs text-text-tertiary">
            This page shows companies only. <Link href="/contractors" className="text-rail-orange hover:underline">View all service providers</Link> including individual contractors.
          </p>
        </div>
      </section>

      {/* Companies Grid */}
      <section className="py-12">
        <div className="container-rail max-w-[1280px] mx-auto px-6 md:px-8">
          <Suspense
            fallback={
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-80 bg-surface-secondary rounded-2xl animate-pulse" />
                ))}
              </div>
            }
          >
            <CompaniesList searchParams={searchParams} />
          </Suspense>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-navy-900 to-navy-800 py-16">
        <div className="container-rail max-w-[1280px] mx-auto px-6 md:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            List Your Company
          </h2>
          <p className="text-white/70 max-w-2xl mx-auto mb-8">
            Professional Services includes directory listing, document review, verification badge, 
            analytics dashboard, and priority support. One price for both contractors and companies.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/dashboard/contractor/verify"
              className="inline-flex items-center justify-center px-6 py-3 bg-rail-orange text-white font-semibold rounded-xl hover:bg-[#e55f15] transition-colors"
            >
              Activate Professional Services
            </Link>
            <Link
              href="/pricing?tab=contractor"
              className="inline-flex items-center justify-center px-6 py-3 bg-white/10 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
