import React, { useState } from 'react';
import { 
  Calendar, 
  Download, 
  FileText, 
  ChevronDown, 
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Filter,
  Search,
  Eye,
  EyeOff,
  Settings
} from 'lucide-react';

// Import your actual hooks - adjust the import path as needed
import { useGetTrialBalanceQuery } from '../../redux/features/api/accounts/financialReports/financialReportsApi';
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

const TrialBalance = () => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [expandedCategories, setExpandedCategories] = useState(new Set(['Assets', 'Liabilities', 'Equity', 'Revenue', 'Expenses']));
  const [searchTerm, setSearchTerm] = useState('');
  const [showZeroBalances, setShowZeroBalances] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const { data, isLoading } = useGetTrialBalanceQuery({
    from_date: fromDate,
    to_date: toDate
  });

  const { data: institute, isLoading: instituteLoading } = useGetInstituteLatestQuery();
console.log(institute)
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

  const toggleCategory = (category) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const groupedData = data?.trial_balance?.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {}) || {};

  const getCategoryTotals = (category) => {
    const items = groupedData[category] || [];
    return items.reduce(
      (totals, item) => ({
        debit: totals.debit + item.debit,
        credit: totals.credit + item.credit
      }),
      { debit: 0, credit: 0 }
    );
  };

  const filteredData = Object.keys(groupedData).reduce((acc, category) => {
    if (selectedCategory !== 'All' && selectedCategory !== category) {
      return acc;
    }
    
    const filtered = groupedData[category].filter(item => {
      const matchesSearch = item.ledger.toLowerCase().includes(searchTerm.toLowerCase());
      const hasBalance = showZeroBalances || item.debit !== 0 || item.credit !== 0;
      return matchesSearch && hasBalance;
    });
    
    if (filtered.length > 0) {
      acc[category] = filtered;
    }
    return acc;
  }, {});

  const generateProfessionalReport = () => {
    if (!data || !institute) return;
    
    const currentDate = new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const categoryTotals = {};
    Object.keys(groupedData).forEach(category => {
      categoryTotals[category] = getCategoryTotals(category);
    });

    const isBalanced = Math.abs(data.total_debit - data.total_credit) < 0.01;
    const difference = Math.abs(data.total_debit - data.total_credit);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Trial Balance Report</title>
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
          .difference {
            font-size: 9pt;
            color: #6b7280;
          }
          
          /* Table */
          .trial-balance-table {
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
          
          .category-header {
            background: #3b82f6;
            color: white;
          }
          .category-header td {
            padding: 10px 16px;
            font-size: 9pt;
            font-weight: 600;
            text-transform: uppercase;
          }
          
          .account-row {
            border-bottom: 1px solid #f3f4f6;
          }
          .account-row:nth-child(even) {
            background: #fafafa;
          }
          .account-row td {
            padding: 8px 16px;
            font-size: 9pt;
            vertical-align: middle;
          }
          .account-name {
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
          
          .category-total {
            background: #f1f5f9;
            border-top: 1px solid #cbd5e1;
            border-bottom: 2px solid #cbd5e1;
          }
          .category-total td {
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
            <div class="company-name">${institute?.institute_Bangla_name || 'Company Name'}</div>
            <div class="company-address">${institute?.institute_address || 'Company Address'}</div>
          </div>
          ${institute?.institute_logo ? `<img src="${institute.institute_logo}" alt="Logo" class="company-logo" />` : ''}
        </div>
        
        <!-- Title -->
        <div class="report-title">
          <h1>Trial Balance Report</h1>
          <div class="report-period">
            Period: ${formatDate(data.from_date)} to ${formatDate(data.to_date)}
          </div>
        </div>
        
        <!-- Balance Status -->
        <div class="balance-status">
          <div class="status-indicator">
            <div class="status-dot"></div>
            <span>Status: ${isBalanced ? 'Balanced' : 'Unbalanced'}</span>
          </div>
          <div class="difference">
            ${difference > 0 ? `Difference: ${formatCurrency(difference)}` : 'Perfect Balance'}
          </div>
        </div>
        
        <!-- Table -->
        <table class="trial-balance-table">
          <thead class="table-header">
            <tr>
              <th>Account Name</th>
              <th class="amount-header">Debit (৳)</th>
              <th class="amount-header">Credit (৳)</th>
            </tr>
          </thead>
          <tbody>
            ${Object.keys(groupedData).map(category => `
              <tr class="category-header">
                <td colspan="3">${category.toUpperCase()} (${groupedData[category].length} accounts)</td>
              </tr>
              ${groupedData[category].map(item => `
                <tr class="account-row">
                  <td class="account-name">${item.ledger}</td>
                  <td class="amount ${item.debit === 0 ? 'zero-amount' : ''}">${item.debit > 0 ? formatCurrency(item.debit) : '—'}</td>
                  <td class="amount ${item.credit === 0 ? 'zero-amount' : ''}">${item.credit > 0 ? formatCurrency(item.credit) : '—'}</td>
                </tr>
              `).join('')}
              <tr class="category-total">
                <td><strong>TOTAL ${category.toUpperCase()}</strong></td>
                <td class="amount"><strong>${formatCurrency(categoryTotals[category].debit)}</strong></td>
                <td class="amount"><strong>${formatCurrency(categoryTotals[category].credit)}</strong></td>
              </tr>
            `).join('')}
            
            <tr class="grand-total">
              <td><strong>GRAND TOTAL</strong></td>
              <td class="amount"><strong>${formatCurrency(data.total_debit)}</strong></td>
              <td class="amount"><strong>${formatCurrency(data.total_credit)}</strong></td>
            </tr>
          </tbody>
        </table>
        
        <!-- Footer -->
        <div class="report-footer">
          <div>
            <div><strong>Generated:</strong> ${currentDate}</div>
            <div><strong>Accounts:</strong> ${data.trial_balance.length} | <strong>Categories:</strong> ${Object.keys(groupedData).length}</div>
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

  const categories = ['All', ...new Set(data?.trial_balance?.map(item => item.category) || [])];
  const isBalanced = data ? Math.abs(data.total_debit - data.total_credit) < 0.01 : false;
  const difference = data ? Math.abs(data.total_debit - data.total_credit) : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Trial Balance</h1>
              <p className="text-gray-600">Verify the mathematical accuracy of your accounting records</p>
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
            <p className="text-gray-600">Loading trial balance data...</p>
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
                    <h2 className="text-xl font-bold text-gray-900">{institute?.institute_Bangla_name || 'Institute Name'}</h2>
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

            {/* Balance Status & Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                    {isBalanced ? 'Balanced' : 'Unbalanced'}
                  </h3>
                </div>
                <p className={`text-sm ${
                  isBalanced ? 'text-green-700' : 'text-red-700'
                }`}>
                  {isBalanced 
                    ? 'Debits equal credits - books are balanced' 
                    : `Difference: ৳${formatCurrency(difference)}`
                  }
                </p>
              </div>

              {/* Summary Stats */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Accounts:</span>
                    <span className="font-medium">{data.trial_balance.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Categories:</span>
                    <span className="font-medium">{Object.keys(groupedData).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Debits:</span>
                    <span className="font-medium font-mono">৳{formatCurrency(data.total_debit)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Credits:</span>
                    <span className="font-medium font-mono">৳{formatCurrency(data.total_credit)}</span>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  View Options
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Filter Category</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-gray-700">Show Zero Balances</label>
                    <button
                      onClick={() => setShowZeroBalances(!showZeroBalances)}
                      className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                    >
                      {showZeroBalances ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      {showZeroBalances ? 'Hide' : 'Show'}
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
                  placeholder="Search accounts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            </div>

            {/* Trial Balance Table */}
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
                    {Object.keys(filteredData).map(category => {
                      const categoryTotals = getCategoryTotals(category);
                      const isExpanded = expandedCategories.has(category);
                      
                      return (
                        <React.Fragment key={category}>
                          {/* Category Header */}
                          <tr className="bg-blue-50 border-b border-blue-100">
                            <td className="py-3 px-6">
                              <button
                                onClick={() => toggleCategory(category)}
                                className="flex items-center gap-2 w-full text-left hover:text-blue-700 transition-colors"
                              >
                                {isExpanded ? 
                                  <ChevronDown className="w-4 h-4 text-blue-600" /> : 
                                  <ChevronRight className="w-4 h-4 text-blue-600" />
                                }
                                <span className="font-semibold text-blue-900 uppercase tracking-wide text-sm">
                                  {category}
                                </span>
                                <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                                  {filteredData[category].length}
                                </span>
                              </button>
                            </td>
                            <td className="text-right py-3 px-6 font-semibold text-blue-900">
                              {categoryTotals.debit > 0 ? formatCurrency(categoryTotals.debit) : '—'}
                            </td>
                            <td className="text-right py-3 px-6 font-semibold text-blue-900">
                              {categoryTotals.credit > 0 ? formatCurrency(categoryTotals.credit) : '—'}
                            </td>
                          </tr>
                          
                          {/* Category Items */}
                          {isExpanded && filteredData[category].map((item, index) => (
                            <tr 
                              key={`${category}-${index}`} 
                              className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                            >
                              <td className="py-3 px-6 pl-12">
                                <span className="text-gray-700">{item.ledger}</span>
                              </td>
                              <td className="text-right py-3 px-6 font-mono text-sm">
                                {item.debit > 0 ? (
                                  <span className="text-gray-900">{formatCurrency(item.debit)}</span>
                                ) : (
                                  <span className="text-gray-400">—</span>
                                )}
                              </td>
                              <td className="text-right py-3 px-6 font-mono text-sm">
                                {item.credit > 0 ? (
                                  <span className="text-gray-900">{formatCurrency(item.credit)}</span>
                                ) : (
                                  <span className="text-gray-400">—</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </React.Fragment>
                      );
                    })}
                    
                    {/* Grand Total */}
                    <tr className="bg-gray-900 text-white border-t-2 border-gray-800">
                      <td className="py-4 px-6 font-bold text-base">GRAND TOTAL</td>
                      <td className="text-right py-4 px-6 font-bold text-base font-mono">
                        {formatCurrency(data.total_debit)}
                      </td>
                      <td className="text-right py-4 px-6 font-bold text-base font-mono">
                        {formatCurrency(data.total_credit)}
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
                    This trial balance verifies that total debits equal total credits in your accounting system.
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span>Report generated: {new Date().toLocaleString()}</span>
                  {difference > 0 && (
                    <span className="text-red-600 font-medium">
                      ⚠ Variance: ৳{formatCurrency(difference)}
                    </span>
                  )}
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
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Generate Trial Balance</h3>
                <p className="text-gray-600 mb-4">
                  Select both start and end dates to generate your trial balance report.
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
                  No trial balance data found for the selected date range.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrialBalance;