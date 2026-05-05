import React, { useState } from 'react';
import {
  Ticket,
  ChevronRight,
  X,
  Copy,
  CheckCheck,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Hash,
  FileText,
  FileSpreadsheet,
  Download,
} from 'lucide-react';
import { useTheme } from './ThemeContext';

// ── Types ──────────────────────────────────────────────────────────────────────
interface VoucherCode {
  code: string;
  status: 'available' | 'used' | 'expired';
  usedBy?: string;
  usedDate?: string;
}

interface VoucherBatch {
  id: string;
  batchName: string;
  voucherName: string;
  issuedDate: string;
  validFrom: string;
  validUntil: string;
  totalCount: number;
  usedCount: number;
  codes: VoucherCode[];
}

// ── Code generator ─────────────────────────────────────────────────────────────
const USED_NAMES = [
  'David Chan', 'Amy Wong', 'Eric Lam', 'Fiona Lee', 'Raymond Ho',
  'Grace Ng', 'Peter Yuen', 'Helen Cheung', 'Michael Tsang', 'Karen To',
  'Brian Ma', 'Cindy Kwok', 'Jason Hui', 'Lily Poon', 'Sam Chow',
  'Tina Mak', 'Victor Law', 'Wendy Yip', 'Alex Fu', 'Betty Siu',
];

const USED_DATES = [
  '2026-01-05', '2026-01-10', '2026-01-15', '2026-01-20', '2026-01-25',
  '2026-02-03', '2026-02-08', '2026-02-14', '2026-02-18', '2026-02-22',
  '2025-10-05', '2025-10-12', '2025-10-20', '2025-11-03', '2025-11-15',
  '2025-12-01', '2025-12-10', '2025-12-20', '2025-12-28', '2025-12-30',
];

function makeCodes(
  prefix: string,
  total: number,
  usedCount: number,
  defaultStatus: 'available' | 'expired',
): VoucherCode[] {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const codes: VoucherCode[] = [];
  for (let i = 0; i < total; i++) {
    let suffix = '';
    for (let j = 0; j < 5; j++) {
      suffix += chars[(i * 7 + j * 13 + 3) % chars.length];
    }
    const code = 'HKIAL-' + prefix + '-' + suffix;
    if (defaultStatus === 'expired') {
      codes.push({ code, status: 'expired' });
    } else if (i < usedCount) {
      codes.push({
        code,
        status: 'used',
        usedBy: USED_NAMES[i % USED_NAMES.length],
        usedDate: USED_DATES[i % USED_DATES.length],
      });
    } else {
      codes.push({ code, status: 'available' });
    }
  }
  return codes;
}

