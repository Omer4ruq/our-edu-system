// // import { useTranslation } from "react-i18next";
// import SearchByDateRange from "./reports/SearchByDateRange";
// import UserTransactionTable from "./reports/user-transaction/UserTransactionTable";

// const UserTransaction = () => {
//     // const { t } = useTranslation();
//   return (
//     <div className="bg-[#441a05]rounded-md px-4 py-2 my-2 sm:my-4">
//       <SearchByDateRange />

//       <h3 className="text-2xl font-medium text-center mt-2">
//         {/* {t("module.accounts.cash_summary_list")} */}
//         User Wise Transaction Overview
//       </h3>
//       <UserTransactionTable />
//     </div>
//   );
// };

// export default UserTransaction;
// UserTransactions.jsx
import React, { useMemo, useState } from "react";
import {
  Calendar,
  Download,
  FileText,
  Filter,
  Search,
  User,
  Banknote,
  Printer,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";

import {
  useGetUserTransactionsQuery,
} from "../../redux/features/api/accounts/financialReports/financialReportsApi";
import { useGetInstituteLatestQuery } from "../../redux/features/api/institute/instituteLatestApi";

/** ---------- Helpers ---------- */
const fmtBD = (n) =>
  new Intl.NumberFormat("en-BD", {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(n || 0));

const fmtDateLong = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const todayStr = () => new Date().toISOString().slice(0, 10);
const firstDayOfMonth = () => {
  const d = new Date();
  d.setDate(1);
  return d.toISOString().slice(0, 10);
};
const lastMonthRange = () => {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() - 1);
  const from = new Date(d.getFullYear(), d.getMonth(), 1);
  const to = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return [from.toISOString().slice(0, 10), to.toISOString().slice(0, 10)];
};

/** ---------- Fancy Date Picker Row ---------- */
const DateRangeBar = ({ from, to, setFrom, setTo }) => {
  const applyThisMonth = () => {
    setFrom(firstDayOfMonth());
    setTo(todayStr());
  };
  const applyToday = () => {
    const t = todayStr();
    setFrom(t);
    setTo(t);
  };
  const applyLastMonth = () => {
    const [f, t] = lastMonthRange();
    setFrom(f);
    setTo(t);
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4">
        <div className="space-y-2 w-full xl:w-auto">
          <label className="block text-sm font-medium text-gray-700">Date Range</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full pl-11 pr-3 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 shadow-sm hover:border-gray-400"
              />
              <Calendar className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <div className="relative">
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full pl-11 pr-3 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 shadow-sm hover:border-gray-400"
              />
              <Calendar className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={applyToday}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border bg-white hover:bg-gray-50 text-sm"
            title="Today"
          >
            <Sparkles className="w-4 h-4 text-blue-600" /> Today
          </button>
          <button
            onClick={applyThisMonth}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border bg-white hover:bg-gray-50 text-sm"
            title="This Month"
          >
            <Calendar className="w-4 h-4 text-emerald-600" /> This Month
          </button>
          <button
            onClick={applyLastMonth}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border bg-white hover:bg-gray-50 text-sm"
            title="Last Month"
          >
            <Calendar className="w-4 h-4 text-amber-600" /> Last Month
          </button>
        </div>
      </div>
    </div>
  );
};

/** ---------- Main Component ---------- */
const UserTransactions = () => {
  const [from, setFrom] = useState(firstDayOfMonth());
  const [to, setTo] = useState(todayStr());
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");

  const { data, isLoading } = useGetUserTransactionsQuery(
    { from_date: from, to_date: to, page },
    { skip: !from || !to }
  );
  const { data: institute } = useGetInstituteLatestQuery();

  const txns = data?.transactions || [];

  const filtered = useMemo(() => {
    const q = (query || "").toLowerCase();
    if (!q) return txns;
    return txns.filter(
      (t) =>
        (t.user || "").toLowerCase().includes(q) ||
        (t.ledger || "").toLowerCase().includes(q)
    );
  }, [txns, query]);

  const totals = useMemo(() => {
    const d = filtered.reduce((s, r) => s + Number(r.debit || 0), 0);
    const c = filtered.reduce((s, r) => s + Number(r.credit || 0), 0);
    return { d, c, diff: d - c };
  }, [filtered]);

  /** Print / PDF */
  const printReport = () => {
    if (!data) return;

    const logo = institute?.institute_logo || null;
    const name = institute?.institute_name || "Organization";
    const addr = institute?.institute_address || "";

    const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>User Transactions</title>
<style>
  @page { size: A4 portrait; margin: 14mm; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color:#0f172a; }
  .header { display:flex; align-items:center; justify-content:space-between; border-bottom:2px solid #334155; padding-bottom:10px; margin-bottom:12px; }
  .brand { display:flex; gap:12px; align-items:center; }
  .brand .logo { width:50px; height:50px; object-fit:contain; border-radius:8px; }
  .brand .name { font-weight:800; font-size:18px; }
  .brand .addr { color:#64748b; font-size:11px; }
  .title { text-align:center; margin:6px 0 10px; }
  .title h1 { margin:0; font-size:16px; letter-spacing:.4px; }
  .period { color:#334155; font-size:12px; }
  table { width:100%; border-collapse:collapse; margin-top:6px; }
  thead th { text-align:left; background:#f1f5f9; border-bottom:2px solid #e2e8f0; padding:8px 10px; font-size:12px; }
  tbody td { padding:8px 10px; border-bottom:1px solid #f1f5f9; font-size:12px; }
  .num { text-align:right; font-variant-numeric: tabular-nums; }
  tfoot td { padding:10px; background:#f8fafc; font-weight:800; border-top:2px solid #e2e8f0; }
  .green { color:#15803d; }
  .red { color:#b91c1c; }
  .foot { margin-top:16px; display:flex; justify-content:space-between; align-items:center; font-size:11px; color:#64748b; }
  .sig { text-align:center; }
  .sig-line { width:140px; border-top:1px solid #0f172a; margin:0 auto 6px; }
  @media print { .no-print { display:none !important; } }
</style>
</head>
<body>
  <div class="header">
    <div class="brand">
      ${logo ? `<img class="logo" src="${logo}" />` : ""}
      <div>
        <div class="name">${name}</div>
        <div class="addr">${addr}</div>
      </div>
    </div>
    <div style="text-align:right; font-size:11px; color:#475569">
      <div><b>Generated:</b> ${new Date().toLocaleString()}</div>
    </div>
  </div>

  <div class="title">
    <h1>User Transactions</h1>
    <div class="period">${fmtDateLong(data.from_date)} → ${fmtDateLong(data.to_date)}</div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width:34%">User</th>
        <th style="width:34%">Ledger</th>
        <th class="num" style="width:16%">Debit (৳)</th>
        <th class="num" style="width:16%">Credit (৳)</th>
      </tr>
    </thead>
    <tbody>
      ${(filtered || [])
        .map((r) => {
          return `<tr>
            <td>${r.user || ""}</td>
            <td>${r.ledger || ""}</td>
            <td class="num">${fmtBD(r.debit || 0)}</td>
            <td class="num">${fmtBD(r.credit || 0)}</td>
          </tr>`;
        })
        .join("")}
    </tbody>
    <tfoot>
      <tr>
        <td colspan="2">Totals (Filtered)</td>
        <td class="num">৳${fmtBD(totals.d)}</td>
        <td class="num">৳${fmtBD(totals.c)}</td>
      </tr>
    </tfoot>
  </table>

  <div class="foot">
    <div>Rows: ${filtered.length} / ${data.total_rows}</div>
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

  /** CSV Export */
  const exportCSV = () => {
    const head = ["User", "Ledger", "Debit", "Credit"];
    const rows = filtered.map((r) => [r.user || "", r.ledger || "", r.debit || 0, r.credit || 0]);
    const all = [head, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([all], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `user-transactions_${from}_to_${to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /** Pagination Controls */
  const totalPages = data?.total_pages || 1;
  const currentPage = data?.current_page || page;
  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;

  const gotoPrev = () => canPrev && setPage((p) => p - 1);
  const gotoNext = () => canNext && setPage((p) => p + 1);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Transactions</h1>
              <p className="text-gray-600">
                Per-user debit/credit activity for a selected period
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={printReport}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 text-sm"
                title="Print / Save as PDF"
              >
                <Printer className="w-4 h-4" /> Print / PDF
              </button>
              <button
                onClick={exportCSV}
                className="inline-flex items-center gap-2 bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 text-sm"
                title="Export CSV"
              >
                <Download className="w-4 h-4" /> Export
              </button>
            </div>
          </div>
        </div>

        {/* Modern Date Range */}
        <DateRangeBar from={from} to={to} setFrom={setFrom} setTo={setTo} />

        {/* Quick Stats */}
        {data && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-6">
              <div className="flex items-center gap-2 mb-1">
                <Banknote className="w-5 h-5 text-emerald-600" />
                <h3 className="font-semibold text-emerald-900">Total Debit</h3>
              </div>
              <div className="text-2xl font-bold text-emerald-700">
                ৳{fmtBD(data.total_debit)}
              </div>
              <div className="text-xs text-emerald-700 mt-1">
                {fmtDateLong(data.from_date)} → {fmtDateLong(data.to_date)}
              </div>
            </div>

            <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-6">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-5 h-5 text-amber-600" />
                <h3 className="font-semibold text-amber-900">Total Credit</h3>
              </div>
              <div className="text-2xl font-bold text-amber-700">
                ৳{fmtBD(data.total_credit)}
              </div>
              <div className="text-xs text-amber-700 mt-1">Same period</div>
            </div>

            <div className="rounded-xl border-2 border-sky-200 bg-sky-50 p-6">
              <div className="flex items-center gap-2 mb-1">
                <Filter className="w-5 h-5 text-sky-600" />
                <h3 className="font-semibold text-sky-900">Rows</h3>
              </div>
              <div className="text-2xl font-bold text-sky-700">
                {filtered.length} / {data.total_rows}
              </div>
              <div className="text-xs text-sky-700 mt-1">After search filter</div>
            </div>
          </div>
        )}

        {/* Search + Branding */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by user or ledger..."
              className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>

          <div className="flex items-center gap-3">
            {institute?.institute_logo && (
              <img
                src={institute.institute_logo}
                alt="Logo"
                className="w-10 h-10 rounded-md border object-contain"
              />
            )}
            <div className="text-sm">
              <div className="font-semibold text-gray-900">
                {institute?.institute_name || "Organization"}
              </div>
              <div className="text-gray-500">
                {fmtDateLong(from)} → {fmtDateLong(to)}
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                <tr>
                  <th className="text-left py-3 px-6 font-semibold text-gray-900 text-sm w-1/3">
                    <div className="inline-flex items-center gap-2">
                      <User className="w-4 h-4" /> User
                    </div>
                  </th>
                  <th className="text-left py-3 px-6 font-semibold text-gray-900 text-sm w-1/3">
                    Ledger
                  </th>
                  <th className="text-right py-3 px-6 font-semibold text-gray-900 text-sm w-1/6">
                    Debit (৳)
                  </th>
                  <th className="text-right py-3 px-6 font-semibold text-gray-900 text-sm w-1/6">
                    Credit (৳)
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-gray-500">
                      Loading transactions…
                    </td>
                  </tr>
                )}

                {!isLoading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-gray-500">
                      No transactions found.
                    </td>
                  </tr>
                )}

                {!isLoading &&
                  filtered.map((r, i) => (
                    <tr
                      key={`txn-${i}-${r.user}-${r.ledger}`}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-6">{r.user || "—"}</td>
                      <td className="py-3 px-6">{r.ledger || "—"}</td>
                      <td className="py-3 px-6 text-right font-mono text-sm">
                        {fmtBD(r.debit || 0)}
                      </td>
                      <td className="py-3 px-6 text-right font-mono text-sm">
                        {fmtBD(r.credit || 0)}
                      </td>
                    </tr>
                  ))}
              </tbody>
              {!isLoading && filtered.length > 0 && (
                <tfoot>
                  <tr className="bg-slate-100 border-t-2 border-slate-200">
                    <td className="py-3 px-6 font-bold">TOTAL (Filtered)</td>
                    <td />
                    <td className="text-right py-3 px-6 font-bold font-mono">
                      ৳{fmtBD(totals.d)}
                    </td>
                    <td className="text-right py-3 px-6 font-bold font-mono">
                      ৳{fmtBD(totals.c)}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          {/* Pagination */}
          {!isLoading && totalPages > 1 && (
            <div className="flex items-center justify-between p-3 border-t bg-gray-50">
              <div className="text-sm text-gray-600">
                Page <b>{currentPage}</b> of <b>{totalPages}</b>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={gotoPrev}
                  disabled={!canPrev}
                  className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg border text-sm ${
                    canPrev ? "bg-white hover:bg-gray-50" : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                <button
                  onClick={gotoNext}
                  disabled={!canNext}
                  className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg border text-sm ${
                    canNext ? "bg-white hover:bg-gray-50" : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserTransactions;
