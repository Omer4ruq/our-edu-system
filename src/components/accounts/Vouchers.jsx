import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from "react-dom";

import { 
  Calendar, 
  Download, 
  FileText, 
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Receipt,
  CreditCard,
  ArrowLeftRight,
  BookOpen,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Settings,
  Search,
  Eye,
  EyeOff,
  Filter
} from 'lucide-react';

// Import your actual hooks
import { useGetVouchersQuery } from '../../redux/features/api/accounts/financialReports/financialReportsApi';
import { useGetInstituteLatestQuery } from '../../redux/features/api/institute/instituteLatestApi';

// Sleek Aesthetic Calendar Component
// --- Replace the entire ProfessionalDatePicker with this version ---
const ProfessionalDatePicker = ({ value, onChange, label, required = false, placeholder = "Select date" }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [currentMonth, setCurrentMonth] = React.useState(value ? new Date(value) : new Date());
  const [selectedDate, setSelectedDate] = React.useState(value ? new Date(value) : null);
  const [panelStyle, setPanelStyle] = React.useState({ top: 0, left: 0, width: 320 });
  const btnRef = React.useRef(null);

  React.useEffect(() => {
    if (value) {
      const d = new Date(value);
      setSelectedDate(d);
      setCurrentMonth(d);
    }
  }, [value]);

  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const computeDays = (date) => {
    const y = date.getFullYear();
    const m = date.getMonth();
    const first = new Date(y, m, 1);
    const last = new Date(y, m + 1, 0);
    const startDow = first.getDay();
    const total = last.getDate();
    const days = [];
    for (let i = startDow - 1; i >= 0; i--) days.push({ date: new Date(y, m, -i), isCurrentMonth: false });
    for (let d = 1; d <= total; d++) days.push({ date: new Date(y, m, d), isCurrentMonth: true });
    const remain = 42 - days.length;
    for (let d = 1; d <= remain; d++) days.push({ date: new Date(y, m + 1, d), isCurrentMonth: false });
    return days;
  };

  const openPanel = () => {
    setIsOpen((prev) => {
      const next = !prev;
      if (!prev && btnRef.current) {
        const rect = btnRef.current.getBoundingClientRect();
        const width = 320;
        const margin = 8;
        const top = rect.bottom + margin;
        let left = rect.left;
        // keep within viewport
        if (left + width > window.innerWidth - 8) left = window.innerWidth - width - 8;
        if (left < 8) left = 8;
        setPanelStyle({ top, left, width });
      }
      return next;
    });
  };

  // Close on outside click / Esc / reposition on resize/scroll
  React.useEffect(() => {
    if (!isOpen) return;
    const onClick = (e) => {
      if (btnRef.current && (btnRef.current.contains(e.target))) return;
      // Close if clicking outside the floating panel
      const panel = document.getElementById('pro-datepicker-panel');
      if (panel && panel.contains(e.target)) return;
      setIsOpen(false);
    };
    const onEsc = (e) => e.key === 'Escape' && setIsOpen(false);
    const onReflow = () => {
      if (!btnRef.current) return;
      const rect = btnRef.current.getBoundingClientRect();
      const width = 320;
      const margin = 8;
      const top = rect.bottom + margin;
      let left = rect.left;
      if (left + width > window.innerWidth - 8) left = window.innerWidth - width - 8;
      if (left < 8) left = 8;
      setPanelStyle({ top, left, width });
    };
    window.addEventListener('mousedown', onClick);
    window.addEventListener('keydown', onEsc);
    window.addEventListener('resize', onReflow);
    window.addEventListener('scroll', onReflow, true);
    return () => {
      window.removeEventListener('mousedown', onClick);
      window.removeEventListener('keydown', onEsc);
      window.removeEventListener('resize', onReflow);
      window.removeEventListener('scroll', onReflow, true);
    };
  }, [isOpen]);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    onChange(date.toISOString().split('T')[0]);
    setIsOpen(false);
  };

  const navigateMonth = (delta) => {
    setCurrentMonth((prev) => {
      const nm = new Date(prev);
      nm.setMonth(prev.getMonth() + delta);
      return nm;
    });
  };

  const isToday = (d) => d.toDateString() === new Date().toDateString();
  const isSelected = (d) => selectedDate && d.toDateString() === selectedDate.toDateString();
  const displayDate = (d) => d?.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) || '';

  const panel = (
    <div
      id="pro-datepicker-panel"
      style={{ position: 'fixed', top: panelStyle.top, left: panelStyle.left, width: panelStyle.width, zIndex: 9999 }}
      className={`rounded-2xl shadow-2xl border border-gray-100 overflow-hidden 
                  bg-white transition-all duration-200`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-3 flex items-center justify-between">
        <button onClick={() => navigateMonth(-1)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-base font-semibold">{months[currentMonth.getMonth()]}</span>
          <span className="text-base font-semibold">{currentMonth.getFullYear()}</span>
        </div>
        <button onClick={() => navigateMonth(1)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Grid */}
      <div className="p-4">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {daysOfWeek.map((d) => (
            <div key={d} className="text-center text-[11px] font-bold text-gray-400 py-1">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {computeDays(currentMonth).map((item, idx) => {
            const d = item.date;
            const current = item.isCurrentMonth;
            const today = isToday(d);
            const selected = isSelected(d);
            return (
              <button
                key={idx}
                onClick={() => handleDateSelect(d)}
                className={[
                  'relative h-10 w-10 text-sm rounded-xl font-medium transition-all duration-150',
                  'hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-300',
                  current
                    ? selected
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow'
                      : today
                        ? 'bg-gradient-to-r from-orange-400 to-pink-500 text-white font-semibold'
                        : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-700'
                    : 'text-gray-300 hover:text-gray-400'
                ].join(' ')}
              >
                {d.getDate()}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
          <button
            onClick={() => handleDateSelect(new Date())}
            className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium hover:shadow"
          >
            Today
          </button>
          <button onClick={() => setIsOpen(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg font-medium">
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <button
          ref={btnRef}
          type="button"
          onClick={openPanel}
          className="w-full px-4 py-3 pl-12 bg-gradient-to-r from-white to-gray-50 border-2 border-gray-200 rounded-xl hover:border-indigo-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all duration-300 text-left shadow-sm hover:shadow-lg group"
        >
          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 w-5 h-5 group-hover:text-indigo-600 transition-colors" />
          <span className={selectedDate ? "text-gray-900 font-medium" : "text-gray-500"}>
            {selectedDate ? displayDate(selectedDate) : placeholder}
          </span>
          <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400 transition-all duration-300 ${isOpen ? 'rotate-180 text-indigo-600' : 'group-hover:text-indigo-600'}`} />
        </button>
      </div>

      {/* Portal */}
      {isOpen && ReactDOM.createPortal(panel, document.body)}
    </div>
  );
};


const Vouchers = () => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [transactionType, setTransactionType] = useState('Receive');
  const [searchTerm, setSearchTerm] = useState('');
  const [showZeroAmounts, setShowZeroAmounts] = useState(false);
  const [groupedView, setGroupedView] = useState(true);

  const { data, isLoading } = useGetVouchersQuery({
    from_date: fromDate,
    to_date: toDate,
    transaction_type: transactionType
  });

  const { data: institute, isLoading: instituteLoading } = useGetInstituteLatestQuery();

  const transactionTypes = [
    { value: 'Receive', label: 'Receive', icon: TrendingDown, color: 'green' },
    { value: 'Payment', label: 'Payment', icon: TrendingUp, color: 'red' },
    { value: 'Contra', label: 'Contra', icon: ArrowLeftRight, color: 'blue' },
    { value: 'Journal', label: 'Journal', icon: BookOpen, color: 'purple' }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Math.abs(amount));
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTransactionTypeConfig = (type) => {
    return transactionTypes.find(t => t.value === type) || transactionTypes[0];
  };

  const getVoucherIcon = (voucherNo) => {
    if (voucherNo.includes('REC')) return <Receipt className="w-4 h-4 text-green-600" />;
    if (voucherNo.includes('PAY')) return <CreditCard className="w-4 h-4 text-red-600" />;
    if (voucherNo.includes('CONTRA')) return <ArrowLeftRight className="w-4 h-4 text-blue-600" />;
    return <BookOpen className="w-4 h-4 text-purple-600" />;
  };

  const generateProfessionalReport = () => {
    if (!data || !institute) return;
    
    const currentDate = new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const typeConfig = getTransactionTypeConfig(transactionType);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Vouchers Report - ${transactionType}</title>
        <meta charset="UTF-8">
        <style>
          @page { 
            size: A4 portrait; 
            margin: 15mm; 
          }
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 10pt;
            line-height: 1.4;
            color: #1f2937;
          }
          
          /* Header */
          .report-header {
            border-bottom: 2px solid #6366f1;
            padding-bottom: 20px;
            margin-bottom: 30px;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .company-info {
            flex-grow: 1;
          }
          .company-name {
            font-size: 18pt;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 4px;
          }
          .company-address {
            font-size: 9pt;
            color: #6b7280;
            margin-bottom: 2px;
          }
          .company-logo {
            width: 50px;
            height: 50px;
            object-fit: contain;
            border-radius: 6px;
          }
          
          /* Report Title */
          .report-title {
            text-align: center;
            margin-bottom: 25px;
          }
          .report-title h1 {
            font-size: 16pt;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .report-period {
            font-size: 11pt;
            color: #6b7280;
            font-weight: 500;
          }
          
          /* Summary */
          .summary-section {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 25px;
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
          }
          .summary-item {
            text-align: center;
          }
          .summary-label {
            font-size: 8pt;
            color: #64748b;
            text-transform: uppercase;
            font-weight: 600;
            margin-bottom: 8px;
          }
          .summary-amount {
            font-size: 12pt;
            font-weight: 700;
            color: #1e293b;
          }
          
          /* Table */
          .vouchers-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            overflow: hidden;
          }
          
          .table-header {
            background: #f8fafc;
            border-bottom: 2px solid #e5e7eb;
          }
          .table-header th {
            padding: 12px 16px;
            text-align: left;
            font-weight: 600;
            font-size: 9pt;
            color: #374151;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .table-header .amount-header {
            text-align: right;
          }
          
          .voucher-header {
            background: #6366f1;
            color: white;
          }
          .voucher-header td {
            padding: 10px 16px;
            font-size: 9pt;
            font-weight: 600;
            text-transform: uppercase;
          }
          
          .entry-row {
            border-bottom: 1px solid #f3f4f6;
          }
          .entry-row:nth-child(even) {
            background: #fafafa;
          }
          .entry-row td {
            padding: 8px 16px;
            font-size: 9pt;
            vertical-align: middle;
          }
          
          .amount {
            text-align: right;
            font-family: 'Courier New', monospace;
            font-weight: 500;
            color: #1f2937;
          }
          
          .voucher-total {
            background: #f1f5f9;
            border-top: 1px solid #cbd5e1;
            border-bottom: 2px solid #cbd5e1;
          }
          .voucher-total td {
            padding: 10px 16px;
            font-weight: 600;
            font-size: 9pt;
            color: #1e293b;
          }
          
          .grand-total {
            background: #1e293b;
            color: white;
          }
          .grand-total td {
            padding: 12px 16px;
            font-weight: 700;
            font-size: 10pt;
            text-transform: uppercase;
          }
          
          /* Footer */
          .report-footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #e5e7eb;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 8pt;
            color: #6b7280;
          }
          
          @media print {
            body { background: white !important; }
            .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        <!-- Header -->
        <div class="report-header">
          <div class="company-info">
            <div class="company-name">${institute?.institute_name || 'Company Name'}</div>
            <div class="company-address">${institute?.institute_address || 'Company Address'}</div>
          </div>
          ${institute?.institute_logo ? `<img src="${institute.institute_logo}" alt="Logo" class="company-logo" />` : ''}
        </div>
        
        <!-- Title -->
        <div class="report-title">
          <h1>${transactionType} Vouchers Report</h1>
          <div class="report-period">
            For the Period: ${formatDate(data.from_date)} to ${formatDate(data.to_date)}
          </div>
        </div>
        
        <!-- Summary -->
        <div class="summary-section">
          <div class="summary-item">
            <div class="summary-label">Total Entries</div>
            <div class="summary-amount">${data.entries.length}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Total Vouchers</div>
            <div class="summary-amount">${Object.keys(data.voucher_totals).length}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Total Debits</div>
            <div class="summary-amount">৳${formatCurrency(data.total_debit)}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Total Credits</div>
            <div class="summary-amount">৳${formatCurrency(data.total_credit)}</div>
          </div>
        </div>
        
        <!-- Vouchers Table -->
        <table class="vouchers-table">
          <thead class="table-header">
            <tr>
              <th>Date</th>
              <th>Ledger Details</th>
              <th class="amount-header">Debit (৳)</th>
              <th class="amount-header">Credit (৳)</th>
            </tr>
          </thead>
          <tbody>
            ${Object.keys(data.voucher_totals).map(voucherNo => {
              const voucherEntries = data.entries.filter(entry => entry.voucher_no === voucherNo);
              const voucherTotal = data.voucher_totals[voucherNo];
              
              return `
                <!-- Voucher Header -->
                <tr class="voucher-header">
                  <td colspan="4">
                    <strong>Voucher: ${voucherNo}</strong>
                    (${voucherEntries.length} entries | Dr: ৳${formatCurrency(voucherTotal.debit)} | Cr: ৳${formatCurrency(voucherTotal.credit)})
                  </td>
                </tr>
                
                <!-- Voucher Entries -->
                ${voucherEntries.map(entry => `
                  <tr class="entry-row">
                    <td>${formatDate(entry.date)}</td>
                    <td>${entry.ledger_details}</td>
                    <td class="amount">${entry.debit > 0 ? formatCurrency(entry.debit) : '—'}</td>
                    <td class="amount">${entry.credit > 0 ? formatCurrency(entry.credit) : '—'}</td>
                  </tr>
                `).join('')}
                
                <!-- Voucher Total -->
                <tr class="voucher-total">
                  <td colspan="2"><strong>TOTAL ${voucherNo}</strong></td>
                  <td class="amount"><strong>${formatCurrency(voucherTotal.debit)}</strong></td>
                  <td class="amount"><strong>${formatCurrency(voucherTotal.credit)}</strong></td>
                </tr>
              `;
            }).join('')}
            
            <!-- Grand Total -->
            <tr class="grand-total">
              <td colspan="2"><strong>GRAND TOTAL</strong></td>
              <td class="amount"><strong>${formatCurrency(data.total_debit)}</strong></td>
              <td class="amount"><strong>${formatCurrency(data.total_credit)}</strong></td>
            </tr>
          </tbody>
        </table>
        
        <!-- Footer -->
        <div class="report-footer">
          <div>
            <div><strong>Generated:</strong> ${currentDate}</div>
            <div><strong>Transaction Type:</strong> ${transactionType} | <strong>Entries:</strong> ${data.entries.length}</div>
          </div>
        </div>
        
        <script>
          window.print();
          window.onafterprint = () => window.close();
        </script>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const filteredEntries = data ? data.entries.filter(entry => {
    const matchesSearch = entry.ledger_details.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.voucher_no.toLowerCase().includes(searchTerm.toLowerCase());
    const hasAmount = showZeroAmounts || entry.debit > 0 || entry.credit > 0;
    return matchesSearch && hasAmount;
  }) : [];

  const groupedByVoucher = filteredEntries.reduce((acc, entry) => {
    if (!acc[entry.voucher_no]) {
      acc[entry.voucher_no] = [];
    }
    acc[entry.voucher_no].push(entry);
    return acc;
  }, {});

  const typeConfig = getTransactionTypeConfig(transactionType);
  const TypeIcon = typeConfig.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 backdrop-blur-sm bg-white/90">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Vouchers Management
              </h1>
              <p className="text-gray-600">Transaction vouchers with detailed ledger entries and balancing</p>
            </div>
            
            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Transaction Type Selector */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Transaction Type *</label>
                <div className="relative">
                  <select
                    value={transactionType}
                    onChange={(e) => setTransactionType(e.target.value)}
                    className="w-full px-4 py-3 pl-12 bg-gradient-to-r from-white to-gray-50 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all duration-300 appearance-none font-medium"
                  >
                    {transactionTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                  <TypeIcon className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-${typeConfig.color}-500`} />
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Date Filters */}
              <ProfessionalDatePicker
                value={fromDate}
                onChange={setFromDate}
                label="From Date"
                required
                placeholder="Select start date"
              />
              <ProfessionalDatePicker
                value={toDate}
                onChange={setToDate}
                label="To Date"
                required
                placeholder="Select end date"
              />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {(isLoading || instituteLoading) && (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center backdrop-blur-sm bg-white/90">
            <div className="animate-spin w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading voucher data...</p>
          </div>
        )}

        {/* Main Content */}
        {data && institute && !isLoading && !instituteLoading && (
          <>
            {/* Report Header */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 backdrop-blur-sm bg-white/90">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-center gap-4">
                  {institute?.institute_logo && (
                    <img 
                      src={institute.institute_logo} 
                      alt="Institute Logo" 
                      className="w-12 h-12 object-contain rounded-lg border shadow-sm"
                    />
                  )}
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{institute?.institute_name || 'Institute Name'}</h2>
                    <p className="text-gray-600 text-sm">{institute?.institute_address || 'Address'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-right text-sm text-gray-600">
                    <p><strong>Period:</strong> {formatDate(data.from_date)} to {formatDate(data.to_date)}</p>
                    <p><strong>Type:</strong> {transactionType} Vouchers</p>
                  </div>
                  <button
                    onClick={generateProfessionalReport}
                    className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 font-medium transform hover:scale-105"
                  >
                    <Download className="w-4 h-4" />
                    Export Report
                  </button>
                </div>
              </div>
            </div>

            {/* Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Total Entries */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                  <FileText className="w-6 h-6 text-blue-600" />
                  <h3 className="font-semibold text-blue-900">Total Entries</h3>
                </div>
                <p className="text-3xl font-bold text-blue-700">{data.entries.length}</p>
                <p className="text-sm text-blue-600 mt-1">Ledger entries</p>
              </div>

              {/* Total Vouchers */}
              <div className="bg-gradient-to-br from-purple-50 to-violet-100 border-2 border-purple-200 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                  <Receipt className="w-6 h-6 text-purple-600" />
                  <h3 className="font-semibold text-purple-900">Total Vouchers</h3>
                </div>
                <p className="text-3xl font-bold text-purple-700">{Object.keys(data.voucher_totals).length}</p>
                <p className="text-sm text-purple-600 mt-1">Unique vouchers</p>
              </div>

              {/* Total Debits */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-200 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                  <h3 className="font-semibold text-green-900">Total Debits</h3>
                </div>
                <p className="text-3xl font-bold text-green-700">৳{formatCurrency(data.total_debit)}</p>
                <p className="text-sm text-green-600 mt-1">All debit amounts</p>
              </div>

              {/* Total Credits */}
              <div className="bg-gradient-to-br from-orange-50 to-amber-100 border-2 border-orange-200 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                  <TrendingDown className="w-6 h-6 text-orange-600" />
                  <h3 className="font-semibold text-orange-900">Total Credits</h3>
                </div>
                <p className="text-3xl font-bold text-orange-700">৳{formatCurrency(data.total_credit)}</p>
                <p className="text-sm text-orange-600 mt-1">All credit amounts</p>
              </div>
            </div>

            {/* Balance Status */}
            {data.total_debit === data.total_credit ? (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <span className="text-lg font-bold text-green-900">Vouchers are Balanced</span>
                  <span className="text-green-700">Total Debits = Total Credits</span>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                  <span className="text-lg font-bold text-red-900">Vouchers are Unbalanced</span>
                  <span className="text-red-700">
                    Difference: ৳{formatCurrency(Math.abs(data.total_debit - data.total_credit))}
                  </span>
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Search Bar */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-4 backdrop-blur-sm bg-white/90">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search vouchers, ledgers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 text-sm transition-all duration-300"
                  />
                </div>
              </div>

              {/* View Options */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-4 backdrop-blur-sm bg-white/90">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    View Options
                  </h3>
                  <button
                    onClick={() => setShowZeroAmounts(!showZeroAmounts)}
                    className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 transition-colors"
                  >
                    {showZeroAmounts ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    {showZeroAmounts ? 'Hide' : 'Show'} Zero Amounts
                  </button>
                </div>
              </div>

              {/* Group Toggle */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-4 backdrop-blur-sm bg-white/90">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Display Mode
                  </h3>
                  <button
                    onClick={() => setGroupedView(!groupedView)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-300 ${
                      groupedView 
                        ? 'bg-indigo-100 text-indigo-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {groupedView ? 'Grouped' : 'List View'}
                  </button>
                </div>
              </div>
            </div>

            {/* Vouchers Table */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden backdrop-blur-sm bg-white/90">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
                    <tr>
                      <th className="text-left py-4 px-6 font-semibold text-indigo-900 text-sm">Date</th>
                      <th className="text-left py-4 px-6 font-semibold text-indigo-900 text-sm">Voucher No</th>
                      <th className="text-left py-4 px-6 font-semibold text-indigo-900 text-sm">Ledger Details</th>
                      <th className="text-right py-4 px-6 font-semibold text-indigo-900 text-sm min-w-[120px]">Debit (৳)</th>
                      <th className="text-right py-4 px-6 font-semibold text-indigo-900 text-sm min-w-[120px]">Credit (৳)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedView ? (
                      // Grouped by Voucher View
                      Object.keys(groupedByVoucher).map((voucherNo, voucherIndex) => {
                        const voucherEntries = groupedByVoucher[voucherNo];
                        const voucherTotal = data.voucher_totals[voucherNo];
                        
                        return (
                          <React.Fragment key={voucherIndex}>
                            {/* Voucher Header */}
                            <tr className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-indigo-100">
                              <td className="py-4 px-6" colSpan="5">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    {getVoucherIcon(voucherNo)}
                                    <span className="font-bold text-indigo-900 text-lg">{voucherNo}</span>
                                    <span className="text-indigo-600 text-sm bg-indigo-100 px-2 py-1 rounded-full">
                                      {voucherEntries.length} entries
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-6 text-sm">
                                    <span className="text-green-700 font-semibold">
                                      Dr: ৳{formatCurrency(voucherTotal.debit)}
                                    </span>
                                    <span className="text-blue-700 font-semibold">
                                      Cr: ৳{formatCurrency(voucherTotal.credit)}
                                    </span>
                                    {voucherTotal.debit === voucherTotal.credit ? (
                                      <CheckCircle className="w-4 h-4 text-green-600" />
                                    ) : (
                                      <AlertTriangle className="w-4 h-4 text-red-600" />
                                    )}
                                  </div>
                                </div>
                              </td>
                            </tr>
                            
                            {/* Voucher Entries */}
                            {voucherEntries.map((entry, entryIndex) => (
                              <tr 
                                key={`${voucherIndex}-${entryIndex}`} 
                                className="border-b border-gray-100 hover:bg-indigo-25 transition-colors"
                              >
                                <td className="py-3 px-6 pl-12">
                                  <span className="text-gray-700 font-medium">{formatDate(entry.date)}</span>
                                </td>
                                <td className="py-3 px-6">
                                  <span className="text-gray-500 font-mono text-xs">{entry.voucher_no}</span>
                                </td>
                                <td className="py-3 px-6">
                                  <span className="text-gray-700">{entry.ledger_details}</span>
                                </td>
                                <td className="text-right py-3 px-6 font-mono text-sm">
                                  {entry.debit > 0 ? (
                                    <span className="text-green-700 font-semibold">৳{formatCurrency(entry.debit)}</span>
                                  ) : (
                                    <span className="text-gray-400">—</span>
                                  )}
                                </td>
                                <td className="text-right py-3 px-6 font-mono text-sm">
                                  {entry.credit > 0 ? (
                                    <span className="text-blue-700 font-semibold">৳{formatCurrency(entry.credit)}</span>
                                  ) : (
                                    <span className="text-gray-400">—</span>
                                  )}
                                </td>
                              </tr>
                            ))}

                            {/* Voucher Total */}
                            <tr className="bg-gray-100 border-b-2 border-gray-200">
                              <td className="py-3 px-6 pl-12 font-bold text-gray-900" colSpan="3">
                                TOTAL {voucherNo}
                              </td>
                              <td className="text-right py-3 px-6 font-bold text-green-700 font-mono">
                                ৳{formatCurrency(voucherTotal.debit)}
                              </td>
                              <td className="text-right py-3 px-6 font-bold text-blue-700 font-mono">
                                ৳{formatCurrency(voucherTotal.credit)}
                              </td>
                            </tr>
                          </React.Fragment>
                        );
                      })
                    ) : (
                      // List View
                      filteredEntries.map((entry, index) => (
                        <tr 
                          key={index} 
                          className="border-b border-gray-100 hover:bg-indigo-25 transition-colors"
                        >
                          <td className="py-3 px-6">
                            <span className="text-gray-700 font-medium">{formatDate(entry.date)}</span>
                          </td>
                          <td className="py-3 px-6">
                            <div className="flex items-center gap-2">
                              {getVoucherIcon(entry.voucher_no)}
                              <span className="text-gray-700 font-mono text-sm">{entry.voucher_no}</span>
                            </div>
                          </td>
                          <td className="py-3 px-6">
                            <span className="text-gray-700">{entry.ledger_details}</span>
                          </td>
                          <td className="text-right py-3 px-6 font-mono text-sm">
                            {entry.debit > 0 ? (
                              <span className="text-green-700 font-semibold">৳{formatCurrency(entry.debit)}</span>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="text-right py-3 px-6 font-mono text-sm">
                            {entry.credit > 0 ? (
                              <span className="text-blue-700 font-semibold">৳{formatCurrency(entry.credit)}</span>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}

                    {/* Grand Total */}
                    <tr className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-t-2 border-indigo-700">
                      <td className="py-4 px-6 font-bold text-base" colSpan="3">GRAND TOTAL</td>
                      <td className="text-right py-4 px-6 font-bold text-base font-mono">
                        ৳{formatCurrency(data.total_debit)}
                      </td>
                      <td className="text-right py-4 px-6 font-bold text-base font-mono">
                        ৳{formatCurrency(data.total_credit)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Voucher Summary */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 backdrop-blur-sm bg-white/90">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Voucher Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Transaction Type:</span>
                    <span className="font-semibold flex items-center gap-2">
                      <TypeIcon className={`w-4 h-4 text-${typeConfig.color}-500`} />
                      {transactionType}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Vouchers:</span>
                    <span className="font-semibold">{Object.keys(data.voucher_totals).length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Entries:</span>
                    <span className="font-semibold">{data.entries.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-green-600">Total Debits:</span>
                    <span className="font-semibold font-mono text-green-700">৳{formatCurrency(data.total_debit)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-600">Total Credits:</span>
                    <span className="font-semibold font-mono text-blue-700">৳{formatCurrency(data.total_credit)}</span>
                  </div>
                  <hr className="border-gray-200" />
                  <div className="flex justify-between items-center">
                    <span className="text-purple-600 font-medium">Balance Status:</span>
                    <div className="flex items-center gap-2">
                      {data.total_debit === data.total_credit ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="font-bold text-green-700">Balanced</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                          <span className="font-bold text-red-700">Unbalanced</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Imbalanced Vouchers */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 backdrop-blur-sm bg-white/90">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Voucher Validation</h3>
                <div className="space-y-3">
                  {data.imbalanced_vouchers && data.imbalanced_vouchers.length > 0 ? (
                    <>
                      <div className="flex items-center gap-2 text-red-600 mb-3">
                        <AlertTriangle className="w-5 h-5" />
                        <span className="font-semibold">Imbalanced Vouchers Found</span>
                      </div>
                      {data.imbalanced_vouchers.map(voucher => (
                        <div key={voucher} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                          <span className="text-red-700 font-mono text-sm">{voucher}</span>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-center py-6">
                      <CheckCircle className="w-12 h-12 text-green-500" />
                      <div>
                        <p className="font-semibold text-green-700">All Vouchers Balanced</p>
                        <p className="text-sm text-green-600">Every voucher has equal debits and credits</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Information */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 backdrop-blur-sm bg-white/90">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>
                    This voucher report shows {transactionType.toLowerCase()} transactions with detailed ledger entries for the selected period.
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span>Report generated: {new Date().toLocaleString()}</span>
                  <span className="font-medium text-indigo-600">
                    {data.entries.length} entries | {Object.keys(data.voucher_totals).length} vouchers
                  </span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* No Data State */}
        {!data && !isLoading && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-12 text-center backdrop-blur-sm bg-white/90">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                <Receipt className="w-8 h-8 text-indigo-500" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Generate Voucher Report</h3>
                <p className="text-gray-600 mb-4">
                  Select transaction type and date range to generate your voucher report.
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>Choose parameters above to get started</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {!data && !isLoading && fromDate && toDate && (
          <div className="bg-white rounded-2xl shadow-xl border border-red-200 p-12 text-center backdrop-blur-sm bg-white/90">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-red-900 mb-2">No Vouchers Found</h3>
                <p className="text-red-600">
                  No {transactionType.toLowerCase()} vouchers found for the selected date range.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Vouchers;