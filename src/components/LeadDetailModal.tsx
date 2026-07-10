'use client';

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

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getSourceLabel(source: string): string {
  if (!source) return '—';
  try {
    const url = new URL(source);
    const path = url.pathname.replace(/\//g, '').replace(/-/g, ' ');
    return path || 'Home';
  } catch {
    return source;
  }
}

export default function LeadDetailModal({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const formData = lead.formData;
  const customerName = getCustomerName(lead);

  // Group form fields by section
  const sections = getSections(lead.category, formData);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{customerName}</h2>
            <p className="text-sm text-gray-500">{lead.formName} • {formatDate(lead.createdAt)}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto max-h-[calc(80vh-120px)]">
          {/* Status & Assignment */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500">STATUS:</span>
              <span className="px-3 py-1 text-xs font-medium bg-[#ba032a]/10 text-[#ba032a] rounded-full">
                {lead.status}
              </span>
            </div>
            {lead.assigned && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500">ASSIGNED:</span>
                <span className="text-sm text-gray-900">{lead.assigned}</span>
              </div>
            )}
          </div>

          {/* Source */}
          <div className="mb-6">
            <span className="text-xs font-medium text-gray-500">SOURCE:</span>
            <p className="text-sm text-gray-900 mt-1">{getSourceLabel(lead.source)}</p>
            {lead.source && (
              <a
                href={lead.source}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#ba032a] hover:underline mt-1 inline-block"
              >
                Open page ↗
              </a>
            )}
          </div>

          {/* Form Sections */}
          {sections.map((section) => (
            <div key={section.title} className="mb-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                {section.title}
              </h3>
              <div className="bg-gray-50 rounded-xl p-4">
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                  {section.fields.map((field) => (
                    <div key={field.label}>
                      <dt className="text-xs text-gray-500">{field.label}</dt>
                      <dd className="text-sm text-gray-900 font-medium mt-0.5">
                        {field.value || '—'}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          ))}

          {/* Raw Data (collapsible) */}
          <details className="mt-6">
            <summary className="text-xs font-medium text-gray-500 cursor-pointer hover:text-gray-700">
              View Raw Data
            </summary>
            <pre className="mt-2 p-4 bg-gray-50 rounded-xl text-xs text-gray-700 overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(formData, null, 2)}
            </pre>
          </details>
        </div>
      </div>
    </div>
  );
}

interface Section {
  title: string;
  fields: { label: string; value: string }[];
}

function getSections(category: string, formData: Record<string, unknown>): Section[] {
  const fd = formData;

  switch (category) {
    case 'quote':
      return [
        {
          title: 'Customer Details',
          fields: [
            { label: 'Name', value: `${fd.firstName || ''} ${fd.lastName || ''}`.trim() || String(fd.contactName || '—') },
            { label: 'Email', value: String(fd.email || '—') },
            { label: 'Phone', value: String(fd.phone || '—') },
          ],
        },
        {
          title: 'Shipment Details',
          fields: [
            { label: 'Type', value: String(fd.shipmentType || '—') },
            { label: 'Mode', value: String(fd.modeOfTransport || '—') },
            { label: 'Pickup City', value: String(fd.pickupCity || '—') },
            { label: 'Pickup Pincode', value: String(fd.pickupPincode || '—') },
            { label: 'Delivery City', value: String(fd.deliveryCity || '—') },
            { label: 'Delivery Pincode', value: String(fd.deliveryPincode || '—') },
          ],
        },
        {
          title: 'Cargo Details',
          fields: [
            { label: 'Type of Goods', value: String(fd.typeOfGoods || '—') },
            { label: 'Weight', value: fd.weight ? `${fd.weight} kg` : '—' },
            { label: 'Package Type', value: String(fd.packageType || '—') },
            { label: 'Quantity', value: String(fd.quantity || '—') },
            { label: 'Pickup Date', value: String(fd.pickupDate || '—') },
          ],
        },
        {
          title: 'Notes',
          fields: [
            { label: 'Additional Notes', value: String(fd.notes || '—') },
          ],
        },
      ];

    case 'book-shipment':
      return [
        {
          title: 'Sender Details',
          fields: [
            { label: 'Name', value: String(fd.senderName || '—') },
            { label: 'Phone', value: String(fd.senderPhone || '—') },
            { label: 'Email', value: String(fd.senderEmail || '—') },
          ],
        },
        {
          title: 'Pickup Address',
          fields: [
            { label: 'Address Line 1', value: String(fd.pickupAddressLine1 || '—') },
            { label: 'Address Line 2', value: String(fd.pickupAddressLine2 || '—') },
            { label: 'Address Line 3', value: String(fd.pickupAddressLine3 || '—') },
            { label: 'City', value: String(fd.pickupCity || '—') },
            { label: 'Pincode', value: String(fd.pickupPincode || '—') },
            { label: 'State', value: String(fd.pickupState || '—') },
            { label: 'Country', value: String(fd.pickupCountry || '—') },
          ],
        },
        {
          title: 'Receiver Details',
          fields: [
            { label: 'Name', value: String(fd.receiverName || '—') },
            { label: 'Phone', value: String(fd.receiverPhone || '—') },
            { label: 'Email', value: String(fd.receiverEmail || '—') },
          ],
        },
        {
          title: 'Delivery Address',
          fields: [
            { label: 'Address Line 1', value: String(fd.deliveryAddressLine1 || '—') },
            { label: 'Address Line 2', value: String(fd.deliveryAddressLine2 || '—') },
            { label: 'Address Line 3', value: String(fd.deliveryAddressLine3 || '—') },
            { label: 'City', value: String(fd.deliveryCity || '—') },
            { label: 'Pincode', value: String(fd.deliveryPincode || '—') },
            { label: 'State', value: String(fd.deliveryState || '—') },
            { label: 'Country', value: String(fd.deliveryCountry || '—') },
          ],
        },
        {
          title: 'Shipment Details',
          fields: [
            { label: 'Type', value: String(fd.shipmentType || '—') },
            { label: 'Mode', value: String(fd.modeOfTransport || '—') },
            { label: 'Pickup Date', value: String(fd.pickupDate || '—') },
            { label: 'Package Type', value: String(fd.packageType || '—') },
            { label: 'Quantity', value: String(fd.quantity || '—') },
            { label: 'Weight', value: fd.weight ? `${fd.weight} kg` : '—' },
            { label: 'Declared Value', value: fd.declaredValue ? `₹${fd.declaredValue}` : '—' },
          ],
        },
        {
          title: 'Packing List',
          fields: fd.packingList ? [{ label: 'Items', value: String(fd.packingList) }] : [],
        },
        {
          title: 'Notes',
          fields: [
            { label: 'Additional Notes', value: String(fd.notes || '—') },
            { label: 'Delivery Instructions', value: String(fd.deliveryInstructions || '—') },
          ],
        },
      ];

    case 'contact':
      return [
        {
          title: 'Contact Details',
          fields: [
            { label: 'Name', value: String(fd.fullName || '—') },
            { label: 'Email', value: String(fd.email || '—') },
            { label: 'Phone', value: String(fd.phone || '—') },
            { label: 'Service', value: String(fd.service || '—') },
          ],
        },
        {
          title: 'Message',
          fields: [
            { label: 'Message', value: String(fd.message || '—') },
          ],
        },
      ];

    case 'customs':
      return [
        {
          title: 'Customer Details',
          fields: [
            { label: 'Name', value: String(fd.name || fd.contactName || '—') },
            { label: 'Email', value: String(fd.email || '—') },
            { label: 'Phone', value: String(fd.phone || '—') },
          ],
        },
        {
          title: 'Shipment Details',
          fields: [
            { label: 'Shipment Type', value: String(fd.shipmentType || '—') },
            { label: 'Mode', value: String(fd.modeOfTransport || '—') },
            { label: 'Type of Goods', value: String(fd.typeOfGoods || '—') },
          ],
        },
        {
          title: 'Message',
          fields: [
            { label: 'Message', value: String(fd.message || '—') },
          ],
        },
      ];

    case 'warehousing':
      return [
        {
          title: 'Customer Details',
          fields: [
            { label: 'Name', value: String(fd.name || fd.contactName || '—') },
            { label: 'Email', value: String(fd.email || '—') },
            { label: 'Phone', value: String(fd.phone || '—') },
          ],
        },
        {
          title: 'Requirement',
          fields: [
            { label: 'Requirement Type', value: String(fd.requirement || '—') },
            { label: 'Duration', value: String(fd.duration || '—') },
            { label: 'Space Required', value: String(fd.spaceRequired || '—') },
          ],
        },
        {
          title: 'Message',
          fields: [
            { label: 'Message', value: String(fd.message || '—') },
          ],
        },
      ];

    case 'packing-moving':
      return [
        {
          title: 'Customer Details',
          fields: [
            { label: 'Name', value: String(fd.name || fd.senderName || fd.contactName || '—') },
            { label: 'Email', value: String(fd.email || fd.senderEmail || '—') },
            { label: 'Phone', value: String(fd.phone || fd.senderPhone || '—') },
          ],
        },
        {
          title: 'Move Details',
          fields: [
            { label: 'From City', value: String(fd.pickupCity || fd.shipFrom || '—') },
            { label: 'To City', value: String(fd.deliveryCity || fd.shipTo || '—') },
            { label: 'Mode', value: String(fd.modeOfTransport || '—') },
            { label: 'Moving Date', value: String(fd.pickupDate || '—') },
          ],
        },
        {
          title: 'Items',
          fields: [
            { label: 'Type of Goods', value: String(fd.typeOfGoods || '—') },
            { label: 'Weight', value: fd.weight ? `${fd.weight} kg` : '—' },
            { label: 'Package Type', value: String(fd.packageType || '—') },
          ],
        },
        {
          title: 'Message',
          fields: [
            { label: 'Additional Notes', value: String(fd.notes || fd.message || '—') },
          ],
        },
      ];

    default:
      return [
        {
          title: 'All Fields',
          fields: Object.entries(formData).map(([key, value]) => ({
            label: key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()),
            value: String(value || '—'),
          })),
        },
      ];
  }
}
