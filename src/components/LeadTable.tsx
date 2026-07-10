'use client';

import { useState } from 'react';
import LeadDetailModal from './LeadDetailModal';

interface Lead {
  id: string;
  formName: string;
  category: string;
  source: string;
  formData: Record<string, unknown>;
  status: string;
  assigned: string | null;
  createdAt: string;
}

interface Column {
  key: string;
  label: string;
  render?: (lead: Lead) => React.ReactNode;
}

const categoryColumns: Record<string, Column[]> = {
  'quote': [
    { key: 'customer', label: 'CUSTOMER', render: (l) => getCustomerName(l) },
    { key: 'route', label: 'ROUTE', render: (l) => getRoute(l) },
    { key: 'mode', label: 'MODE', render: (l) => String(l.formData?.modeOfTransport || '—') },
    { key: 'cargo', label: 'CARGO', render: (l) => String(l.formData?.typeOfGoods || '—') },
    { key: 'weight', label: 'WEIGHT', render: (l) => l.formData?.weight ? `${l.formData.weight} kg` : '—' },
    { key: 'status', label: 'STATUS' },
    { key: 'assigned', label: 'ASSIGNED' },
    { key: 'source', label: 'SOURCE', render: (l) => getSourceLabel(l.source) },
  ],
  'book-shipment': [
    { key: 'customer', label: 'CUSTOMER', render: (l) => getCustomerName(l) },
    { key: 'route', label: 'ROUTE', render: (l) => getRoute(l) },
    { key: 'mode', label: 'MODE', render: (l) => String(l.formData?.modeOfTransport || '—') },
    { key: 'cargo', label: 'CARGO', render: (l) => String(l.formData?.packageType || '—') },
    { key: 'weight', label: 'WEIGHT', render: (l) => l.formData?.weight ? `${l.formData.weight} kg` : '—' },
    { key: 'quoted', label: 'QUOTED', render: (l) => l.formData?.declaredValue ? `₹${l.formData.declaredValue}` : '—' },
    { key: 'status', label: 'STATUS' },
    { key: 'assigned', label: 'ASSIGNED' },
    { key: 'source', label: 'SOURCE', render: (l) => getSourceLabel(l.source) },
  ],
  'contact': [
    { key: 'customer', label: 'CUSTOMER', render: (l) => getCustomerName(l) },
    { key: 'email', label: 'EMAIL', render: (l) => String(l.formData?.email || '—') },
    { key: 'phone', label: 'PHONE', render: (l) => String(l.formData?.phone || '—') },
    { key: 'service', label: 'SERVICE', render: (l) => String(l.formData?.service || '—') },
    { key: 'status', label: 'STATUS' },
    { key: 'assigned', label: 'ASSIGNED' },
    { key: 'source', label: 'SOURCE', render: (l) => getSourceLabel(l.source) },
  ],
  'customs': [
    { key: 'customer', label: 'CUSTOMER', render: (l) => getCustomerName(l) },
    { key: 'email', label: 'EMAIL', render: (l) => String(l.formData?.email || '—') },
    { key: 'phone', label: 'PHONE', render: (l) => String(l.formData?.phone || '—') },
    { key: 'shipment', label: 'SHIPMENT TYPE', render: (l) => String(l.formData?.shipmentType || '—') },
    { key: 'status', label: 'STATUS' },
    { key: 'assigned', label: 'ASSIGNED' },
    { key: 'source', label: 'SOURCE', render: (l) => getSourceLabel(l.source) },
  ],
  'warehousing': [
    { key: 'customer', label: 'CUSTOMER', render: (l) => getCustomerName(l) },
    { key: 'email', label: 'EMAIL', render: (l) => String(l.formData?.email || '—') },
    { key: 'phone', label: 'PHONE', render: (l) => String(l.formData?.phone || '—') },
    { key: 'requirement', label: 'REQUIREMENT', render: (l) => String(l.formData?.requirement || l.formData?.message || '—') },
    { key: 'status', label: 'STATUS' },
    { key: 'assigned', label: 'ASSIGNED' },
    { key: 'source', label: 'SOURCE', render: (l) => getSourceLabel(l.source) },
  ],
  'packing-moving': [
    { key: 'customer', label: 'CUSTOMER', render: (l) => getCustomerName(l) },
    { key: 'route', label: 'ROUTE', render: (l) => getRoute(l) },
    { key: 'mode', label: 'MODE', render: (l) => String(l.formData?.modeOfTransport || '—') },
    { key: 'status', label: 'STATUS' },
    { key: 'assigned', label: 'ASSIGNED' },
    { key: 'source', label: 'SOURCE', render: (l) => getSourceLabel(l.source) },
  ],
};

