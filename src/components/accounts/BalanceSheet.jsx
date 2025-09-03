// import { useTranslation } from "react-i18next";
// import BalanceSheetTable from "./reports/balance-sheet/BalanceSheetTable";
// import SearchBySingleDate from "./reports/SearchBySingleDate";

// const BalanceSheet = () => {
//     // const { t } = useTranslation();
//   return (
//     <div className="bg-[#441a05]rounded-md px-4 py-2 my-2 sm:my-4">
//       <SearchBySingleDate />

//       <h3 className="text-2xl font-medium text-center mt-2">
//         {/* {t("module.accounts.cash_summary_list")} */}
//         Balance Sheet
//       </h3>
//       <BalanceSheetTable />
//     </div>
//   );
// };

// export default BalanceSheet;
import React, { useState } from 'react';
import { 
  Calendar, 
  Download, 
  FileText, 
  Building,
  CreditCard,
  PieChart,
  AlertCircle,
  CheckCircle,
  Settings,
  Search,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { useGetBalanceSheetQuery } from '../../redux/features/api/accounts/financialReports/financialReportsApi';
import { useGetInstituteLatestQuery } from '../../redux/features/api/institute/instituteLatestApi';

// Import your actual hooks

const DatePicker = ({ value, onChange, label, required = false }) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-3 pl-11 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700 shadow-sm hover:border-gray-400"
        />
        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
      </div>
    </div>
  );
};

const BalanceSheet = () => {
  const [asOfDate, setAsOfDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showZeroBalances, setShowZeroBalances] = useState(false);
  const [expandedSections, setExpandedSections] = useState(new Set(['Assets', 'Liabilities', 'Equity']));

  const { data, isLoading } = useGetBalanceSheetQuery({
    from_date: asOfDate,
    to_date: asOfDate
  });

  const { data: institute, isLoading: instituteLoading } = useGetInstituteLatestQuery();

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
      month: 'long',
      day: 'numeric'
    });
  };

  const toggleSection = (section) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const filterItems = (items, searchTerm, showZero) => {
    return items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const hasBalance = showZero || item.debit !== 0 || item.credit !== 0;
      return matchesSearch && hasBalance;
    });
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

    const isBalanced = data.status === 'Balanced';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Balance Sheet</title>
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
            border-bottom: 2px solid #3b82f6;
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
          .report-date {
            font-size: 11pt;
            color: #6b7280;
            font-weight: 500;
          }
          
          /* Balance Status */
          .balance-status {
            background: ${isBalanced ? '#f0fdf4' : '#fef2f2'};
            border: 1px solid ${isBalanced ? '#22c55e' : '#ef4444'};
            border-radius: 8px;
            padding: 12px 20px;
            margin-bottom: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .status-indicator {
            display: flex;
            align-items: center;
            gap: 8px;
            color: ${isBalanced ? '#16a34a' : '#dc2626'};
            font-weight: 600;
          }
          .status-dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: ${isBalanced ? '#22c55e' : '#ef4444'};
          }
          
          /* Table */
          .balance-sheet-table {
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
            width: 120px;
          }
          
          .section-header {
            background: #3b82f6;
            color: white;
          }
          .section-header td {
            padding: 10px 16px;
            font-size: 9pt;
            font-weight: 600;
            text-transform: uppercase;
          }
          
          .item-row {
            border-bottom: 1px solid #f3f4f6;
          }
          .item-row:nth-child(even) {
            background: #fafafa;
          }
          .item-row td {
            padding: 8px 16px;
            font-size: 9pt;
            vertical-align: middle;
          }
          .item-name {
            color: #374151;
            padding-left: 24px;
          }
          .amount {
            text-align: right;
            font-family: 'SF Mono', Monaco, monospace;
            font-weight: 500;
            color: #1f2937;
          }
          .zero-amount {
            color: #9ca3af;
          }
          
          .section-total {
            background: #f1f5f9;
            border-top: 1px solid #cbd5e1;
            border-bottom: 2px solid #cbd5e1;
          }
          .section-total td {
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
          .signature-section {
            text-align: center;
          }
          .signature-line {
            width: 120px;
            border-top: 1px solid #374151;
            margin-bottom: 6px;
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
          <h1>Balance Sheet</h1>
          <div class="report-date">
            As of ${formatDate(data.as_of)}
          </div>
        </div>
        
        <!-- Balance Status -->
        <div class="balance-status">
          <div class="status-indicator">
            <div class="status-dot"></div>
            <span>Status: ${data.status}</span>
          </div>
          <div>
            <span>Assets = Liabilities + Equity</span>
          </div>
        </div>
        
        <!-- Table -->
        <table class="balance-sheet-table">
          <thead class="table-header">
            <tr>
              <th>Account Name</th>
              <th class="amount-header">Debit (৳)</th>
              <th class="amount-header">Credit (৳)</th>
            </tr>
          </thead>
          <tbody>
            <!-- Assets Section -->
            <tr class="section-header">
              <td colspan="3">ASSETS (${data.assets.length} accounts)</td>
            </tr>
            ${data.assets.map(item => `
              <tr class="item-row">
                <td class="item-name">${item.name}</td>
                <td class="amount ${item.debit === 0 ? 'zero-amount' : ''}">${item.debit > 0 ? formatCurrency(item.debit) : '—'}</td>
                <td class="amount ${item.credit === 0 ? 'zero-amount' : ''}">${item.credit > 0 ? formatCurrency(item.credit) : '—'}</td>
              </tr>
            `).join('')}
            <tr class="section-total">
              <td><strong>TOTAL ASSETS</strong></td>
              <td class="amount"><strong>${formatCurrency(data.totals.assets.debit)}</strong></td>
              <td class="amount"><strong>${formatCurrency(data.totals.assets.credit)}</strong></td>
            </tr>
            
            <!-- Liabilities Section -->
            <tr class="section-header">
              <td colspan="3">LIABILITIES (${data.liabilities.length} accounts)</td>
            </tr>
            ${data.liabilities.map(item => `
              <tr class="item-row">
                <td class="item-name">${item.name}</td>
                <td class="amount ${item.debit === 0 ? 'zero-amount' : ''}">${item.debit > 0 ? formatCurrency(item.debit) : '—'}</td>
                <td class="amount ${item.credit === 0 ? 'zero-amount' : ''}">${item.credit > 0 ? formatCurrency(item.credit) : '—'}</td>
              </tr>
            `).join('')}
            <tr class="section-total">
              <td><strong>TOTAL LIABILITIES</strong></td>
              <td class="amount"><strong>${formatCurrency(data.totals.liabilities.debit)}</strong></td>
              <td class="amount"><strong>${formatCurrency(data.totals.liabilities.credit)}</strong></td>
            </tr>
            
            <!-- Equity Section -->
            <tr class="section-header">
              <td colspan="3">EQUITY (${data.equity.length} accounts)</td>
            </tr>
            ${data.equity.map(item => `
              <tr class="item-row">
                <td class="item-name">${item.name}</td>
                <td class="amount ${item.debit === 0 ? 'zero-amount' : ''}">${item.debit > 0 ? formatCurrency(item.debit) : '—'}</td>
                <td class="amount ${item.credit === 0 ? 'zero-amount' : ''}">${item.credit > 0 ? formatCurrency(item.credit) : '—'}</td>
              </tr>
            `).join('')}
            <tr class="section-total">
              <td><strong>TOTAL EQUITY</strong></td>
              <td class="amount"><strong>${formatCurrency(data.totals.equity.debit)}</strong></td>
              <td class="amount"><strong>${formatCurrency(data.totals.equity.credit)}</strong></td>
            </tr>
            
            <!-- Grand Total -->
            <tr class="grand-total">
              <td><strong>TOTAL</strong></td>
              <td class="amount"><strong>${formatCurrency(data.totals.overall.debit)}</strong></td>
              <td class="amount"><strong>${formatCurrency(data.totals.overall.credit)}</strong></td>
            </tr>
          </tbody>
        </table>
        
        <!-- Footer -->
        <div class="report-footer">
          <div>
            <div><strong>Generated:</strong> ${currentDate}</div>
            <div><strong>Assets:</strong> ${data.assets.length} | <strong>Liabilities:</strong> ${data.liabilities.length} | <strong>Equity:</strong> ${data.equity.length}</div>
          </div>
          <div class="signature-section">
            <div class="signature-line"></div>
            <div><strong>Authorized Signature</strong></div>
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

  const filteredAssets = data ? filterItems(data.assets, searchTerm, showZeroBalances) : [];
  const filteredLiabilities = data ? filterItems(data.liabilities, searchTerm, showZeroBalances) : [];
  const filteredEquity = data ? filterItems(data.equity, searchTerm, showZeroBalances) : [];
  
  const isBalanced = data?.status === 'Balanced';

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Balance Sheet</h1>
              <p className="text-gray-600">Assets, liabilities, and equity financial position statement</p>
            </div>
            
            {/* Date Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <DatePicker
                value={asOfDate}
                onChange={setAsOfDate}
                label="As of Date"
                required
              />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {(isLoading || instituteLoading) && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="animate-spin w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading balance sheet data...</p>
          </div>
        )}

        {/* Main Content */}
        {data && institute && !isLoading && !instituteLoading && (
          <>
            {/* Report Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-center gap-4">
                  {institute?.institute_logo && (
                    <img 
                      src={institute.institute_logo} 
                      alt="Institute Logo" 
                      className="w-12 h-12 object-contain rounded-lg border"
                    />
                  )}
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{institute?.institute_name || 'Institute Name'}</h2>
                    <p className="text-gray-600 text-sm">{institute?.institute_address || 'Address'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-right text-sm text-gray-600">
                    <p><strong>As of:</strong> {formatDate(data.as_of)}</p>
                    <p><strong>Generated:</strong> {new Date().toLocaleDateString()}</p>
                  </div>
                  <button
                    onClick={generateProfessionalReport}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    <Download className="w-4 h-4" />
                    Export Report
                  </button>
                </div>
              </div>
            </div>

            {/* Financial Position Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Balance Status */}
              <div className={`rounded-xl p-6 border-2 ${
                isBalanced 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center gap-3 mb-3">
                  {isBalanced ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  )}
                  <h3 className={`font-semibold ${
                    isBalanced ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {data.status}
                  </h3>
                </div>
                <p className={`text-sm ${
                  isBalanced ? 'text-green-700' : 'text-red-700'
                }`}>
                  {isBalanced 
                    ? 'Assets = Liabilities + Equity' 
                    : 'Balance sheet is not balanced'
                  }
                </p>
              </div>

              {/* Total Assets */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Building className="w-6 h-6 text-blue-600" />
                  <h3 className="font-semibold text-blue-900">Total Assets</h3>
                </div>
                <p className="text-2xl font-bold text-blue-700">৳{formatCurrency(data.totals.assets.debit)}</p>
                <p className="text-sm text-blue-600 mt-1">{data.assets.length} asset accounts</p>
              </div>

              {/* Total Liabilities */}
              <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <CreditCard className="w-6 h-6 text-orange-600" />
                  <h3 className="font-semibold text-orange-900">Total Liabilities</h3>
                </div>
                <p className="text-2xl font-bold text-orange-700">৳{formatCurrency(data.totals.liabilities.credit)}</p>
                <p className="text-sm text-orange-600 mt-1">{data.liabilities.length} liability accounts</p>
              </div>

              {/* Total Equity */}
              <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <PieChart className="w-6 h-6 text-purple-600" />
                  <h3 className="font-semibold text-purple-900">Total Equity</h3>
                </div>
                <p className="text-2xl font-bold text-purple-700">৳{formatCurrency(data.totals.equity.credit)}</p>
                <p className="text-sm text-purple-600 mt-1">{data.equity.length} equity accounts</p>
              </div>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Search Bar */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search accounts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
              </div>

              {/* View Options */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    View Options
                  </h3>
                  <button
                    onClick={() => setShowZeroBalances(!showZeroBalances)}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                  >
                    {showZeroBalances ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    {showZeroBalances ? 'Hide' : 'Show'} Zero Balances
                  </button>
                </div>
              </div>
            </div>

            {/* Balance Sheet Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm">Account Name</th>
                      <th className="text-right py-4 px-6 font-semibold text-gray-900 text-sm min-w-[120px]">Debit (৳)</th>
                      <th className="text-right py-4 px-6 font-semibold text-gray-900 text-sm min-w-[120px]">Credit (৳)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Assets Section */}
                    <tr className="bg-blue-50 border-b border-blue-100">
                      <td className="py-3 px-6">
                        <button
                          onClick={() => toggleSection('Assets')}
                          className="flex items-center gap-2 w-full text-left hover:text-blue-700 transition-colors"
                        >
                          {expandedSections.has('Assets') ? 
                            <ChevronDown className="w-4 h-4 text-blue-600" /> : 
                            <ChevronRight className="w-4 h-4 text-blue-600" />
                          }
                          <Building className="w-4 h-4 text-blue-600" />
                          <span className="font-semibold text-blue-900 uppercase tracking-wide text-sm">
                            ASSETS
                          </span>
                          <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                            {filteredAssets.length}
                          </span>
                        </button>
                      </td>
                      <td className="text-right py-3 px-6 font-semibold text-blue-900">
                        ৳{formatCurrency(data.totals.assets.debit)}
                      </td>
                      <td className="text-right py-3 px-6 font-semibold text-blue-900">
                        {data.totals.assets.credit > 0 ? formatCurrency(data.totals.assets.credit) : '—'}
                      </td>
                    </tr>
                    
                    {/* Asset Items */}
                    {expandedSections.has('Assets') && filteredAssets.map((item, index) => (
                      <tr 
                        key={`asset-${index}`} 
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3 px-6 pl-12">
                          <span className="text-gray-700">{item.name}</span>
                        </td>
                        <td className="text-right py-3 px-6 font-mono text-sm">
                          {item.debit > 0 ? (
                            <span className="text-blue-700">৳{formatCurrency(item.debit)}</span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="text-right py-3 px-6 font-mono text-sm">
                          {item.credit > 0 ? (
                            <span className="text-gray-900">৳{formatCurrency(item.credit)}</span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                      </tr>
                    ))}

                    {/* Liabilities Section */}
                    <tr className="bg-orange-50 border-b border-orange-100">
                      <td className="py-3 px-6">
                        <button
                          onClick={() => toggleSection('Liabilities')}
                          className="flex items-center gap-2 w-full text-left hover:text-orange-700 transition-colors"
                        >
                          {expandedSections.has('Liabilities') ? 
                            <ChevronDown className="w-4 h-4 text-orange-600" /> : 
                            <ChevronRight className="w-4 h-4 text-orange-600" />
                          }
                          <CreditCard className="w-4 h-4 text-orange-600" />
                          <span className="font-semibold text-orange-900 uppercase tracking-wide text-sm">
                            LIABILITIES
                          </span>
                          <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                            {filteredLiabilities.length}
                          </span>
                        </button>
                      </td>
                      <td className="text-right py-3 px-6 font-semibold text-orange-900">
                        {data.totals.liabilities.debit > 0 ? formatCurrency(data.totals.liabilities.debit) : '—'}
                      </td>
                      <td className="text-right py-3 px-6 font-semibold text-orange-900">
                        ৳{formatCurrency(data.totals.liabilities.credit)}
                      </td>
                    </tr>
                    
                    {/* Liability Items */}
                    {expandedSections.has('Liabilities') && filteredLiabilities.map((item, index) => (
                      <tr 
                        key={`liability-${index}`} 
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3 px-6 pl-12">
                          <span className="text-gray-700">{item.name}</span>
                        </td>
                        <td className="text-right py-3 px-6 font-mono text-sm">
                          {item.debit > 0 ? (
                            <span className="text-gray-900">৳{formatCurrency(item.debit)}</span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="text-right py-3 px-6 font-mono text-sm">
                          {item.credit > 0 ? (
                            <span className="text-orange-700">৳{formatCurrency(item.credit)}</span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                      </tr>
                    ))}

                    {/* Equity Section */}
                    <tr className="bg-purple-50 border-b border-purple-100">
                      <td className="py-3 px-6">
                        <button
                          onClick={() => toggleSection('Equity')}
                          className="flex items-center gap-2 w-full text-left hover:text-purple-700 transition-colors"
                        >
                          {expandedSections.has('Equity') ? 
                            <ChevronDown className="w-4 h-4 text-purple-600" /> : 
                            <ChevronRight className="w-4 h-4 text-purple-600" />
                          }
                          <PieChart className="w-4 h-4 text-purple-600" />
                          <span className="font-semibold text-purple-900 uppercase tracking-wide text-sm">
                            EQUITY
                          </span>
                          <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                            {filteredEquity.length}
                          </span>
                        </button>
                      </td>
                      <td className="text-right py-3 px-6 font-semibold text-purple-900">
                        {data.totals.equity.debit > 0 ? formatCurrency(data.totals.equity.debit) : '—'}
                      </td>
                      <td className="text-right py-3 px-6 font-semibold text-purple-900">
                        ৳{formatCurrency(data.totals.equity.credit)}
                      </td>
                    </tr>
                    
                    {/* Equity Items */}
                    {expandedSections.has('Equity') && filteredEquity.map((item, index) => (
                      <tr 
                        key={`equity-${index}`} 
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3 px-6 pl-12">
                          <span className="text-gray-700">{item.name}</span>
                        </td>
                        <td className="text-right py-3 px-6 font-mono text-sm">
                          {item.debit > 0 ? (
                            <span className="text-gray-900">৳{formatCurrency(item.debit)}</span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="text-right py-3 px-6 font-mono text-sm">
                          {item.credit > 0 ? (
                            <span className="text-purple-700">৳{formatCurrency(item.credit)}</span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                      </tr>
                    ))}

                    {/* Grand Total */}
                    <tr className="bg-gray-900 text-white border-t-2 border-gray-800">
                      <td className="py-4 px-6 font-bold text-base">TOTAL</td>
                      <td className="text-right py-4 px-6 font-bold text-base font-mono">
                        ৳{formatCurrency(data.totals.overall.debit)}
                      </td>
                      <td className="text-right py-4 px-6 font-bold text-base font-mono">
                        ৳{formatCurrency(data.totals.overall.credit)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Balance Sheet Equation */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-sm border border-blue-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">Balance Sheet Equation</h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center text-center">
                <div className="bg-blue-100 rounded-lg p-4">
                  <div className="text-sm text-blue-600 font-medium">ASSETS</div>
                  <div className="text-xl font-bold text-blue-900">৳{formatCurrency(data.totals.assets.debit)}</div>
                </div>
                <div className="text-2xl font-bold text-gray-600">=</div>
                <div className="bg-orange-100 rounded-lg p-4">
                  <div className="text-sm text-orange-600 font-medium">LIABILITIES</div>
                  <div className="text-xl font-bold text-orange-900">৳{formatCurrency(data.totals.liabilities.credit)}</div>
                </div>
                <div className="text-2xl font-bold text-gray-600">+</div>
                <div className="bg-purple-100 rounded-lg p-4">
                  <div className="text-sm text-purple-600 font-medium">EQUITY</div>
                  <div className="text-xl font-bold text-purple-900">৳{formatCurrency(data.totals.equity.credit)}</div>
                </div>
              </div>
              
              {/* Net Profit Display */}
              {data.net_profit && (
                <div className="mt-4 text-center">
                  <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Net Profit Included: ৳{formatCurrency(data.net_profit)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>
                    This balance sheet shows the financial position as of the specified date.
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span>Report generated: {new Date().toLocaleString()}</span>
                  <span className={`font-medium ${isBalanced ? 'text-green-600' : 'text-red-600'}`}>
                    {isBalanced ? '✅' : '⚠️'} {data.status}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* No Data State */}
        {!data && !isLoading && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Generate Balance Sheet</h3>
                <p className="text-gray-600 mb-4">
                  Select a date to generate your balance sheet report.
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>Choose date above to get started</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {!data && !isLoading && asOfDate && (
          <div className="bg-white rounded-xl shadow-sm border border-red-200 p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-red-900 mb-2">No Data Available</h3>
                <p className="text-red-600">
                  No balance sheet data found for the selected date.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BalanceSheet;