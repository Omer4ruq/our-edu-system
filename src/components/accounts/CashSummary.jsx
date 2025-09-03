// import { useTranslation } from "react-i18next";
// import CashSummaryList from "./reports/cash-summary/CashSummaryList";
// import SearchByDateRange from "./reports/SearchByDateRange";

// const CashSummary = () => {
//     const { t } = useTranslation();
//   return (
//     <div className="bg-[#441a05]rounded-md px-4 py-2 my-2 sm:my-4">
//       <SearchByDateRange />

//       <h3 className="text-2xl font-medium text-center mt-2">
//         {t("module.accounts.cash_summary_list")}
//       </h3>
//       <CashSummaryList />
      

//     </div>
//   );
// };

// export default CashSummary;
import React, { useState } from 'react';
import { 
  Calendar, 
  Download, 
  FileText, 
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  ArrowRight,
  ArrowDown,
  ArrowUp,
  AlertCircle,
  CheckCircle,
  Settings,
  Search,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

// Import your actual hooks
import { useGetCashSummaryQuery } from '../../redux/features/api/accounts/financialReports/financialReportsApi';
import { useGetInstituteLatestQuery } from '../../redux/features/api/institute/instituteLatestApi';

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

const CashSummary = () => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showZeroAmounts, setShowZeroAmounts] = useState(false);
  const [expandedSections, setExpandedSections] = useState(new Set(['Income', 'Expenses', 'Opening', 'Closing']));

  const { data, isLoading } = useGetCashSummaryQuery({
    from_date: fromDate,
    to_date: toDate
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
      const hasAmount = showZero || item.amount !== 0;
      return matchesSearch && hasAmount;
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

    const hasSurplus = data.surplus > 0;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Cash Summary Report</title>
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
          .report-period {
            font-size: 11pt;
            color: #6b7280;
            font-weight: 500;
          }
          
          /* Cash Flow Status */
          .cash-flow-status {
            background: ${hasSurplus ? '#f0fdf4' : '#fef2f2'};
            border: 1px solid ${hasSurplus ? '#22c55e' : '#ef4444'};
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
            color: ${hasSurplus ? '#16a34a' : '#dc2626'};
            font-weight: 600;
          }
          .status-dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: ${hasSurplus ? '#22c55e' : '#ef4444'};
          }
          .surplus-amount {
            font-size: 12pt;
            font-weight: 700;
            color: ${hasSurplus ? '#16a34a' : '#dc2626'};
          }
          
          /* Cash Flow Summary */
          .cash-flow-summary {
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
            padding: 15px;
            background: white;
            border-radius: 6px;
            border: 1px solid #e2e8f0;
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
          .cash-summary-table {
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
          
          .cash-surplus {
            background: ${hasSurplus ? '#dcfce7' : '#fee2e2'};
            color: ${hasSurplus ? '#166534' : '#991b1b'};
            border: 2px solid ${hasSurplus ? '#22c55e' : '#ef4444'};
          }
          .cash-surplus td {
            padding: 12px 16px;
            font-weight: 700;
            font-size: 11pt;
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
          <h1>Cash Summary Report</h1>
          <div class="report-period">
            For the Period: ${formatDate(data.from_date)} to ${formatDate(data.to_date)}
          </div>
        </div>
        
        <!-- Cash Flow Status -->
        <div class="cash-flow-status">
          <div class="status-indicator">
            <div class="status-dot"></div>
            <span>Net Cash Flow: ${hasSurplus ? 'Surplus' : 'Deficit'}</span>
          </div>
          <div class="surplus-amount">
            ${hasSurplus ? '+' : '-'}৳${formatCurrency(data.surplus)}
          </div>
        </div>
        
        <!-- Cash Flow Summary -->
        <div class="cash-flow-summary">
          <div class="summary-item">
            <div class="summary-label">Opening Cash</div>
            <div class="summary-amount">৳${formatCurrency(data.total_opening)}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Cash Inflows</div>
            <div class="summary-amount">৳${formatCurrency(data.total_income)}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Cash Outflows</div>
            <div class="summary-amount">৳${formatCurrency(data.total_expense)}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Closing Cash</div>
            <div class="summary-amount">৳${formatCurrency(data.total_closing)}</div>
          </div>
        </div>
        
        <!-- Table -->
        <table class="cash-summary-table">
          <thead class="table-header">
            <tr>
              <th>Description</th>
              <th class="amount-header">Amount (৳)</th>
            </tr>
          </thead>
          <tbody>
            <!-- Opening Balances -->
            <tr class="section-header">
              <td colspan="2">OPENING CASH BALANCES (${data.opening_balances.length} accounts)</td>
            </tr>
            ${data.opening_balances.map(item => `
              <tr class="item-row">
                <td class="item-name">${item.name}</td>
                <td class="amount">${formatCurrency(item.amount)}</td>
              </tr>
            `).join('')}
            <tr class="section-total">
              <td><strong>TOTAL OPENING BALANCE</strong></td>
              <td class="amount"><strong>${formatCurrency(data.total_opening)}</strong></td>
            </tr>
            
            <!-- Cash Inflows -->
            <tr class="section-header">
              <td colspan="2">CASH INFLOWS (${data.income_grouped.length} sources)</td>
            </tr>
            ${data.income_grouped.map(item => `
              <tr class="item-row">
                <td class="item-name">${item.name}</td>
                <td class="amount">${formatCurrency(item.amount)}</td>
              </tr>
            `).join('')}
            <tr class="section-total">
              <td><strong>TOTAL CASH INFLOWS</strong></td>
              <td class="amount"><strong>${formatCurrency(data.total_income)}</strong></td>
            </tr>
            
            <!-- Cash Outflows -->
            <tr class="section-header">
              <td colspan="2">CASH OUTFLOWS (${data.expense_grouped.length} items)</td>
            </tr>
            ${data.expense_grouped.map(item => `
              <tr class="item-row">
                <td class="item-name">${item.name}</td>
                <td class="amount">${formatCurrency(item.amount)}</td>
              </tr>
            `).join('')}
            <tr class="section-total">
              <td><strong>TOTAL CASH OUTFLOWS</strong></td>
              <td class="amount"><strong>${formatCurrency(data.total_expense)}</strong></td>
            </tr>
            
            <!-- Net Cash Flow -->
            <tr class="cash-surplus">
              <td><strong>NET CASH FLOW (${hasSurplus ? 'SURPLUS' : 'DEFICIT'})</strong></td>
              <td class="amount"><strong>${formatCurrency(data.surplus)}</strong></td>
            </tr>
            
            <!-- Closing Balances -->
            <tr class="section-header">
              <td colspan="2">CLOSING CASH BALANCES (${data.closing_balances.length} accounts)</td>
            </tr>
            ${data.closing_balances.map(item => `
              <tr class="item-row">
                <td class="item-name">${item.name}</td>
                <td class="amount">${formatCurrency(item.amount)}</td>
              </tr>
            `).join('')}
            <tr class="section-total">
              <td><strong>TOTAL CLOSING BALANCE</strong></td>
              <td class="amount"><strong>${formatCurrency(data.total_closing)}</strong></td>
            </tr>
          </tbody>
        </table>
        
        <!-- Footer -->
        <div class="report-footer">
          <div>
            <div><strong>Generated:</strong> ${currentDate}</div>
            <div><strong>Inflows:</strong> ${data.income_grouped.length} | <strong>Outflows:</strong> ${data.expense_grouped.length} | <strong>Accounts:</strong> ${data.opening_balances.length}</div>
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

  const filteredIncome = data ? filterItems(data.income_grouped, searchTerm, showZeroAmounts) : [];
  const filteredExpenses = data ? filterItems(data.expense_grouped, searchTerm, showZeroAmounts) : [];
  const filteredOpening = data ? filterItems(data.opening_balances, searchTerm, showZeroAmounts) : [];
  const filteredClosing = data ? filterItems(data.closing_balances, searchTerm, showZeroAmounts) : [];
  
  const hasSurplus = data ? data.surplus > 0 : false;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Cash Summary</h1>
              <p className="text-gray-600">Cash flow analysis with opening and closing balances</p>
            </div>
            
            {/* Date Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <DatePicker
                value={fromDate}
                onChange={setFromDate}
                label="From Date"
                required
              />
              <DatePicker
                value={toDate}
                onChange={setToDate}
                label="To Date"
                required
              />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {(isLoading || instituteLoading) && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="animate-spin w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading cash summary data...</p>
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
                    <p><strong>Period:</strong> {formatDate(data.from_date)} to {formatDate(data.to_date)}</p>
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

            {/* Cash Flow Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Opening Balance */}
              <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Wallet className="w-6 h-6 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Opening Cash</h3>
                </div>
                <p className="text-2xl font-bold text-gray-700">৳{formatCurrency(data.total_opening)}</p>
                <p className="text-sm text-gray-600 mt-1">{data.opening_balances.length} accounts</p>
              </div>

              {/* Cash Inflows */}
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <ArrowDown className="w-6 h-6 text-green-600" />
                  <h3 className="font-semibold text-green-900">Cash Inflows</h3>
                </div>
                <p className="text-2xl font-bold text-green-700">৳{formatCurrency(data.total_income)}</p>
                <p className="text-sm text-green-600 mt-1">{data.income_grouped.length} sources</p>
              </div>

              {/* Cash Outflows */}
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <ArrowUp className="w-6 h-6 text-red-600" />
                  <h3 className="font-semibold text-red-900">Cash Outflows</h3>
                </div>
                <p className="text-2xl font-bold text-red-700">৳{formatCurrency(data.total_expense)}</p>
                <p className="text-sm text-red-600 mt-1">{data.expense_grouped.length} items</p>
              </div>

              {/* Net Cash Flow */}
              <div className={`rounded-xl p-6 border-2 ${
                hasSurplus 
                  ? 'bg-blue-50 border-blue-200' 
                  : 'bg-orange-50 border-orange-200'
              }`}>
                <div className="flex items-center gap-3 mb-3">
                  {hasSurplus ? (
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  ) : (
                    <TrendingDown className="w-6 h-6 text-orange-600" />
                  )}
                  <h3 className={`font-semibold ${
                    hasSurplus ? 'text-blue-900' : 'text-orange-900'
                  }`}>
                    Net Flow
                  </h3>
                </div>
                <p className={`text-2xl font-bold ${
                  hasSurplus ? 'text-blue-700' : 'text-orange-700'
                }`}>
                  {hasSurplus ? '+' : '-'}৳{formatCurrency(data.surplus)}
                </p>
                <p className={`text-sm mt-1 ${
                  hasSurplus ? 'text-blue-600' : 'text-orange-600'
                }`}>
                  {hasSurplus ? 'Surplus' : 'Deficit'}
                </p>
              </div>

              {/* Closing Balance */}
              <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                  <h3 className="font-semibold text-purple-900">Closing Cash</h3>
                </div>
                <p className="text-2xl font-bold text-purple-700">৳{formatCurrency(data.total_closing)}</p>
                <p className="text-sm text-purple-600 mt-1">{data.closing_balances.length} accounts</p>
              </div>
            </div>

            {/* Cash Flow Visualization */}
            <div className="bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">Cash Flow Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-center text-center">
                <div className="bg-gray-100 rounded-lg p-4">
                  <div className="text-sm text-gray-600 font-medium">Opening</div>
                  <div className="text-lg font-bold text-gray-900">৳{formatCurrency(data.total_opening)}</div>
                </div>
                <ArrowRight className="w-6 h-6 text-gray-400 mx-auto" />
                <div className="bg-green-100 rounded-lg p-4">
                  <div className="text-sm text-green-600 font-medium">+ Inflows</div>
                  <div className="text-lg font-bold text-green-900">৳{formatCurrency(data.total_income)}</div>
                </div>
                <ArrowRight className="w-6 h-6 text-gray-400 mx-auto" />
                <div className="bg-red-100 rounded-lg p-4">
                  <div className="text-sm text-red-600 font-medium">- Outflows</div>
                  <div className="text-lg font-bold text-red-900">৳{formatCurrency(data.total_expense)}</div>
                </div>
                <ArrowRight className="w-6 h-6 text-gray-400 mx-auto" />
                <div className="bg-purple-100 rounded-lg p-4">
                  <div className="text-sm text-purple-600 font-medium">Closing</div>
                  <div className="text-lg font-bold text-purple-900">৳{formatCurrency(data.total_closing)}</div>
                </div>
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
                    placeholder="Search cash items..."
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
                    onClick={() => setShowZeroAmounts(!showZeroAmounts)}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                  >
                    {showZeroAmounts ? 'Hide' : 'Show'} Zero Amounts
                  </button>
                </div>
              </div>
            </div>

            {/* Cash Summary Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm">Description</th>
                      <th className="text-right py-4 px-6 font-semibold text-gray-900 text-sm min-w-[120px]">Amount (৳)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Opening Balances Section */}
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <td className="py-3 px-6">
                        <button
                          onClick={() => toggleSection('Opening')}
                          className="flex items-center gap-2 w-full text-left hover:text-gray-700 transition-colors"
                        >
                          {expandedSections.has('Opening') ? 
                            <ChevronDown className="w-4 h-4 text-gray-600" /> : 
                            <ChevronRight className="w-4 h-4 text-gray-600" />
                          }
                          <Wallet className="w-4 h-4 text-gray-600" />
                          <span className="font-semibold text-gray-900 uppercase tracking-wide text-sm">
                            OPENING CASH BALANCES
                          </span>
                          <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                            {filteredOpening.length}
                          </span>
                        </button>
                      </td>
                      <td className="text-right py-3 px-6 font-semibold text-gray-900">
                        ৳{formatCurrency(data.total_opening)}
                      </td>
                    </tr>
                    
                    {/* Opening Balance Items */}
                    {expandedSections.has('Opening') && filteredOpening.map((item, index) => (
                      <tr 
                        key={`opening-${index}`} 
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3 px-6 pl-12">
                          <span className="text-gray-700">{item.name}</span>
                        </td>
                        <td className="text-right py-3 px-6 font-mono text-sm">
                          <span className="text-gray-700">৳{formatCurrency(item.amount)}</span>
                        </td>
                      </tr>
                    ))}

                    {/* Cash Inflows Section */}
                    <tr className="bg-green-50 border-b border-green-100">
                      <td className="py-3 px-6">
                        <button
                          onClick={() => toggleSection('Income')}
                          className="flex items-center gap-2 w-full text-left hover:text-green-700 transition-colors"
                        >
                          {expandedSections.has('Income') ? 
                            <ChevronDown className="w-4 h-4 text-green-600" /> : 
                            <ChevronRight className="w-4 h-4 text-green-600" />
                          }
                          <ArrowDown className="w-4 h-4 text-green-600" />
                          <span className="font-semibold text-green-900 uppercase tracking-wide text-sm">
                            CASH INFLOWS
                          </span>
                          <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                            {filteredIncome.length}
                          </span>
                        </button>
                      </td>
                      <td className="text-right py-3 px-6 font-semibold text-green-900">
                        ৳{formatCurrency(data.total_income)}
                      </td>
                    </tr>
                    
                    {/* Income Items */}
                    {expandedSections.has('Income') && filteredIncome.map((item, index) => (
                      <tr 
                        key={`income-${index}`} 
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3 px-6 pl-12">
                          <span className="text-gray-700">{item.name}</span>
                        </td>
                        <td className="text-right py-3 px-6 font-mono text-sm">
                          <span className="text-green-700">৳{formatCurrency(item.amount)}</span>
                        </td>
                      </tr>
                    ))}

                    {/* Cash Outflows Section */}
                    <tr className="bg-red-50 border-b border-red-100">
                      <td className="py-3 px-6">
                        <button
                          onClick={() => toggleSection('Expenses')}
                          className="flex items-center gap-2 w-full text-left hover:text-red-700 transition-colors"
                        >
                          {expandedSections.has('Expenses') ? 
                            <ChevronDown className="w-4 h-4 text-red-600" /> : 
                            <ChevronRight className="w-4 h-4 text-red-600" />
                          }
                          <ArrowUp className="w-4 h-4 text-red-600" />
                          <span className="font-semibold text-red-900 uppercase tracking-wide text-sm">
                            CASH OUTFLOWS
                          </span>
                          <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded-full">
                            {filteredExpenses.length}
                          </span>
                        </button>
                      </td>
                      <td className="text-right py-3 px-6 font-semibold text-red-900">
                        ৳{formatCurrency(data.total_expense)}
                      </td>
                    </tr>
                    
                    {/* Expense Items */}
                    {expandedSections.has('Expenses') && filteredExpenses.map((item, index) => (
                      <tr 
                        key={`expense-${index}`} 
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3 px-6 pl-12">
                          <span className="text-gray-700">{item.name}</span>
                        </td>
                        <td className="text-right py-3 px-6 font-mono text-sm">
                          <span className="text-red-700">৳{formatCurrency(item.amount)}</span>
                        </td>
                      </tr>
                    ))}

                    {/* Net Cash Flow */}
                    <tr className={`border-t-2 ${
                      hasSurplus 
                        ? 'bg-blue-600 text-white border-blue-700' 
                        : 'bg-orange-600 text-white border-orange-700'
                    }`}>
                      <td className="py-4 px-6 font-bold text-base">NET CASH FLOW ({hasSurplus ? 'SURPLUS' : 'DEFICIT'})</td>
                      <td className="text-right py-4 px-6 font-bold text-base font-mono">
                        ৳{formatCurrency(data.surplus)}
                      </td>
                    </tr>

                    {/* Closing Balances Section */}
                    <tr className="bg-purple-50 border-b border-purple-100">
                      <td className="py-3 px-6">
                        <button
                          onClick={() => toggleSection('Closing')}
                          className="flex items-center gap-2 w-full text-left hover:text-purple-700 transition-colors"
                        >
                          {expandedSections.has('Closing') ? 
                            <ChevronDown className="w-4 h-4 text-purple-600" /> : 
                            <ChevronRight className="w-4 h-4 text-purple-600" />
                          }
                          <DollarSign className="w-4 h-4 text-purple-600" />
                          <span className="font-semibold text-purple-900 uppercase tracking-wide text-sm">
                            CLOSING CASH BALANCES
                          </span>
                          <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                            {filteredClosing.length}
                          </span>
                        </button>
                      </td>
                      <td className="text-right py-3 px-6 font-semibold text-purple-900">
                        ৳{formatCurrency(data.total_closing)}
                      </td>
                    </tr>
                    
                    {/* Closing Balance Items */}
                    {expandedSections.has('Closing') && filteredClosing.map((item, index) => (
                      <tr 
                        key={`closing-${index}`} 
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3 px-6 pl-12">
                          <span className="text-gray-700">{item.name}</span>
                        </td>
                        <td className="text-right py-3 px-6 font-mono text-sm">
                          <span className="text-purple-700">৳{formatCurrency(item.amount)}</span>
                        </td>
                      </tr>
                    ))}

                    {/* Verification Row */}
                    <tr className="bg-gray-900 text-white border-t-2 border-gray-800">
                      <td className="py-4 px-6 font-bold text-base">VERIFICATION: OPENING + INFLOWS - OUTFLOWS</td>
                      <td className="text-right py-4 px-6 font-bold text-base font-mono">
                        ৳{formatCurrency(data.total_closing)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Cash Flow Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Cash Position Summary */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Cash Position Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Opening Cash Position:</span>
                    <span className="font-semibold font-mono">৳{formatCurrency(data.total_opening)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-green-600">Net Cash Inflows:</span>
                    <span className="font-semibold font-mono text-green-700">+৳{formatCurrency(data.total_income)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-red-600">Net Cash Outflows:</span>
                    <span className="font-semibold font-mono text-red-700">-৳{formatCurrency(data.total_expense)}</span>
                  </div>
                  <hr className="border-gray-200" />
                  <div className="flex justify-between items-center">
                    <span className="text-purple-600 font-medium">Closing Cash Position:</span>
                    <span className="font-bold font-mono text-purple-700 text-lg">৳{formatCurrency(data.total_closing)}</span>
                  </div>
                </div>
              </div>

              {/* Cash Flow Analysis */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Cash Flow Analysis</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Cash Sources:</span>
                    <span className="font-semibold">{data.income_grouped.length} items</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Cash Uses:</span>
                    <span className="font-semibold">{data.expense_grouped.length} items</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Cash Accounts:</span>
                    <span className="font-semibold">{data.closing_balances.length} accounts</span>
                  </div>
                  <hr className="border-gray-200" />
                  <div className={`flex justify-between items-center p-3 rounded-lg ${
                    hasSurplus 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-orange-50 border border-orange-200'
                  }`}>
                    <span className={`font-medium ${
                      hasSurplus ? 'text-green-800' : 'text-orange-800'
                    }`}>
                      Net Cash Flow:
                    </span>
                    <div className="flex items-center gap-2">
                      {hasSurplus ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-orange-600" />
                      )}
                      <span className={`font-bold font-mono ${
                        hasSurplus ? 'text-green-800' : 'text-orange-800'
                      }`}>
                        {hasSurplus ? '+' : '-'}৳{formatCurrency(data.surplus)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>
                    This cash summary shows cash inflows and outflows for the selected period with opening and closing balances.
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span>Report generated: {new Date().toLocaleString()}</span>
                  <span className={`font-medium ${hasSurplus ? 'text-green-600' : 'text-orange-600'}`}>
                    {hasSurplus ? '💰' : '⚠️'} Net Flow: ৳{formatCurrency(data.surplus)}
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
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Generate Cash Summary</h3>
                <p className="text-gray-600 mb-4">
                  Select both start and end dates to generate your cash summary report.
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>Choose date range above to get started</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {!data && !isLoading && fromDate && toDate && (
          <div className="bg-white rounded-xl shadow-sm border border-red-200 p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-red-900 mb-2">No Data Available</h3>
                <p className="text-red-600">
                  No cash summary data found for the selected date range.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CashSummary;