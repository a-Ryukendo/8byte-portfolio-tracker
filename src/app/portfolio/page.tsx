'use client';

import dynamic from 'next/dynamic';

const PortfolioTable = dynamic(() => import('@/components/PortfolioTable'), {
  loading: () => <div>Loading portfolio data...</div>
});

export default function PortfolioPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Portfolio Overview</h1>
      <PortfolioTable />
    </div>
  );
}