// ── Mock data ──────────────────────────────────────────────────────────────────
const MOCK_BATCHES: VoucherBatch[] = [
  {
    id: 'VB-20260101-001',
    batchName: 'Q1 2026 Staff Lounge Access',
    voucherName: 'Business Class Lounge Day Pass',
    issuedDate: '2026-01-01',
    validFrom: '2026-01-01',
    validUntil: '2026-06-30',
    totalCount: 120,
    usedCount: 47,
    codes: makeCodes('BCL', 120, 47, 'available'),
  },
  {
    id: 'VB-20260201-002',
    batchName: 'CNY Executive Travel Bundle',
    voucherName: 'First Class Lounge + Airport Transfer',
    issuedDate: '2026-02-01',
    validFrom: '2026-02-01',
    validUntil: '2026-12-31',
    totalCount: 80,
    usedCount: 12,
    codes: makeCodes('FCT', 80, 12, 'available'),
  },
  {
    id: 'VB-20260301-003',
    batchName: 'March Board Meeting Pack',
    voucherName: 'The Wing Premier Suite Access',
    issuedDate: '2026-03-01',
    validFrom: '2026-03-01',
    validUntil: '2026-03-31',
    totalCount: 50,
    usedCount: 0,
    codes: makeCodes('WPS', 50, 0, 'available'),
  },
  {
    id: 'VB-20251001-004',
    batchName: 'Q4 2025 Dining Credit Batch',
    voucherName: 'Lounge Dining Credit HKD 200',
    issuedDate: '2025-10-01',
    validFrom: '2025-10-01',
    validUntil: '2025-12-31',
    totalCount: 200,
    usedCount: 200,
    codes: makeCodes('DNC', 200, 200, 'expired'),
  },
  {
    id: 'VB-20251101-005',
    batchName: 'Year-End VIP Guest Passes',
    voucherName: 'Non-Flying Guest Lounge Entry',
    issuedDate: '2025-11-01',
    validFrom: '2025-11-01',
    validUntil: '2025-12-31',
    totalCount: 150,
    usedCount: 98,
    codes: makeCodes('NFG', 150, 98, 'expired'),
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────────
function getBatchStatus(batch: VoucherBatch): 'active' | 'expired' | 'exhausted' {
  const today = new Date();
  const until = new Date(batch.validUntil);
  if (today > until) return 'expired';
  if (batch.usedCount >= batch.totalCount) return 'exhausted';
  return 'active';
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// ── Pure-JS download helpers ───────────────────────────────────────────────────

function triggerDownload(content: string, fileName: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function buildPdfHtml(batch: VoucherBatch, availableCodes: VoucherCode[]): string {
  const genDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  const cards = availableCodes.map((vc) => {
    const qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=140x140&margin=6&data=' + encodeURIComponent(vc.code);
    return (
      '<div class="card">' +
        '<div class="card-inner">' +
          '<div class="qr-wrap"><img src="' + qrUrl + '" class="qr-img" alt="QR ' + vc.code + '" /></div>' +
          '<div class="code">' + vc.code + '</div>' +
          '<div class="badge">Available</div>' +
        '</div>' +
      '</div>'
    );
  }).join('');

  const css =
    '*{margin:0;padding:0;box-sizing:border-box}' +
    'body{font-family:Arial,sans-serif;color:#2d2d2d;background:#fff}' +
    '.header{background:#0a1929;color:#fff;padding:20px 28px;display:flex;align-items:center;justify-content:space-between}' +
    '.header-left .org{font-size:17px;color:rgb(220,181,21);letter-spacing:0.5px}' +
    '.header-left .sub{font-size:10px;opacity:0.65;margin-top:3px}' +
    '.header-right{text-align:right;font-size:10px;opacity:0.6}' +
    '.stripe{background:linear-gradient(90deg,rgb(220,181,21),rgb(180,141,11));height:3px}' +
    '.meta{padding:18px 28px 0}' +
    '.batch-title{font-size:18px;color:#0a1929;margin-bottom:6px}' +
    '.meta-row{font-size:11px;color:#666;margin-bottom:3px}' +
    '.summary{display:flex;gap:12px;padding:14px 28px}' +
    '.sum-box{flex:1;background:#f5f5f2;border-radius:8px;padding:10px 14px;border-left:3px solid #dbb515}' +
    '.sum-box.avail{background:rgba(5,150,105,0.07);border-left-color:#059669}' +
    '.sum-label{font-size:9px;color:#999;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:3px}' +
    '.sum-val{font-size:18px;color:#0a1929}' +
    '.sum-box.avail .sum-val{color:#059669}' +
    '.section-title{font-size:11px;color:#888;padding:0 28px 10px;text-transform:uppercase;letter-spacing:0.6px}' +
    '.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;padding:0 28px 28px}' +
    '.card{break-inside:avoid;page-break-inside:avoid}' +
    '.card-inner{border:1px solid #e0dfd8;border-radius:10px;overflow:hidden;text-align:center;background:#fff;' +
      'box-shadow:0 1px 4px rgba(0,0,0,0.06)}' +
    '.qr-wrap{background:#f9f8f5;padding:14px 14px 10px;border-bottom:1px solid #eeedea}' +
    '.qr-img{width:120px;height:120px;display:block;margin:0 auto}' +
    '.code{font-family:"Courier New",monospace;font-size:10px;color:#0a1929;letter-spacing:1px;' +
      'padding:9px 8px 5px;word-break:break-all;line-height:1.5}' +
    '.badge{display:inline-block;background:rgba(5,150,105,0.1);color:#059669;' +
      'border:1px solid rgba(5,150,105,0.25);border-radius:20px;' +
      'font-size:9px;padding:2px 10px;margin-bottom:10px;letter-spacing:0.3px}' +
    '.footer{text-align:center;padding:14px 28px;font-size:9px;color:#bbb;border-top:1px solid #eeedea}' +
    '@media print{' +
      'body{-webkit-print-color-adjust:exact;print-color-adjust:exact}' +
      '.grid{gap:10px}' +
      '.no-print{display:none}' +
    '}';

  return (
    '<!DOCTYPE html><html><head><meta charset="utf-8"/>' +
    '<title>' + batch.batchName + ' — Available Vouchers</title>' +
    '<style>' + css + '</style></head><body>' +

    '<div class="header">' +
      '<div class="header-left">' +
        '<div class="org">HKIA Lounge</div>' +
        '<div class="sub">Hong Kong International Airport &nbsp;·&nbsp; Corporate Voucher Report</div>' +
      '</div>' +
      '<div class="header-right">Generated ' + genDate + '</div>' +
    '</div>' +
    '<div class="stripe"></div>' +

    '<div class="meta">' +
      '<div class="batch-title">' + batch.batchName + '</div>' +
      '<div class="meta-row">Voucher Type: ' + batch.voucherName + '</div>' +
      '<div class="meta-row">Batch ID: ' + batch.id + '</div>' +
      '<div class="meta-row">Validity: ' + formatDate(batch.validFrom) + ' — ' + formatDate(batch.validUntil) + '</div>' +
    '</div>' +

    '<div class="summary">' +
      '<div class="sum-box"><div class="sum-label">Total Qty</div><div class="sum-val">' + batch.totalCount + '</div></div>' +
      '<div class="sum-box"><div class="sum-label">Used</div><div class="sum-val">' + batch.usedCount + '</div></div>' +
      '<div class="sum-box avail"><div class="sum-label">Available (this export)</div><div class="sum-val">' + availableCodes.length + '</div></div>' +
    '</div>' +

    '<div class="section-title">Available Voucher Codes &nbsp;(' + availableCodes.length + ')</div>' +
    '<div class="grid">' + cards + '</div>' +

    '<div class="footer">HKIA Lounge Membership Portal &nbsp;·&nbsp; Confidential — authorised distribution only</div>' +

    '<script>window.onload=function(){window.print();}<\/script>' +
    '</body></html>'
  );
}

function buildXlsXml(batch: VoucherBatch, availableCodes: VoucherCode[]): string {
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const cell = (val: string, type: string) =>
    '<Cell><Data ss:Type="' + type + '">' + esc(val) + '</Data></Cell>';

  const availRows = availableCodes.map((vc, i) =>
    '<Row>' + cell(String(i + 1), 'Number') + cell(vc.code, 'String') + cell('Available', 'String') + '</Row>'
  ).join('');

  const allRows = batch.codes.map((vc, i) =>
    '<Row>' +
    cell(String(i + 1), 'Number') +
    cell(vc.code, 'String') +
    cell(vc.status.charAt(0).toUpperCase() + vc.status.slice(1), 'String') +
    cell(vc.usedBy || '', 'String') +
    cell(vc.usedDate ? formatDate(vc.usedDate) : '', 'String') +
    '</Row>'
  ).join('');

  const hdr = '<?xml version="1.0" encoding="UTF-8"?>' +
    '<?mso-application progid="Excel.Sheet"?>' +
    '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" ' +
    'xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">';

  const sheet1 =
    '<Worksheet ss:Name="Available Codes"><Table>' +
    '<Row><Cell ss:MergeAcross="2"><Data ss:Type="String">HKIA Lounge — Available Voucher Codes</Data></Cell></Row>' +
    '<Row><Cell ss:MergeAcross="2"><Data ss:Type="String">Batch: ' + esc(batch.batchName) + '</Data></Cell></Row>' +
    '<Row><Cell ss:MergeAcross="2"><Data ss:Type="String">Voucher: ' + esc(batch.voucherName) + ' | ID: ' + batch.id + '</Data></Cell></Row>' +
    '<Row><Cell ss:MergeAcross="2"><Data ss:Type="String">Validity: ' + formatDate(batch.validFrom) + ' — ' + formatDate(batch.validUntil) + ' | Total: ' + batch.totalCount + ' | Used: ' + batch.usedCount + ' | Available: ' + availableCodes.length + '</Data></Cell></Row>' +
    '<Row></Row>' +
    '<Row>' + cell('#', 'String') + cell('Voucher Code', 'String') + cell('Status', 'String') + '</Row>' +
    availRows +
    '</Table></Worksheet>';

  const sheet2 =
    '<Worksheet ss:Name="Full Summary"><Table>' +
    '<Row><Cell ss:MergeAcross="4"><Data ss:Type="String">HKIA Lounge — Full Voucher Code Summary</Data></Cell></Row>' +
    '<Row><Cell ss:MergeAcross="4"><Data ss:Type="String">Batch: ' + esc(batch.batchName) + '</Data></Cell></Row>' +
    '<Row><Cell ss:MergeAcross="4"><Data ss:Type="String">Voucher: ' + esc(batch.voucherName) + ' | ID: ' + batch.id + '</Data></Cell></Row>' +
    '<Row><Cell ss:MergeAcross="4"><Data ss:Type="String">Validity: ' + formatDate(batch.validFrom) + ' — ' + formatDate(batch.validUntil) + '</Data></Cell></Row>' +
    '<Row></Row>' +
    '<Row>' + cell('#', 'String') + cell('Voucher Code', 'String') + cell('Status', 'String') + cell('Used By', 'String') + cell('Used Date', 'String') + '</Row>' +
    allRows +
    '</Table></Worksheet>';

  return hdr + sheet1 + sheet2 + '</Workbook>';
}

// ── CopyButton ─────────────────────────────────────────────────────────────────
interface CopyButtonProps { text: string; isDark: boolean; }
function CopyButton({ text, isDark }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const btnBg = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(64,63,52,0.1)';
  const iconColor = isDark ? '#9ca3af' : 'rgb(130,129,118)';

  return (
    <button
      type="button"
      onClick={handleCopy}
      title="Copy code"
      className="p-1.5 rounded-lg transition-all hover:opacity-80"
      style={{ background: btnBg }}
    >
      {copied
        ? <CheckCheck className="w-3.5 h-3.5" style={{ color: 'rgb(52,211,153)' }} />
        : <Copy className="w-3.5 h-3.5" style={{ color: iconColor }} />}
    </button>
  );
}

// ── Voucher Codes Modal ────────────────────────────────────────────────────────
interface CodesModalProps { batch: VoucherBatch; onClose: () => void; }

function CodesModal({ batch, onClose }: CodesModalProps) {
  const { colors, mode } = useTheme();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'available' | 'used' | 'expired'>('all');
  const [page, setPage] = useState(0);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [xlsLoading, setXlsLoading] = useState(false);
  const PAGE_SIZE = 20;

  const isDark = mode === 'dark';

  const overlayBg     = isDark ? 'rgba(0,0,0,0.75)'                        : 'rgba(64,63,52,0.5)';
  const modalBg       = isDark ? '#0a1929'                                  : '#ffffff';
  const modalBorder   = isDark ? '1px solid rgba(255,255,255,0.15)'         : '1px solid rgba(200,199,190,0.6)';
  const hdrBorder     = isDark ? '1px solid rgba(255,255,255,0.1)'          : '1px solid rgba(200,199,190,0.5)';
  const inputBg       = isDark ? 'rgba(255,255,255,0.07)'                   : 'rgba(231,230,221,0.6)';
  const inputBorder   = isDark ? '1px solid rgba(255,255,255,0.15)'         : '1px solid rgba(200,199,190,0.55)';
  const rowBg         = isDark ? 'rgba(255,255,255,0.05)'                   : 'rgba(231,230,221,0.4)';
  const rowBorder     = isDark ? '1px solid rgba(255,255,255,0.08)'         : '1px solid rgba(200,199,190,0.4)';
  const codeFontColor = isDark ? 'rgb(220,181,21)'                          : 'rgb(140,108,0)';
  const closeBtnBg    = isDark ? 'rgba(255,255,255,0.1)'                    : 'rgba(64,63,52,0.08)';
  const paginBg       = isDark ? 'rgba(255,255,255,0.08)'                   : 'rgba(64,63,52,0.08)';
  const dividerBg     = isDark ? 'rgba(255,255,255,0.1)'                    : 'rgba(200,199,190,0.5)';
  const sumBarBg      = isDark ? 'rgba(0,0,0,0.15)'                         : 'rgba(231,230,221,0.3)';
  const xlsBtnBg      = isDark ? 'rgba(52,211,153,0.18)'                    : 'rgba(5,150,105,0.12)';
  const xlsBtnBorder  = isDark ? '1px solid rgba(52,211,153,0.4)'           : '1px solid rgba(5,150,105,0.35)';
  const xlsBtnColor   = isDark ? 'rgb(52,211,153)'                          : 'rgb(5,120,85)';
  const availHintColor = isDark ? 'rgb(52,211,153)'                         : 'rgb(5,150,105)';

  const availableCount = batch.codes.filter(c => c.status === 'available').length;
  const usedCount      = batch.codes.filter(c => c.status === 'used').length;
  const expiredCount   = batch.codes.filter(c => c.status === 'expired').length;
  const availableCodes = batch.codes.filter(c => c.status === 'available');

  // ── Download PDF (pure JS — opens print dialog) ──────────────────────────
  const handleDownloadPdf = () => {
    setPdfLoading(true);
    const html = buildPdfHtml(batch, availableCodes);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    if (win) {
      win.addEventListener('afterprint', () => URL.revokeObjectURL(url));
    } else {
      URL.revokeObjectURL(url);
    }
    setPdfLoading(false);
  };

  // ── Download Excel (pure JS — XML Spreadsheet format) ────────────────────
  const handleDownloadExcel = () => {
    setXlsLoading(true);
    const xml = buildXlsXml(batch, availableCodes);
    triggerDownload(xml, batch.id + '_vouchers.xls', 'application/vnd.ms-excel;charset=utf-8');
    setXlsLoading(false);
  };

  const filtered = batch.codes.filter(c => {
    const matchSearch =
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      (c.usedBy ? c.usedBy.toLowerCase().includes(search.toLowerCase()) : false);
    const matchFilter = filter === 'all' || c.status === filter;
    return matchSearch && matchFilter;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageSlice  = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(0);
  };

  const handleFilterChange = (key: typeof filter) => {
    setFilter(key);
    setPage(0);
  };

  const handlePrev = () => setPage(p => Math.max(0, p - 1));
  const handleNext = () => setPage(p => Math.min(totalPages - 1, p + 1));

  const filterLabels: Array<{ key: typeof filter; label: string; count: number }> = [
    { key: 'all',       label: 'All',       count: batch.codes.length },
    { key: 'available', label: 'Available', count: availableCount },
    { key: 'used',      label: 'Used',      count: usedCount },
    { key: 'expired',   label: 'Expired',   count: expiredCount },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: overlayBg }}
      onClick={handleBackdropClick}
    >
      <div
        className="w-full max-w-2xl rounded-2xl flex flex-col"
        style={{ background: modalBg, border: modalBorder, boxShadow: '0 24px 80px rgba(0,0,0,0.4)', maxHeight: '88vh' }}
      >
        {/* Header */}
        <div className="px-6 py-5 flex items-start justify-between" style={{ borderBottom: hdrBorder }}>
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-2 mb-1">
              <Ticket className="w-5 h-5 flex-shrink-0" style={{ color: 'rgb(220,181,21)' }} />
              <h2 className="text-lg truncate" style={{ color: colors.text }}>{batch.batchName}</h2>
            </div>
            <p className="text-sm" style={{ color: colors.textMuted }}>{batch.voucherName}</p>
            <p className="text-xs mt-1" style={{ color: colors.textMuted }}>
              Valid: {formatDate(batch.validFrom)} — {formatDate(batch.validUntil)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl transition-all hover:opacity-70 flex-shrink-0"
            style={{ background: closeBtnBg }}
          >
            <X className="w-5 h-5" style={{ color: colors.textMuted }} />
          </button>
        </div>

        {/* Quantity summary bar */}
        <div
          className="px-6 py-3 flex items-center gap-6 flex-wrap"
          style={{ borderBottom: hdrBorder, background: sumBarBg }}
        >
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4" style={{ color: 'rgb(220,181,21)' }} />
            <span className="text-xs" style={{ color: colors.textMuted }}>Total</span>
            <span className="text-sm" style={{ color: colors.text }}>{batch.totalCount}</span>
          </div>
          <div className="w-px h-4" style={{ background: dividerBg }} />
          <div className="flex items-center gap-2">
            <CheckCheck className="w-4 h-4" style={{ color: isDark ? 'rgb(165,180,252)' : 'rgb(79,70,229)' }} />
            <span className="text-xs" style={{ color: colors.textMuted }}>Used</span>
            <span className="text-sm" style={{ color: colors.text }}>{batch.usedCount}</span>
          </div>
          <div className="w-px h-4" style={{ background: dividerBg }} />
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" style={{ color: isDark ? 'rgb(52,211,153)' : 'rgb(5,150,105)' }} />
            <span className="text-xs" style={{ color: colors.textMuted }}>Available</span>
            <span className="text-sm" style={{ color: colors.text }}>{availableCount}</span>
          </div>
          {expiredCount > 0 && (
            <>
              <div className="w-px h-4" style={{ background: dividerBg }} />
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" style={{ color: colors.textMuted }} />
                <span className="text-xs" style={{ color: colors.textMuted }}>Expired</span>
                <span className="text-sm" style={{ color: colors.textMuted }}>{expiredCount}</span>
              </div>
            </>
          )}
        </div>

        {/* Search + filter */}
        <div className="px-6 py-3 flex gap-3 flex-wrap items-center" style={{ borderBottom: hdrBorder }}>
          <div className="relative flex-1 min-w-[160px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: colors.textMuted }} />
            <input
              type="text"
              placeholder="Search by code or recipient…"
              value={search}
              onChange={handleSearchChange}
              className="w-full pl-9 pr-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: inputBg, border: inputBorder, color: colors.text }}
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {filterLabels.map(({ key, label, count }) => {
              const isActive  = filter === key;
              const btnBg     = isActive ? 'linear-gradient(90deg, rgb(220,181,21), rgb(180,141,11))' : (isDark ? 'rgba(255,255,255,0.07)' : 'rgba(231,230,221,0.6)');
              const btnBorder = isActive ? 'transparent' : (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(200,199,190,0.5)');
              const btnColor  = isActive ? '#ffffff' : colors.textMuted;
              const handleClick = () => handleFilterChange(key);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={handleClick}
                  className="px-3 py-1.5 rounded-lg text-xs transition-all"
                  style={{ background: btnBg, border: '1px solid ' + btnBorder, color: btnColor }}
                >
                  {label} <span className="opacity-70">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Code list */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
          {filtered.length === 0 && (
            <div className="text-center py-10" style={{ color: colors.textMuted }}>
              No voucher codes match your search.
            </div>
          )}
          {pageSlice.map((vc) => {
            const isAvailable = vc.status === 'available';
            const isUsed      = vc.status === 'used';

            const statusBg     = isAvailable ? 'rgba(52,211,153,0.1)'             : isUsed ? 'rgba(99,102,241,0.1)'             : 'rgba(156,163,175,0.08)';
            const statusBorder = isAvailable ? '1px solid rgba(52,211,153,0.25)'  : isUsed ? '1px solid rgba(99,102,241,0.25)'  : '1px solid rgba(156,163,175,0.2)';
            const statusColor  = isAvailable ? (isDark ? 'rgb(52,211,153)' : 'rgb(5,150,105)') : isUsed ? (isDark ? 'rgb(165,180,252)' : 'rgb(79,70,229)') : colors.textMuted;
            const statusLabel  = isAvailable ? 'Available' : isUsed ? 'Used' : 'Expired';
            const StatusIcon   = isAvailable ? CheckCircle : isUsed ? CheckCheck : Clock;

            return (
              <div key={vc.code} className="rounded-xl px-4 py-3" style={{ background: rowBg, border: rowBorder }}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span
                      className="font-mono text-sm tracking-wider flex-1 truncate"
                      style={{ color: isAvailable ? codeFontColor : colors.textMuted }}
                    >
                      {vc.code}
                    </span>
                    {isAvailable && <CopyButton text={vc.code} isDark={isDark} />}
                  </div>
                  <div
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs flex-shrink-0"
                    style={{ background: statusBg, border: statusBorder, color: statusColor }}
                  >
                    <StatusIcon className="w-3 h-3" />
                    {statusLabel}
                  </div>
                </div>
                {vc.usedBy && (
                  <p className="text-xs mt-1.5" style={{ color: colors.textMuted }}>
                    Used by <span style={{ color: colors.textSecondary }}>{vc.usedBy}</span>
                    {vc.usedDate && <> · {formatDate(vc.usedDate)}</>}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-3 flex items-center justify-between" style={{ borderTop: hdrBorder }}>
            <span className="text-xs" style={{ color: colors.textMuted }}>
              Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handlePrev}
                disabled={page === 0}
                className="px-3 py-1.5 rounded-lg text-xs transition-all disabled:opacity-30"
                style={{ background: paginBg, color: colors.textSecondary }}
              >
                Previous
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={page >= totalPages - 1}
                className="px-3 py-1.5 rounded-lg text-xs transition-all disabled:opacity-30"
                style={{ background: paginBg, color: colors.textSecondary }}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Footer — Download + Close */}
        <div className="px-6 py-4 space-y-3" style={{ borderTop: hdrBorder }}>
          {/* Download buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={pdfLoading || availableCodes.length === 0}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm transition-all hover:opacity-90 disabled:opacity-40"
              style={{
                background: 'linear-gradient(135deg, rgb(220,181,21) 0%, rgb(180,141,11) 100%)',
                color: '#ffffff',
              }}
            >
              {pdfLoading
                ? <Download className="w-4 h-4 animate-bounce" />
                : <FileText className="w-4 h-4" />}
              {pdfLoading ? 'Opening…' : 'Download PDF (' + availableCodes.length + ')'}
            </button>

            <button
              type="button"
              onClick={handleDownloadExcel}
              disabled={xlsLoading || availableCodes.length === 0}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm transition-all hover:opacity-90 disabled:opacity-40"
              style={{
                background: xlsBtnBg,
                border: xlsBtnBorder,
                color: xlsBtnColor,
              }}
            >
              {xlsLoading
                ? <Download className="w-4 h-4 animate-bounce" />
                : <FileSpreadsheet className="w-4 h-4" />}
              {xlsLoading ? 'Generating…' : 'Download Excel (' + availableCodes.length + ')'}
            </button>
          </div>

          {availableCodes.length === 0 && (
            <p className="text-xs text-center" style={{ color: colors.textMuted }}>
              No available codes to download for this batch.
            </p>
          )}

          <p className="text-xs text-center" style={{ color: colors.textMuted }}>
            Downloads always include all{' '}
            <span style={{ color: availHintColor }}>{availableCodes.length} available</span>{' '}
            codes regardless of the current filter. Excel also includes a full summary sheet.
          </p>

          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-sm transition-all hover:opacity-80"
            style={{
              background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(64,63,52,0.08)',
              border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(200,199,190,0.5)',
              color: colors.textSecondary,
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export function VoucherBatches() {
  const { colors, mode, glassStyle } = useTheme();
  const [selectedBatch, setSelectedBatch] = useState<VoucherBatch | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expired'>('all');
  const [search, setSearch] = useState('');

  const isDark = mode === 'dark';

  const cardBg          = isDark ? 'rgba(255,255,255,0.05)'            : 'rgba(231,230,221,0.4)';
  const cardBorder      = isDark ? '1px solid rgba(255,255,255,0.1)'   : '1px solid rgba(200,199,190,0.5)';
  const cardHoverBorder = isDark ? '1px solid rgba(220,181,21,0.4)'    : '1px solid rgba(220,181,21,0.45)';
  const handleCardEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.border = cardHoverBorder;
  };
  const handleCardLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.border = cardBorder;
  };
  const inputBg         = isDark ? 'rgba(255,255,255,0.07)'            : 'rgba(231,230,221,0.6)';
  const inputBorder     = isDark ? '1px solid rgba(255,255,255,0.15)'  : '1px solid rgba(200,199,190,0.55)';
  const dividerBg       = isDark ? 'rgba(255,255,255,0.08)'            : 'rgba(200,199,190,0.4)';
  const metaColor       = colors.textMuted;
  const accentColor     = isDark ? 'rgb(220,181,21)'                   : 'rgb(140,108,0)';
  const infoBoxBg       = isDark ? 'rgba(0,0,0,0.2)'                   : 'rgba(255,255,255,0.6)';

  const allStatuses: Array<{ key: typeof filterStatus; label: string }> = [
    { key: 'all',     label: 'All Batches' },
    { key: 'active',  label: 'Active' },
    { key: 'expired', label: 'Expired / Exhausted' },
  ];

  const displayed = MOCK_BATCHES.filter((b) => {
    const status = getBatchStatus(b);
    const matchStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && status === 'active') ||
      (filterStatus === 'expired' && (status === 'expired' || status === 'exhausted'));
    const matchSearch =
      b.batchName.toLowerCase().includes(search.toLowerCase()) ||
      b.voucherName.toLowerCase().includes(search.toLowerCase()) ||
      b.id.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const totalActive    = MOCK_BATCHES.filter(b => getBatchStatus(b) === 'active').length;
  const totalVouchers  = MOCK_BATCHES.reduce((sum, b) => sum + b.totalCount, 0);
  const totalUsed      = MOCK_BATCHES.reduce((sum, b) => sum + b.usedCount, 0);
  const totalAvailable = MOCK_BATCHES.reduce(
    (sum, b) => sum + b.codes.filter(c => c.status === 'available').length, 0
  );

  const handleOpenModal  = (batch: VoucherBatch) => setSelectedBatch(batch);
  const handleCloseModal = () => setSelectedBatch(null);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,141,11)] bg-clip-text text-transparent mb-1">
          Voucher Batches
        </h1>
        <p className="text-sm" style={{ color: colors.textMuted }}>
          Manage and distribute your corporate lounge voucher batches
        </p>
      </div>

      {/* Summary stats — 4 tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Batches', value: String(totalActive),            icon: Package,     iconBg: 'rgba(52,211,153,0.15)',  iconColor: isDark ? 'rgb(52,211,153)' : 'rgb(5,150,105)' },
          { label: 'Total Vouchers', value: totalVouchers.toLocaleString(), icon: Hash,        iconBg: 'rgba(220,181,21,0.12)',  iconColor: 'rgb(220,181,21)' },
          { label: 'Used',           value: totalUsed.toLocaleString(),     icon: CheckCheck,  iconBg: 'rgba(99,102,241,0.12)', iconColor: isDark ? 'rgb(165,180,252)' : 'rgb(79,70,229)' },
          { label: 'Available',      value: totalAvailable.toLocaleString(),icon: CheckCircle, iconBg: 'rgba(52,211,153,0.12)', iconColor: isDark ? 'rgb(52,211,153)' : 'rgb(5,150,105)' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-2xl p-5" style={glassStyle}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: stat.iconBg }}>
                  <Icon className="w-5 h-5" style={{ color: stat.iconColor }} />
                </div>
                <div>
                  <p className="text-xl" style={{ color: colors.text }}>{stat.value}</p>
                  <p className="text-xs" style={{ color: colors.textMuted }}>{stat.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: colors.textMuted }} />
          <input
            type="text"
            placeholder="Search by batch name, voucher, or ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all"
            style={{ background: inputBg, border: inputBorder, color: colors.text }}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {allStatuses.map(({ key, label }) => {
            const isActive  = filterStatus === key;
            const btnBg     = isActive ? 'linear-gradient(90deg, rgb(220,181,21), rgb(180,141,11))' : inputBg;
            const btnBorder = isActive ? 'transparent' : (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(200,199,190,0.5)');
            const btnColor  = isActive ? '#ffffff' : colors.textMuted;
            const handleClick = () => setFilterStatus(key);
            return (
              <button
                key={key}
                type="button"
                onClick={handleClick}
                className="px-4 py-2.5 rounded-xl text-sm transition-all"
                style={{ background: btnBg, border: '1px solid ' + btnBorder, color: btnColor }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Empty state */}
      {displayed.length === 0 && (
        <div className="rounded-2xl p-12 text-center" style={glassStyle}>
          <Ticket className="w-12 h-12 mx-auto mb-4 opacity-30" style={{ color: colors.textMuted }} />
          <p className="text-sm" style={{ color: colors.textMuted }}>No voucher batches match your criteria.</p>
        </div>
      )}

      {/* Batch cards */}
      <div className="space-y-4">
        {displayed.map((batch) => {
          const status       = getBatchStatus(batch);
          const available    = batch.codes.filter(c => c.status === 'available').length;
          const usagePercent = Math.round((batch.usedCount / batch.totalCount) * 100);

          const isStatusActive  = status === 'active';
          const isStatusExpired = status === 'expired';

          const badgeBg     = isStatusActive ? 'rgba(52,211,153,0.12)'          : isStatusExpired ? 'rgba(239,68,68,0.1)'           : 'rgba(156,163,175,0.1)';
          const badgeBorder = isStatusActive ? '1px solid rgba(52,211,153,0.3)' : isStatusExpired ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(156,163,175,0.25)';
          const badgeColor  = isStatusActive ? (isDark ? 'rgb(52,211,153)' : 'rgb(5,150,105)') : isStatusExpired ? (isDark ? 'rgb(248,113,113)' : 'rgb(185,28,28)') : metaColor;
          const statusLabel = isStatusActive ? 'Active' : isStatusExpired ? 'Expired' : 'Exhausted';
          const StatusBadgeIcon = isStatusActive ? CheckCircle : isStatusExpired ? XCircle : CheckCheck;

          const progressColor = isStatusActive ? 'rgb(220,181,21)' : 'rgb(156,163,175)';
          const progressBg    = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(200,199,190,0.4)';

          const totalTileBg  = 'rgba(220,181,21,0.1)';
          const usedTileBg   = isDark ? 'rgba(99,102,241,0.1)'  : 'rgba(99,102,241,0.08)';
          const availTileBg  = isDark ? 'rgba(52,211,153,0.1)'  : 'rgba(52,211,153,0.08)';
          const totalTileClr = isDark ? 'rgb(220,181,21)'        : 'rgb(140,108,0)';
          const usedTileClr  = isDark ? 'rgb(165,180,252)'       : 'rgb(79,70,229)';
          const availTileClr = isDark ? 'rgb(52,211,153)'        : 'rgb(5,150,105)';

          const stripeStyle = isStatusActive
            ? 'linear-gradient(90deg, rgb(220,181,21), rgb(180,141,11))'
            : 'rgba(156,163,175,0.3)';

          return (
            <div
              key={batch.id}
              className="rounded-2xl overflow-hidden transition-all duration-200"
              style={{ background: cardBg, border: cardBorder }}
              onMouseEnter={handleCardEnter}
              onMouseLeave={handleCardLeave}
            >
              <div className="h-1 w-full" style={{ background: stripeStyle }} />

              <div className="p-5">
                {/* Title row */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-base" style={{ color: colors.text }}>{batch.batchName}</h3>
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs flex-shrink-0"
                        style={{ background: badgeBg, border: badgeBorder, color: badgeColor }}
                      >
                        <StatusBadgeIcon className="w-3 h-3" />
                        {statusLabel}
                      </span>
                    </div>
                    <p className="text-sm mb-1" style={{ color: accentColor }}>{batch.voucherName}</p>
                    <p className="text-xs font-mono" style={{ color: metaColor }}>{batch.id}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenModal(batch)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all hover:opacity-80 flex-shrink-0 self-start"
                    style={{
                      background: 'linear-gradient(135deg, rgba(220,181,21,0.2), rgba(180,141,11,0.15))',
                      border: '1px solid rgba(220,181,21,0.4)',
                      color: isDark ? 'rgb(220,181,21)' : 'rgb(140,108,0)',
                    }}
                  >
                    <Ticket className="w-4 h-4" />
                    View Codes
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Quantity tiles */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[
                    { label: 'Total Qty', value: batch.totalCount, bg: totalTileBg, color: totalTileClr, icon: Hash },
                    { label: 'Used',      value: batch.usedCount,  bg: usedTileBg,  color: usedTileClr,  icon: CheckCheck },
                    { label: 'Available', value: available,         bg: availTileBg, color: availTileClr, icon: CheckCircle },
                  ].map((tile) => {
                    const TileIcon = tile.icon;
                    return (
                      <div key={tile.label} className="rounded-xl px-3 py-2.5 flex items-center gap-2" style={{ background: tile.bg }}>
                        <TileIcon className="w-4 h-4 flex-shrink-0" style={{ color: tile.color }} />
                        <div className="min-w-0">
                          <p className="text-xs" style={{ color: metaColor }}>{tile.label}</p>
                          <p className="text-base" style={{ color: tile.color }}>{tile.value.toLocaleString()}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Validity info */}
                <div
                  className="rounded-xl p-3 mb-4 grid grid-cols-2 sm:grid-cols-3 gap-3"
                  style={{ background: infoBoxBg, border: '1px solid ' + dividerBg }}
                >
                  <div>
                    <p className="text-xs mb-0.5" style={{ color: metaColor }}>Valid From</p>
                    <p className="text-sm" style={{ color: colors.textSecondary }}>{formatDate(batch.validFrom)}</p>
                  </div>
                  <div>
                    <p className="text-xs mb-0.5" style={{ color: metaColor }}>Valid Until</p>
                    <p className="text-sm" style={{ color: colors.textSecondary }}>{formatDate(batch.validUntil)}</p>
                  </div>
                  <div>
                    <p className="text-xs mb-0.5" style={{ color: metaColor }}>Issued Date</p>
                    <p className="text-sm" style={{ color: colors.textSecondary }}>{formatDate(batch.issuedDate)}</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs" style={{ color: metaColor }}>
                      Redemption rate — {batch.usedCount.toLocaleString()} of {batch.totalCount.toLocaleString()} redeemed
                    </span>
                    <span className="text-xs" style={{ color: isStatusActive ? accentColor : metaColor }}>
                      {usagePercent}%
                    </span>
                  </div>
                  <div className="rounded-full h-2 overflow-hidden" style={{ background: progressBg }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: usagePercent + '%', background: progressColor }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedBatch && (
        <CodesModal batch={selectedBatch} onClose={handleCloseModal} />
      )}
    </div>
  );
}