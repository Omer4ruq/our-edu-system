// import LedgerSummarySearch from "./reports/ledger-summary/LedgerSummarySearch";
// import LedgerSummaryTable from "./reports/ledger-summary/LedgerSummaryTable";

// const LedgerSummary = () => {
//   // const { t } = useTranslation();
//   return (
//     <div className="bg-[#441a05]rounded-md px-4 py-2 my-2 sm:my-4">
//       <LedgerSummarySearch />

//       <h3 className="text-2xl font-medium text-center mt-5">
//         {/* {t("module.accounts.cash_summary_list")} */}
//         Ledger Summary
//       </h3>
//       <LedgerSummaryTable />
//     </div>
//   );
// };

// export default LedgerSummary;

// LedgerSummary.jsx
import React, { useMemo, useState } from "react";
import {
  Calendar,
  Download,
  FileText,
  Layers,
  ListTree,
  Search,
  TrendingDown,
  TrendingUp,
  Eye,
  EyeOff,
  Printer,
} from "lucide-react";

import {
  useGetLedgerSummaryQuery,
} from "../../redux/features/api/accounts/financialReports/financialReportsApi";
import { useGetInstituteLatestQuery } from "../../redux/features/api/institute/instituteLatestApi";

const DatePicker = ({ value, onChange, label, required = false }) => (
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
      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
    </div>
  </div>
);

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-BD", {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));

