import type { CSSProperties } from 'react';
import { Download, Loader2, X } from 'lucide-react';
import type { BookingActiveInvoice } from '../../../../../types/api';

export type DocumentSelectionKind = 'invoice' | 'receipt';

export interface DocumentSelectionModalProps {
  open: boolean;
  kind: DocumentSelectionKind;
  invoices: BookingActiveInvoice[];
  downloadingInvoiceId?: number | null;
  title: string;
  downloadLabel: string;
  typeLabelFor: (invoice: BookingActiveInvoice) => string;
  onClose: () => void;
  onDownload: (invoice: BookingActiveInvoice) => void | Promise<void>;
  glassStyle?: CSSProperties;
  textColor?: string;
  mutedColor?: string;
}

function formatAmount(amount: number): string {
  return `HK$ ${Number(amount || 0).toLocaleString('en-HK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function DocumentSelectionModal({
  open,
  kind,
  invoices,
  downloadingInvoiceId = null,
  title,
  downloadLabel,
  typeLabelFor,
  onClose,
  onDownload,
  glassStyle,
  textColor = '#1f2937',
  mutedColor = '#6b7280',
}: DocumentSelectionModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="document-selection-title"
      data-testid="document-selection-modal"
      onClick={onClose}
    >
      <div
        className="rounded-2xl p-6 max-w-lg w-full shadow-xl"
        style={glassStyle ?? { background: '#fff' }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 id="document-selection-title" className="text-lg font-semibold" style={{ color: textColor }}>
              {title}
            </h3>
            <p className="text-sm mt-1" style={{ color: mutedColor }}>
              {kind === 'receipt'
                ? 'Select a paid receipt to download.'
                : 'Select an unpaid invoice to download.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-black/5 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" style={{ color: mutedColor }} />
          </button>
        </div>

        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
          {invoices.map((invoice) => {
            const busy = downloadingInvoiceId === invoice.id;
            return (
              <div
                key={invoice.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-black/10 px-3 py-3"
                data-testid={`document-selection-row-${invoice.id}`}
              >
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate" style={{ color: textColor }}>
                    {invoice.invoice_no}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: mutedColor }}>
                    {typeLabelFor(invoice)} · {formatAmount(invoice.total_amount)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void onDownload(invoice)}
                  disabled={busy || downloadingInvoiceId != null}
                  className="shrink-0 px-3 py-2 rounded-xl text-sm flex items-center gap-2 border border-black/10 hover:bg-black/5 disabled:opacity-60"
                  data-testid={`document-selection-download-${invoice.id}`}
                >
                  {busy ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  {downloadLabel}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
