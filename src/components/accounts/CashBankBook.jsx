import React, { useState, useRef, useEffect } from 'react';
import { 
  Calendar, 
  Download, 
  FileText, 
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  X,
  Book,
  Receipt,
  CreditCard,
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Settings,
  Search,
  Eye,
  EyeOff
} from 'lucide-react';

// Import your actual hooks
import { useGetCashBankBookQuery } from '../../redux/features/api/accounts/financialReports/financialReportsApi';
import { useGetInstituteLatestQuery } from '../../redux/features/api/institute/instituteLatestApi';

// Custom Beautiful Date Picker Component
const BeautifulDatePicker = ({ value, onChange, label, required = false, placeholder = "Select date" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : null);
  const datePickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (value) {
      setSelectedDate(new Date(value));
      setCurrentMonth(new Date(value));
    }
  }, [value]);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Previous month's trailing days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const day = new Date(year, month, -i);
      days.push({ date: day, isCurrentMonth: false });
    }

    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({ date, isCurrentMonth: true });
    }

    // Next month's leading days
    const remainingCells = 42 - days.length;
    for (let day = 1; day <= remainingCells; day++) {
      const date = new Date(year, month + 1, day);
      days.push({ date, isCurrentMonth: false });
    }

    return days;
  };

  const handleDateSelect = (date) => {
    const formattedDate = date.toISOString().split('T')[0];
    setSelectedDate(date);
    onChange(formattedDate);
    setIsOpen(false);
  };

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + direction);
      return newMonth;
    });
  };

  const navigateYear = (direction) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setFullYear(prev.getFullYear() + direction);
      return newMonth;
    });
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  const formatDisplayDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <div className="space-y-2" ref={datePickerRef}>
      <label className="block text-sm font-semibold text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-3 pl-12 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-left shadow-sm hover:shadow-md"
        >
          <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <span className={selectedDate ? "text-gray-900 font-medium" : "text-gray-500"}>
            {selectedDate ? formatDisplayDate(selectedDate) : placeholder}
          </span>
          <ChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-4">
            <div className="fixed inset-0 bg-black bg-opacity-10" onClick={() => setIsOpen(false)}></div>
            <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 mx-4 max-w-sm w-full animate-in slide-in-from-top-2 duration-200">
              
              {/* Header with Month/Year Navigation */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigateYear(-1)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-600" />
                    <ChevronLeft className="w-4 h-4 text-gray-600 -ml-2" />
                  </button>
                  <button
                    onClick={() => navigateMonth(-1)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
                
                <div className="text-center">
                  <h3 className="text-lg font-bold text-gray-900">
                    {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </h3>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigateMonth(1)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => navigateYear(1)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                    <ChevronRight className="w-4 h-4 text-gray-600 -ml-2" />
                  </button>
                </div>
              </div>

              {/* Days of Week Header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {daysOfWeek.map(day => (
                  <div key={day} className="text-center text-xs font-semibold text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => {
                  const today = isToday(day.date);
                  const selected = isSelected(day.date);
                  const currentMonth = day.isCurrentMonth;

                  return (
                    <button
                      key={index}
                      onClick={() => handleDateSelect(day.date)}
                      className={`
                        relative p-3 text-sm rounded-lg font-medium transition-all duration-150 hover:scale-105
                        ${currentMonth 
                          ? selected 
                            ? 'bg-blue-500 text-white shadow-lg scale-105' 
                            : today 
                              ? 'bg-blue-50 text-blue-600 border-2 border-blue-200 font-bold' 
                              : 'text-gray-900 hover:bg-blue-50 hover:text-blue-600'
                          : 'text-gray-300 hover:text-gray-400'
                        }
                      `}
                    >
                      {day.date.getDate()}
                      {today && !selected && (
                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full"></div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Footer with Today button */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleDateSelect(new Date())}
                  className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors"
                >
                  Today
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const CashBankBook = () => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showZeroAmounts, setShowZeroAmounts] = useState(false);
  const [expandedBooks, setExpandedBooks] = useState(new Set());

  const { data, isLoading } = useGetCashBankBookQuery({
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
      month: 'short',
      day: 'numeric'
    });
  };

  const toggleBook = (ledger) => {
    const newExpanded = new Set(expandedBooks);
    if (newExpanded.has(ledger)) {
      newExpanded.delete(ledger);
    } else {
      newExpanded.add(ledger);
    }
    setExpandedBooks(newExpanded);
  };

  const getVoucherTypeIcon = (vchType) => {
    switch (vchType) {
      case 'Receipt':
        return <TrendingDown className="w-4 h-4 text-green-600" />;
      case 'Payment':
        return <TrendingUp className="w-4 h-4 text-red-600" />;
      case 'Contra In':
      case 'Contra Out':
        return <ArrowLeftRight className="w-4 h-4 text-blue-600" />;
      default:
        return <Receipt className="w-4 h-4 text-gray-600" />;
    }
  };

  const getVoucherTypeColor = (vchType) => {
    switch (vchType) {
      case 'Receipt':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Payment':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Contra In':
      case 'Contra Out':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
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

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Cash Bank Book Report</title>
        <meta charset="UTF-8">
        <style>
          @page { 
            size: A4 landscape; 
            margin: 10mm; 
          }
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 9pt;
            line-height: 1.3;
            color: #1f2937;
          }
          
          /* Header */
          .report-header {
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 15px;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .company-info {
            flex-grow: 1;
          }
          .company-name {
            font-size: 16pt;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 3px;
          }
          .company-address {
            font-size: 8pt;
            color: #6b7280;
          }
          .company-logo {
            width: 40px;
            height: 40px;
            object-fit: contain;
            border-radius: 4px;
          }
          
          /* Report Title */
          .report-title {
            text-align: center;
            margin-bottom: 20px;
          }
          .report-title h1 {
            font-size: 14pt;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 6px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .report-period {
            font-size: 10pt;
            color: #6b7280;
            font-weight: 500;
          }
          
          /* Summary */
          .summary-section {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 15px;
            margin-bottom: 20px;
            display: flex;
            justify-content: space-around;
          }
          .summary-item {
            text-align: center;
          }
          .summary-label {
            font-size: 8pt;
            color: #64748b;
            text-transform: uppercase;
            font-weight: 600;
            margin-bottom: 4px;
          }
          .summary-amount {
            font-size: 11pt;
            font-weight: 700;
            color: #1e293b;
          }
          
          /* Table */
          .cash-book-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
            border: 1px solid #e5e7eb;
            font-size: 8pt;
          }
          
          .table-header {
            background: #f8fafc;
            border-bottom: 2px solid #e5e7eb;
          }
          .table-header th {
            padding: 8px 6px;
            text-align: left;
            font-weight: 600;
            font-size: 8pt;
            color: #374151;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            border: 1px solid #e5e7eb;
          }
          
          .ledger-header {
            background: #3b82f6;
            color: white;
          }
          .ledger-header td {
            padding: 8px 6px;
            font-size: 8pt;
            font-weight: 600;
            text-transform: uppercase;
            border: 1px solid #2563eb;
          }
          
          .entry-row {
            border-bottom: 1px solid #f3f4f6;
          }
          .entry-row:nth-child(even) {
            background: #fafafa;
          }
          .entry-row td {
            padding: 6px;
            font-size: 8pt;
            vertical-align: middle;
            border: 1px solid #f3f4f6;
          }
          
          .amount {
            text-align: right;
            font-family: 'Courier New', monospace;
            font-weight: 500;
          }
          
          .ledger-total {
            background: #f1f5f9;
            border-top: 2px solid #cbd5e1;
            font-weight: 600;
          }
          .ledger-total td {
            padding: 8px 6px;
            border: 1px solid #cbd5e1;
          }
          
          .voucher-type {
            font-size: 7pt;
            padding: 2px 6px;
            border-radius: 4px;
            font-weight: 600;
          }
          .receipt { background: #dcfce7; color: #166534; }
          .payment { background: #fee2e2; color: #991b1b; }
          .contra { background: #dbeafe; color: #1e40af; }
          
          /* Footer */
          .report-footer {
            margin-top: 20px;
            padding-top: 10px;
            border-top: 1px solid #e5e7eb;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 7pt;
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
          <h1>Cash & Bank Book</h1>
          <div class="report-period">
            For the Period: ${formatDate(data.from_date)} to ${formatDate(data.to_date)}
          </div>
        </div>
        
        <!-- Summary -->
        <div class="summary-section">
          <div class="summary-item">
            <div class="summary-label">Total Debit</div>
            <div class="summary-amount">৳${formatCurrency(data.overall_debit)}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Total Credit</div>
            <div class="summary-amount">৳${formatCurrency(data.overall_credit)}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Books Count</div>
            <div class="summary-amount">${data.books.length}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Total Entries</div>
            <div class="summary-amount">${data.books.reduce((sum, book) => sum + book.entries.length, 0)}</div>
          </div>
        </div>
        
        <!-- Cash Book Table -->
        <table class="cash-book-table">
          <thead class="table-header">
            <tr>
              <th>Date</th>
              <th>Voucher</th>
              <th>Particulars</th>
              <th>Cash/Bank</th>
              <th>Debit</th>
              <th>Credit</th>
            </tr>
          </thead>
          <tbody>
            ${data.books.map(book => `
              <!-- Ledger Header -->
              <tr class="ledger-header">
                <td colspan="6">
                  <strong>${book.ledger}</strong> - ${book.cash_eq}
                  (${book.entries.length} entries | Debit: ৳${formatCurrency(book.total_debit)} | Credit: ৳${formatCurrency(book.total_credit)})
                </td>
              </tr>
              
              <!-- Entries -->
              ${book.entries.map(entry => `
                <tr class="entry-row">
                  <td>${formatDate(entry.date)}</td>
                  <td>
                    <span class="voucher-type ${entry.vch_type.toLowerCase().includes('receipt') ? 'receipt' : entry.vch_type.toLowerCase().includes('payment') ? 'payment' : 'contra'}">
                      ${entry.vch_type}
                    </span><br>
                    <small>${entry.vch_no}</small>
                  </td>
                  <td>${entry.particulars}</td>
                  <td>${book.cash_eq}</td>
                  <td class="amount">${entry.debit > 0 ? formatCurrency(entry.debit) : '—'}</td>
                  <td class="amount">${entry.credit > 0 ? formatCurrency(entry.credit) : '—'}</td>
                </tr>
              `).join('')}
              
              <!-- Ledger Total -->
              <tr class="ledger-total">
                <td colspan="4"><strong>TOTAL ${book.ledger.toUpperCase()}</strong></td>
                <td class="amount"><strong>${formatCurrency(book.total_debit)}</strong></td>
                <td class="amount"><strong>${formatCurrency(book.total_credit)}</strong></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <!-- Footer -->
        <div class="report-footer">
          <div>
            <div><strong>Generated:</strong> ${currentDate}</div>
            <div><strong>Total Books:</strong> ${data.books.length} | <strong>Total Entries:</strong> ${data.books.reduce((sum, book) => sum + book.entries.length, 0)}</div>
          </div>
          <div>
            <div><strong>Overall Debit:</strong> ৳${formatCurrency(data.overall_debit)}</div>
            <div><strong>Overall Credit:</strong> ৳${formatCurrency(data.overall_credit)}</div>
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

  const filteredBooks = data ? data.books.filter(book => {
    const matchesSearch = book.ledger.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.cash_eq.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.entries.some(entry => 
                           entry.particulars.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           entry.vch_no.toLowerCase().includes(searchTerm.toLowerCase())
                         );
    const hasEntries = showZeroAmounts || book.entries.length > 0;
    return matchesSearch && hasEntries;
  }) : [];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Cash & Bank Book</h1>
              <p className="text-gray-600">Detailed cash and bank transaction records with voucher details</p>
            </div>
            
            {/* Beautiful Date Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <BeautifulDatePicker
                value={fromDate}
                onChange={setFromDate}
                label="From Date"
                required
                placeholder="Select start date"
              />
              <BeautifulDatePicker
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
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="animate-spin w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading cash bank book data...</p>
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

            {/* Cash Book Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Total Debits */}
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                  <h3 className="font-semibold text-green-900">Total Debits</h3>
                </div>
                <p className="text-2xl font-bold text-green-700">৳{formatCurrency(data.overall_debit)}</p>
                <p className="text-sm text-green-600 mt-1">All debit entries</p>
              </div>

              {/* Total Credits */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <TrendingDown className="w-6 h-6 text-blue-600" />
                  <h3 className="font-semibold text-blue-900">Total Credits</h3>
                </div>
                <p className="text-2xl font-bold text-blue-700">৳{formatCurrency(data.overall_credit)}</p>
                <p className="text-sm text-blue-600 mt-1">All credit entries</p>
              </div>

              {/* Total Books */}
              <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Book className="w-6 h-6 text-purple-600" />
                  <h3 className="font-semibold text-purple-900">Cash Books</h3>
                </div>
                <p className="text-2xl font-bold text-purple-700">{data.books.length}</p>
                <p className="text-sm text-purple-600 mt-1">Ledger accounts</p>
              </div>

              {/* Total Entries */}
              <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Receipt className="w-6 h-6 text-orange-600" />
                  <h3 className="font-semibold text-orange-900">Total Entries</h3>
                </div>
                <p className="text-2xl font-bold text-orange-700">
                  {data.books.reduce((sum, book) => sum + book.entries.length, 0)}
                </p>
                <p className="text-sm text-orange-600 mt-1">All transactions</p>
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
                    placeholder="Search ledgers, accounts, vouchers..."
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
                    {showZeroAmounts ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    {showZeroAmounts ? 'Hide' : 'Show'} Empty Books
                  </button>
                </div>
              </div>
            </div>

            {/* Cash Bank Book Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm">Date</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm">Voucher Details</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm">Particulars</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm">Cash/Bank</th>
                      <th className="text-right py-4 px-6 font-semibold text-gray-900 text-sm min-w-[120px]">Debit (৳)</th>
                      <th className="text-right py-4 px-6 font-semibold text-gray-900 text-sm min-w-[120px]">Credit (৳)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBooks.map((book, bookIndex) => (
                      <React.Fragment key={bookIndex}>
                        {/* Ledger Header */}
                        <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                          <td className="py-4 px-6" colSpan="6">
                            <button
                              onClick={() => toggleBook(book.ledger)}
                              className="flex items-center gap-3 w-full text-left hover:text-blue-700 transition-colors"
                            >
                              {expandedBooks.has(book.ledger) ? 
                                <ChevronDown className="w-5 h-5 text-blue-600" /> : 
                                <ChevronRight className="w-5 h-5 text-blue-600" />
                              }
                              <Book className="w-5 h-5 text-blue-600" />
                              <div className="flex-grow">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <span className="font-bold text-blue-900 text-lg">{book.ledger}</span>
                                    <span className="text-blue-700 ml-2">({book.cash_eq})</span>
                                  </div>
                                  <div className="flex items-center gap-6 text-sm">
                                    <span className="text-blue-600">
                                      <strong>{book.entries.length}</strong> entries
                                    </span>
                                    <span className="text-green-700 font-semibold">
                                      Dr: ৳{formatCurrency(book.total_debit)}
                                    </span>
                                    <span className="text-blue-700 font-semibold">
                                      Cr: ৳{formatCurrency(book.total_credit)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </button>
                          </td>
                        </tr>
                        
                        {/* Book Entries */}
                        {expandedBooks.has(book.ledger) && book.entries.map((entry, entryIndex) => (
                          <tr 
                            key={`${bookIndex}-${entryIndex}`} 
                            className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                          >
                            <td className="py-3 px-6 pl-12">
                              <span className="text-gray-700 font-medium">{formatDate(entry.date)}</span>
                            </td>
                            <td className="py-3 px-6">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  {getVoucherTypeIcon(entry.vch_type)}
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getVoucherTypeColor(entry.vch_type)}`}>
                                    {entry.vch_type}
                                  </span>
                                </div>
                                <div className="text-xs text-gray-500 font-mono">{entry.vch_no}</div>
                              </div>
                            </td>
                            <td className="py-3 px-6">
                              <span className="text-gray-700">{entry.particulars}</span>
                            </td>
                            <td className="py-3 px-6">
                              <div className="flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-700 font-medium">{book.cash_eq}</span>
                              </div>
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

                        {/* Book Total */}
                        {expandedBooks.has(book.ledger) && (
                          <tr className="bg-gray-100 border-b-2 border-gray-200">
                            <td className="py-3 px-6 pl-12 font-bold text-gray-900" colSpan="4">
                              TOTAL {book.ledger.toUpperCase()}
                            </td>
                            <td className="text-right py-3 px-6 font-bold text-green-700 font-mono">
                              ৳{formatCurrency(book.total_debit)}
                            </td>
                            <td className="text-right py-3 px-6 font-bold text-blue-700 font-mono">
                              ৳{formatCurrency(book.total_credit)}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}

                    {/* Grand Total */}
                    <tr className="bg-gray-900 text-white border-t-2 border-gray-800">
                      <td className="py-4 px-6 font-bold text-base" colSpan="4">GRAND TOTAL</td>
                      <td className="text-right py-4 px-6 font-bold text-base font-mono">
                        ৳{formatCurrency(data.overall_debit)}
                      </td>
                      <td className="text-right py-4 px-6 font-bold text-base font-mono">
                        ৳{formatCurrency(data.overall_credit)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Transaction Summary */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Transaction Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Ledgers:</span>
                    <span className="font-semibold">{data.books.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Transactions:</span>
                    <span className="font-semibold">{data.books.reduce((sum, book) => sum + book.entries.length, 0)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-green-600">Total Debits:</span>
                    <span className="font-semibold font-mono text-green-700">৳{formatCurrency(data.overall_debit)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-600">Total Credits:</span>
                    <span className="font-semibold font-mono text-blue-700">৳{formatCurrency(data.overall_credit)}</span>
                  </div>
                  <hr className="border-gray-200" />
                  <div className="flex justify-between items-center">
                    <span className="text-purple-600 font-medium">Net Difference:</span>
                    <span className="font-bold font-mono text-purple-700">
                      ৳{formatCurrency(Math.abs(data.overall_debit - data.overall_credit))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Voucher Type Breakdown */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Voucher Types</h3>
                <div className="space-y-3">
                  {(() => {
                    const voucherCounts = data.books.reduce((acc, book) => {
                      book.entries.forEach(entry => {
                        acc[entry.vch_type] = (acc[entry.vch_type] || 0) + 1;
                      });
                      return acc;
                    }, {});

                    return Object.entries(voucherCounts).map(([type, count]) => (
                      <div key={type} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          {getVoucherTypeIcon(type)}
                          <span className="text-gray-700">{type}</span>
                        </div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getVoucherTypeColor(type)}`}>
                          {count} entries
                        </span>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>

            {/* Footer Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>
                    This cash & bank book shows detailed transaction records with voucher information for the selected period.
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span>Report generated: {new Date().toLocaleString()}</span>
                  <span className="font-medium text-blue-600">
                    Books: {data.books.length} | Entries: {data.books.reduce((sum, book) => sum + book.entries.length, 0)}
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
                <Book className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Generate Cash & Bank Book</h3>
                <p className="text-gray-600 mb-4">
                  Select both start and end dates to generate your cash & bank book report.
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
                  No cash & bank book data found for the selected date range.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CashBankBook;