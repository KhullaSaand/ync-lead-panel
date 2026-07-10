import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import LogoutButton from '@/components/LogoutButton';

const categories = [
  { id: 'quote', name: 'Quote Form', icon: '📊', description: 'All quotation requests' },
  { id: 'book-shipment', name: 'Book a Shipment', icon: '📦', description: 'Shipment bookings' },
  { id: 'contact', name: 'Contact Us', icon: '✉️', description: 'General inquiries' },
  { id: 'customs', name: 'Customs Clearance', icon: '🛃', description: 'Customs clearance requests' },
  { id: 'warehousing', name: 'Warehousing', icon: '🏭', description: 'Warehousing inquiries' },
  { id: 'packing-moving', name: 'Packing & Moving', icon: '🚚', description: 'Packing & moving requests' },
];

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  // Get lead counts per category
  const counts = await prisma.lead.groupBy({
    by: ['category'],
    _count: { id: true },
  });

  const countMap: Record<string, number> = {};
  counts.forEach((item) => {
    countMap[item.category] = item._count.id;
  });

  // Get total leads
  const totalLeads = await prisma.lead.count();

  // Get new leads (last 24 hours)
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const newLeads = await prisma.lead.count({
    where: { createdAt: { gte: yesterday } },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">YNC Admin</h1>
            <p className="text-sm text-gray-500">Lead Management Panel</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{session.user.email}</span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Total Leads</p>
            <p className="text-3xl font-bold text-gray-900">{totalLeads}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Last 24 Hours</p>
            <p className="text-3xl font-bold text-[#ba032a]">{newLeads}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Categories</p>
            <p className="text-3xl font-bold text-gray-900">{categories.length}</p>
          </div>
        </div>

        {/* Category Cards */}
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Categories</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/leads/${cat.id}`}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-[#ba032a]/20 transition-all group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-3xl">{cat.icon}</span>
                  <h3 className="mt-3 text-lg font-semibold text-gray-900 group-hover:text-[#ba032a] transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{cat.description}</p>
                </div>
                <span className="text-2xl font-bold text-[#ba032a]">
                  {countMap[cat.id] || 0}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