const formatDateLong = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const LedgerSummary = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showZero, setShowZero] = useState(false);
  const [onlyCategories, setOnlyCategories] = useState(false);

  const { data, isLoading } = useGetLedgerSummaryQuery(
    { from_date: fromDate, to_date: toDate },
    { skip: !fromDate || !toDate }
  );
  const { data: institute, isLoading: isInstituteLoading } =
    useGetInstituteLatestQuery();

  const rows = data?.summary_rows || [];

  const filteredRows = useMemo(() => {
    const term = (searchTerm || "").toLowerCase();
    return rows.filter((r) => {
      const matchesSearch = r.name?.toLowerCase().includes(term);
      const matchesType = onlyCategories ? !!r.is_category : true;
      const hasAmount = showZero || Number(r.debit || 0) !== 0 || Number(r.credit || 0) !== 0;
      return matchesSearch && matchesType && hasAmount;
    });
  }, [rows, searchTerm, showZero, onlyCategories]);

  const totals = useMemo(() => {
    const totalDebit = filteredRows.reduce((s, r) => s + Number(r.debit || 0), 0);
    const totalCredit = filteredRows.reduce((s, r) => s + Number(r.credit || 0), 0);
    return { totalDebit, totalCredit, diff: totalDebit - totalCredit };
  }, [filteredRows]);

  const diffRow = data?.difference_ledger_row; // can be null

  const generateProfessionalReport = () => {
    if (!data) return;

    const headerName = institute?.institute_name || "Organization";
    const headerAddr = institute?.institute_address || "";
    const logo = institute?.institute_logo || null;

    const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>Ledger Summary</title>
<style>
  @page { size: A4 portrait; margin: 14mm; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color:#111827; }
  .header { display:flex; align-items:center; justify-content:space-between; border-bottom:2px solid #0ea5e9; padding-bottom:12px; margin-bottom:16px; }
  .h-left { display:flex; gap:12px; align-items:center; }
  .h-name { font-weight:800; font-size:18px; }
  .h-addr { color:#6b7280; font-size:11px; }
  .logo { width:52px; height:52px; object-fit:contain; border-radius:6px; }
  .title { text-align:center; margin:8px 0 12px; }
  .title h1 { margin:0; font-size:16px; letter-spacing:.4px; }
  .period { color:#374151; font-size:12px; }
  .stats { display:flex; gap:10px; margin:10px 0 16px; }
  .card { flex:1; border:1px solid #e5e7eb; border-radius:8px; padding:10px 12px; background:#f9fafb; }
  .card h3 { margin:0 0 4px; font-size:11px; color:#475569; text-transform:uppercase; letter-spacing:.5px; }
  .card .v { font-size:14px; font-weight:700; }

  table { width:100%; border-collapse:collapse; margin-top:6px; }
  thead th { text-align:left; background:#f1f5f9; border-bottom:2px solid #e2e8f0; padding:8px 10px; font-size:12px; }
  tbody td { padding:8px 10px; border-bottom:1px solid #f1f5f9; font-size:12px; }
  .tr-cat td { background:#f8fafc; font-weight:700; }
  .num { text-align:right; font-variant-numeric: tabular-nums; }
  tfoot td { padding:10px; background:#f8fafc; font-weight:800; border-top:2px solid #e2e8f0; }
  .diff-pos { color:#16a34a; }
  .diff-neg { color:#dc2626; }
  .foot { margin-top:18px; display:flex; justify-content:space-between; align-items:center; font-size:11px; color:#6b7280; }
  .sig { text-align:center; }
  .sig-line { width:140px; border-top:1px solid #111827; margin:0 auto 6px; }
  @media print { .no-print { display:none !important; } }
</style>
</head>
<body>
  <div class="header">
    <div class="h-left">
      ${logo ? `<img class="logo" src="${logo}" />` : ""}
      <div>
        <div class="h-name">${headerName}</div>
        <div class="h-addr">${headerAddr}</div>
      </div>
    </div>
    <div style="text-align:right; font-size:11px; color:#475569">
      <div><b>Generated:</b> ${new Date().toLocaleString()}</div>
    </div>
  </div>

  <div class="title">
    <h1>Ledger Summary</h1>
    <div class="period">For the period: ${formatDateLong(data.from_date)} → ${formatDateLong(data.to_date)}</div>
  </div>

  <div class="stats">
    <div class="card">
      <h3>Total Debit</h3>
      <div class="v">৳${formatCurrency(data.grand_debit)}</div>
    </div>
    <div class="card">
      <h3>Total Credit</h3>
      <div class="v">৳${formatCurrency(data.grand_credit)}</div>
    </div>
    <div class="card">
      <h3>Difference (D − C)</h3>
      <div class="v ${data.grand_debit - data.grand_credit >= 0 ? "diff-pos" : "diff-neg"}">
        ৳${formatCurrency(data.grand_debit - data.grand_credit)}
      </div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width:55%">Name</th>
        <th class="num" style="width:15%">Debit (৳)</th>
        <th class="num" style="width:15%">Credit (৳)</th>
        <th class="num" style="width:15%">Balance (D − C)</th>
      </tr>
    </thead>
    <tbody>
      ${(data.summary_rows || [])
        .map((r) => {
          const bal = (Number(r.debit || 0) - Number(r.credit || 0)) || 0;
          const trClass = r.is_category ? "tr-cat" : "";
          return `<tr class="${trClass}">
            <td>${r.name || ""}</td>
            <td class="num">${formatCurrency(r.debit || 0)}</td>
            <td class="num">${formatCurrency(r.credit || 0)}</td>
            <td class="num ${bal >= 0 ? "diff-pos" : "diff-neg"}">${formatCurrency(bal)}</td>
          </tr>`;
        })
        .join("")}
    </tbody>
    <tfoot>
      <tr>
        <td>Total</td>
        <td class="num">৳${formatCurrency(data.grand_debit)}</td>
        <td class="num">৳${formatCurrency(data.grand_credit)}</td>
        <td class="num ${data.grand_debit - data.grand_credit >= 0 ? "diff-pos" : "diff-neg"}">৳${formatCurrency(data.grand_debit - data.grand_credit)}</td>
      </tr>
      ${
        data.difference_ledger_row
          ? `<tr>
              <td>${data.difference_ledger_row.name || "Difference Ledger"}</td>
              <td class="num">${formatCurrency(data.difference_ledger_row.debit || 0)}</td>
              <td class="num">${formatCurrency(data.difference_ledger_row.credit || 0)}</td>
              <td class="num ${((data.difference_ledger_row.debit||0)-(data.difference_ledger_row.credit||0))>=0?"diff-pos":"diff-neg"}">
                ${formatCurrency((data.difference_ledger_row.debit||0)-(data.difference_ledger_row.credit||0))}
              </td>
            </tr>`
          : ""
      }
    </tfoot>
  </table>

  <div class="foot">
    <div>Items: ${(data.summary_rows || []).length}</div>
    <div class="sig">
      <div class="sig-line"></div>
      <div><b>Authorized Signature</b></div>
    </div>
  </div>

  <script>
    window.print();
    window.onafterprint = () => window.close();
  </script>
</body>
</html>
    `.trim();

    const w = window.open("", "_blank");
    w.document.write(html);
    w.document.close();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Toolbar / Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Ledger Summary</h1>
              <p className="text-gray-600">
                Category & ledger wise debit/credit overview for a selected period
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DatePicker label="From Date" value={fromDate} onChange={setFromDate} required />
              <DatePicker label="To Date" value={toDate} onChange={setToDate} required />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name (category or ledger)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>

            <button
              onClick={() => setShowZero((s) => !s)}
              className="flex items-center justify-center gap-2 px-3 py-2 border rounded-lg text-sm hover:bg-gray-50"
              title={showZero ? "Hide zero rows" : "Show zero rows"}
            >
              {showZero ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showZero ? "Hide Zero Amounts" : "Show Zero Amounts"}
            </button>

            <button
              onClick={() => setOnlyCategories((s) => !s)}
              className="flex items-center justify-center gap-2 px-3 py-2 border rounded-lg text-sm hover:bg-gray-50"
              title={onlyCategories ? "Show all rows" : "Show categories only"}
            >
              {onlyCategories ? <ListTree className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
              {onlyCategories ? "Show All Rows" : "Categories Only"}
            </button>
          </div>
        </div>

        {/* Loading state */}
        {(isLoading || isInstituteLoading) && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading ledger summary...</p>
          </div>
        )}

        {/* KPIs */}
        {data && !isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl p-6 border-2 border-emerald-200 bg-emerald-50">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <h3 className="font-semibold text-emerald-900">Total Debit</h3>
              </div>
              <div className="text-2xl font-bold text-emerald-700">
                ৳{formatCurrency(data.grand_debit)}
              </div>
              <div className="text-xs text-emerald-700 mt-1">
                Period: {formatDateLong(data.from_date)} → {formatDateLong(data.to_date)}
              </div>
            </div>

            <div className="rounded-xl p-6 border-2 border-amber-200 bg-amber-50">
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown className="w-5 h-5 text-amber-600" />
                <h3 className="font-semibold text-amber-900">Total Credit</h3>
              </div>
              <div className="text-2xl font-bold text-amber-700">
                ৳{formatCurrency(data.grand_credit)}
              </div>
              <div className="text-xs text-amber-700 mt-1">
                Same period as above
              </div>
            </div>

            <div className="rounded-xl p-6 border-2 border-blue-200 bg-blue-50">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">Difference (D − C)</h3>
              </div>
              <div
                className={
                  "text-2xl font-bold " +
                  ((data.grand_debit - data.grand_credit) >= 0
                    ? "text-green-700"
                    : "text-red-700")
                }
              >
                ৳{formatCurrency(data.grand_debit - data.grand_credit)}
              </div>
              {data.difference_ledger_row && (
                <div className="text-xs text-blue-700 mt-1">
                  Adjusted by: <b>{data.difference_ledger_row.name}</b>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Table */}
        {data && !isLoading && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 flex items-center justify-between border-b bg-gray-50">
              <div className="flex items-center gap-3">
                {institute?.institute_logo && (
                  <img
                    src={institute.institute_logo}
                    alt="Logo"
                    className="w-10 h-10 rounded-md object-contain border"
                  />
                )}
                <div>
                  <div className="font-semibold text-gray-900">
                    {institute?.institute_name || "Organization"}
                  </div>
                  <div className="text-xs text-gray-600">
                    Ledger Summary • {formatDateLong(data.from_date)} → {formatDateLong(data.to_date)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={generateProfessionalReport}
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
                >
                  <Printer className="w-4 h-4" />
                  Print / PDF
                </button>
                <button
                  onClick={generateProfessionalReport}
                  className="inline-flex items-center gap-2 bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                  <tr>
                    <th className="text-left py-3 px-6 font-semibold text-gray-900 text-sm w-1/2">
                      Name
                    </th>
                    <th className="text-right py-3 px-6 font-semibold text-gray-900 text-sm w-1/6">
                      Debit (৳)
                    </th>
                    <th className="text-right py-3 px-6 font-semibold text-gray-900 text-sm w-1/6">
                      Credit (৳)
                    </th>
                    <th className="text-right py-3 px-6 font-semibold text-gray-900 text-sm w-1/6">
                      Balance (D − C)
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRows.map((r, i) => {
                    const bal = (Number(r.debit || 0) - Number(r.credit || 0)) || 0;
                    const isCat = !!r.is_category;
                    return (
                      <tr
                        key={`${r.name}-${i}`}
                        className={
                          "border-b border-gray-100 " +
                          (isCat ? "bg-gray-50" : "hover:bg-gray-50 transition-colors")
                        }
                      >
                        <td className={"py-3 px-6 " + (isCat ? "font-semibold text-gray-800" : "")}>
                          {r.name}
                        </td>
                        <td className="text-right py-3 px-6 font-mono text-sm">
                          {formatCurrency(r.debit || 0)}
                        </td>
                        <td className="text-right py-3 px-6 font-mono text-sm">
                          {formatCurrency(r.credit || 0)}
                        </td>
                        <td
                          className={
                            "text-right py-3 px-6 font-mono text-sm " +
                            (bal >= 0 ? "text-green-700" : "text-red-700")
                          }
                        >
                          {formatCurrency(bal)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>

                <tfoot>
                  <tr className="bg-slate-100 border-t-2 border-slate-200">
                    <td className="py-3 px-6 font-bold">TOTAL</td>
                    <td className="text-right py-3 px-6 font-bold font-mono">
                      ৳{formatCurrency(totals.totalDebit)}
                    </td>
                    <td className="text-right py-3 px-6 font-bold font-mono">
                      ৳{formatCurrency(totals.totalCredit)}
                    </td>
                    <td
                      className={
                        "text-right py-3 px-6 font-bold font-mono " +
                        (totals.diff >= 0 ? "text-green-700" : "text-red-700")
                      }
                    >
                      ৳{formatCurrency(totals.diff)}
                    </td>
                  </tr>

                  {diffRow && (
                    <tr className="bg-sky-50 border-t border-sky-200">
                      <td className="py-3 px-6 font-semibold">{diffRow.name || "Difference Ledger"}</td>
                      <td className="text-right py-3 px-6 font-mono">
                        {formatCurrency(diffRow.debit || 0)}
                      </td>
                      <td className="text-right py-3 px-6 font-mono">
                        {formatCurrency(diffRow.credit || 0)}
                      </td>
                      <td
                        className={
                          "text-right py-3 px-6 font-mono " +
                          (((diffRow.debit || 0) - (diffRow.credit || 0)) >= 0
                            ? "text-green-700"
                            : "text-red-700")
                        }
                      >
                        {formatCurrency((diffRow.debit || 0) - (diffRow.credit || 0))}
                      </td>
                    </tr>
                  )}
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && (!fromDate || !toDate) && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Generate Ledger Summary</h3>
                <p className="text-gray-600">
                  Select both start and end dates to see category and ledger totals.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LedgerSummary;
