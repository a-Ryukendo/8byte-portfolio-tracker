import dynamic from 'next/dynamic';

const PortfolioTable = dynamic(() => import('@/components/PortfolioTable'), { ssr: false });

export default function PortfolioPage() {
  return (
    <main className="max-w-6xl mx-auto py-8">
      <h1 className="text-2xl font-semibold mb-4">My Portfolio Dashboard</h1>
      <PortfolioTable />
    </main>
  );
}