function getCustomerName(lead: Lead): string {
  const fd = lead.formData;
  return String(
    fd?.senderName ||
    fd?.firstName && fd?.lastName ? `${fd.firstName} ${fd.lastName}` :
    fd?.fullName ||
    fd?.contactName ||
    fd?.name ||
    '—'
  );
}

function getRoute(lead: Lead): string {
  const fd = lead.formData;
  const from = String(fd?.pickupCity || fd?.shipFrom || '');
  const to = String(fd?.deliveryCity || fd?.shipTo || '');
  if (!from && !to) return '—';
  return `${from || '?'} → ${to || '?'}`;
}

function getSourceLabel(source: string): string {
  if (!source) return '—';
  const url = new URL(source);
  const path = url.pathname.replace(/\//g, '').replace(/-/g, ' ');
  return path || 'Home';
}

const statusOptions = ['NEW INQUIRY', 'CONTACTED', 'QUOTED', 'CLOSED', 'LOST'];

export default function LeadTable({ leads: initialLeads, category }: { leads: Lead[]; category: string }) {
  const [leads, setLeads] = useState(initialLeads);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [search, setSearch] = useState('');

  const columns = categoryColumns[category] || categoryColumns['quote'];

  const filteredLeads = leads.filter((lead) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    const customerName = getCustomerName(lead).toLowerCase();
    const source = getSourceLabel(lead.source).toLowerCase();
    return customerName.includes(searchLower) || source.includes(searchLower);
  });

  async function updateLead(id: string, data: { status?: string; assigned?: string }) {
    const res = await fetch('/api/leads', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...data }),
    });

    if (res.ok) {
      const updated = await res.json();
      setLeads((prev) =>
        prev.map((l) => (l.id === id ? { ...l, ...updated } : l))
      );
    }
  }

  return (
    <>
      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name or source..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-96 px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ba032a] focus:border-transparent"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >
                    {col.label}
                  </th>
                ))}
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="px-4 py-12 text-center text-gray-500">
                    No leads found
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedLead(lead)}
                  >
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3 text-sm text-gray-900">
                        {col.render ? (
                          col.render(lead)
                        ) : col.key === 'status' ? (
                          <select
                            value={lead.status}
                            onChange={(e) => {
                              e.stopPropagation();
                              updateLead(lead.id, { status: e.target.value });
                            }}
                            className="px-2 py-1 text-xs font-medium bg-[#ba032a]/10 text-[#ba032a] rounded-full border-0 focus:ring-2 focus:ring-[#ba032a]"
                          >
                            {statusOptions.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        ) : col.key === 'assigned' ? (
                          <input
                            type="text"
                            value={lead.assigned || ''}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => {
                              updateLead(lead.id, { assigned: e.target.value });
                            }}
                            placeholder="Assign..."
                            className="w-24 px-2 py-1 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ba032a]"
                          />
                        ) : (
                          String((lead as unknown as Record<string, unknown>)[col.key] || '—')
                        )}
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLead(lead);
                        }}
                        className="text-[#ba032a] hover:text-[#9a0225] text-sm font-medium"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
        />
      )}
    </>
  );
}
