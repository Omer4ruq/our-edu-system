// import IncomeStatementTable from "./reports/income-statement/IncomeStatementTable";
// import SearchByDateRange from "./reports/SearchByDateRange";

// const IncomeStatement = () => {
//     // const { t } = useTranslation();
//   return (
//     <div className="bg-[#441a05]rounded-md px-4 py-2 my-2 sm:my-4">
//       <SearchByDateRange />

//       <h3 className="text-2xl font-medium text-center mt-2">
//         {/* {t("module.accounts.cash_summary_list")} */}
//         Income Statement
//       </h3>
//       <IncomeStatementTable />
//     </div>
//   );
// };

// export default IncomeStatement;

import React, { useState } from 'react';
import { 
  Calendar, 
  Download, 
  FileText, 
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Settings,
  Search,
  Eye,
  EyeOff
} from 'lucide-react';

// Import your actual hooks
import { useGetIncomeStatementQuery } from '../../redux/features/api/accounts/financialReports/financialReportsApi';
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

const IncomeStatement = () => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showZeroAmounts, setShowZeroAmounts] = useState(false);

  const { data, isLoading } = useGetIncomeStatementQuery({
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

    const isProfit = data.status === 'Profit';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Income Statement</title>
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
          
          /* Performance Status */
          .performance-status {
            background: ${isProfit ? '#f0fdf4' : '#fef2f2'};
            border: 1px solid ${isProfit ? '#22c55e' : '#ef4444'};
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
            color: ${isProfit ? '#16a34a' : '#dc2626'};
            font-weight: 600;
          }
          .status-dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: ${isProfit ? '#22c55e' : '#ef4444'};
          }
          .net-amount {
            font-size: 12pt;
            font-weight: 700;
            color: ${isProfit ? '#16a34a' : '#dc2626'};
          }
          
          /* Table */
          .income-statement-table {
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
          
          .net-result {
            background: ${isProfit ? '#dcfce7' : '#fee2e2'};
            color: ${isProfit ? '#166534' : '#991b1b'};
            border: 2px solid ${isProfit ? '#22c55e' : '#ef4444'};
          }
          .net-result td {
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
          <h1>Income Statement</h1>
          <div class="report-period">
            For the Period: ${formatDate(data.from_date)} to ${formatDate(data.to_date)}
          </div>
        </div>
        
        <!-- Performance Status -->
        <div class="performance-status">
          <div class="status-indicator">
            <div class="status-dot"></div>
            <span>Net ${data.status}: ৳${formatCurrency(data.net_profit)}</span>
          </div>
          <div class="net-amount">
            ${isProfit ? '+' : '-'}৳${formatCurrency(data.net_profit)}
          </div>
        </div>
        
        <!-- Table -->
        <table class="income-statement-table">
          <thead class="table-header">
            <tr>
              <th>Description</th>
              <th class="amount-header">Amount (৳)</th>
            </tr>
          </thead>
          <tbody>
            <!-- Revenue Section -->
            <tr class="section-header">
              <td colspan="2">REVENUE / INCOME (${data.income_details.length} items)</td>
            </tr>
            ${data.income_details.map(item => `
              <tr class="item-row">
                <td class="item-name">${item.name}</td>
                <td class="amount">${formatCurrency(item.amount)}</td>
              </tr>
            `).join('')}
            <tr class="section-total">
              <td><strong>TOTAL REVENUE</strong></td>
              <td class="amount"><strong>${formatCurrency(data.total_income)}</strong></td>
            </tr>
            
            <!-- Expenses Section -->
            <tr class="section-header">
              <td colspan="2">EXPENSES (${data.expense_details.length} items)</td>
            </tr>
            ${data.expense_details.map(item => `
              <tr class="item-row">
                <td class="item-name">${item.name}</td>
                <td class="amount">${formatCurrency(item.amount)}</td>
              </tr>
            `).join('')}
            <tr class="section-total">
              <td><strong>TOTAL EXPENSES</strong></td>
              <td class="amount"><strong>${formatCurrency(data.total_expenses)}</strong></td>
            </tr>
            
            <!-- Net Result -->
            <tr class="net-result">
              <td><strong>NET ${data.status.toUpperCase()}</strong></td>
              <td class="amount"><strong>${formatCurrency(data.net_profit)}</strong></td>
            </tr>
          </tbody>
        </table>
        
        <!-- Footer -->
        <div class="report-footer">
          <div>
            <div><strong>Generated:</strong> ${currentDate}</div>
            <div><strong>Revenue Items:</strong> ${data.income_details.length} | <strong>Expense Items:</strong> ${data.expense_details.length}</div>
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

  const filteredIncome = data ? filterItems(data.income_details, searchTerm, showZeroAmounts) : [];
  const filteredExpenses = data ? filterItems(data.expense_details, searchTerm, showZeroAmounts) : [];
  
  const isProfit = data?.status === 'Profit';

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Income Statement</h1>
              <p className="text-gray-600">Revenue, expenses, and net profit analysis for the selected period</p>
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
            <p className="text-gray-600">Loading income statement data...</p>
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

            {/* Performance Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Net Profit/Loss */}
              <div className={`rounded-xl p-6 border-2 ${
                isProfit 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center gap-3 mb-3">
                  {isProfit ? (
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  ) : (
                    <TrendingDown className="w-6 h-6 text-red-600" />
                  )}
                  <h3 className={`font-semibold ${
                    isProfit ? 'text-green-900' : 'text-red-900'
                  }`}>
                    Net {data.status}
                  </h3>
                </div>
                <p className={`text-2xl font-bold ${
                  isProfit ? 'text-green-700' : 'text-red-700'
                }`}>
                  ৳{formatCurrency(data.net_profit)}
                </p>
              </div>

              {/* Total Revenue */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                  <h3 className="font-semibold text-blue-900">Total Revenue</h3>
                </div>
                <p className="text-2xl font-bold text-blue-700">৳{formatCurrency(data.total_income)}</p>
                <p className="text-sm text-blue-600 mt-1">{data.income_details.length} income sources</p>
              </div>

              {/* Total Expenses */}
              <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <TrendingDown className="w-6 h-6 text-orange-600" />
                  <h3 className="font-semibold text-orange-900">Total Expenses</h3>
                </div>
                <p className="text-2xl font-bold text-orange-700">৳{formatCurrency(data.total_expenses)}</p>
                <p className="text-sm text-orange-600 mt-1">{data.expense_details.length} expense items</p>
              </div>

              {/* Controls */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  View Options
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Show Zero Amounts</label>
                    <button
                      onClick={() => setShowZeroAmounts(!showZeroAmounts)}
                      className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                    >
                      {showZeroAmounts ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      {showZeroAmounts ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search income and expense items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            </div>

            {/* Income Statement Table */}
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
                    {/* Revenue Section */}
                    <tr className="bg-green-50 border-b border-green-100">
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                          <span className="font-semibold text-green-900 uppercase tracking-wide text-sm">
                            REVENUE / INCOME
                          </span>
                          <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                            {filteredIncome.length}
                          </span>
                        </div>
                      </td>
                      <td className="text-right py-3 px-6 font-semibold text-green-900">
                        ৳{formatCurrency(data.total_income)}
                      </td>
                    </tr>
                    
                    {/* Income Items */}
                    {filteredIncome.map((item, index) => (
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

                    {/* Total Revenue */}
                    <tr className="bg-green-100 border-b-2 border-green-200">
                      <td className="py-3 px-6 font-bold text-green-900">TOTAL REVENUE</td>
                      <td className="text-right py-3 px-6 font-bold text-green-900 font-mono">
                        ৳{formatCurrency(data.total_income)}
                      </td>
                    </tr>

                    {/* Expenses Section */}
                    <tr className="bg-red-50 border-b border-red-100">
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-2">
                          <TrendingDown className="w-4 h-4 text-red-600" />
                          <span className="font-semibold text-red-900 uppercase tracking-wide text-sm">
                            EXPENSES
                          </span>
                          <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded-full">
                            {filteredExpenses.length}
                          </span>
                        </div>
                      </td>
                      <td className="text-right py-3 px-6 font-semibold text-red-900">
                        ৳{formatCurrency(data.total_expenses)}
                      </td>
                    </tr>
                    
                    {/* Expense Items */}
                    {filteredExpenses.map((item, index) => (
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

                    {/* Total Expenses */}
                    <tr className="bg-red-100 border-b-2 border-red-200">
                      <td className="py-3 px-6 font-bold text-red-900">TOTAL EXPENSES</td>
                      <td className="text-right py-3 px-6 font-bold text-red-900 font-mono">
                        ৳{formatCurrency(data.total_expenses)}
                      </td>
                    </tr>

                    {/* Net Result */}
                    <tr className={`border-t-2 ${
                      isProfit 
                        ? 'bg-green-600 text-white border-green-700' 
                        : 'bg-red-600 text-white border-red-700'
                    }`}>
                      <td className="py-4 px-6 font-bold text-base">NET {data.status.toUpperCase()}</td>
                      <td className="text-right py-4 px-6 font-bold text-base font-mono">
                        ৳{formatCurrency(data.net_profit)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>
                    This income statement shows revenue and expenses for the selected period, resulting in net {data.status.toLowerCase()}.
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span>Report generated: {new Date().toLocaleString()}</span>
                  <span className={`font-medium ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                    {isProfit ? '📈' : '📉'} {data.status}: ৳{formatCurrency(data.net_profit)}
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
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Generate Income Statement</h3>
                <p className="text-gray-600 mb-4">
                  Select both start and end dates to generate your income statement report.
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
                  No income statement data found for the selected date range.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IncomeStatement;