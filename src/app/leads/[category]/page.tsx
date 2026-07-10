import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import LogoutButton from '@/components/LogoutButton';
import LeadTable from '@/components/LeadTable';

const categoryNames: Record<string, string> = {
  'quote': 'Quote Form',
  'book-shipment': 'Book a Shipment',
  'contact': 'Contact Us',
  'customs': 'Customs Clearance',
  'warehousing': 'Warehousing',
  'packing-moving': 'Packing & Moving',
};

export default async function LeadsPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const session = await auth();
  if (!session?.user) redirect('/login');

  const leads = await prisma.lead.findMany({
    where: { category },
    orderBy: { createdAt: 'desc' },
  });

  const categoryName = categoryNames[category] || category;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{categoryName}</h1>
              <p className="text-sm text-gray-500">{leads.length} leads</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{session.user.email}</span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LeadTable leads={leads as unknown as { id: string; formName: string; category: string; source: string; formData: Record<string, unknown>; status: string; assigned: string | null; createdAt: string }[]} category={category} />
      </main>
    </div>
  );
}
