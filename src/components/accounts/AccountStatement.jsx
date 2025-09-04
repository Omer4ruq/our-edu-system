import React, { useMemo, useState } from "react";
import {
  Calendar,
  Download,
  FileText,
  Printer,
  Search,
  ChevronDown,
  ChevronRight,
  FilterX,
  RefreshCw,
} from "lucide-react";

import { useGetAccountStatementQuery } from "../../redux/features/api/accounts/financialReports/financialReportsApi";
import { useGetInstituteLatestQuery } from "../../redux/features/api/institute/instituteLatestApi";

// ---- Tiny date picker (styled <input type="date">) ----
const DatePicker = ({ label, value, onChange, required = false }) => (
  <div className="space-y-2 w-full">
    <label className="block text-sm font-semibold text-gray-700">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <div className="relative">
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 pl-11 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all duration-200 text-gray-800 shadow-sm hover:border-gray-400"
      />
      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
    </div>
  </div>
);

const Chip = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
      active
        ? "bg-blue-600 text-white border-blue-600"
        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
    }`}
  >
    {children}
  </button>
);

const numberBD = (n) =>
  new Intl.NumberFormat("en-BD", {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(n || 0));

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
      })
    : "-";

const AccountCardHeader = ({
  name,
  opening,
  debit,
  credit,
  closing,
  collapsed,
  onToggle,
}) => (
  <button
    onClick={onToggle}
    className="w-full flex items-center justify-between p-4 bg-gray-50 border-b rounded-t-xl"
  >
    <div className="flex items-center gap-2 text-left">
      {collapsed ? (
        <ChevronRight className="w-4 h-4 text-gray-500" />
      ) : (
        <ChevronDown className="w-4 h-4 text-gray-500" />
      )}
      <h4 className="font-semibold text-gray-900">{name}</h4>
    </div>
    <div className="grid grid-cols-4 gap-6 text-sm text-gray-700">
      <div>
        <div className="text-gray-500">Opening</div>
        <div className="font-mono font-semibold">৳{numberBD(opening)}</div>
      </div>
      <div>
        <div className="text-gray-500">Total Debit</div>
        <div className="font-mono font-semibold">৳{numberBD(debit)}</div>
      </div>
      <div>
        <div className="text-gray-500">Total Credit</div>
        <div className="font-mono font-semibold">৳{numberBD(credit)}</div>
      </div>
      <div>
        <div className="text-gray-500">Closing</div>
        <div className="font-mono font-semibold">৳{numberBD(closing)}</div>
      </div>
    </div>
  </button>
);

const AccountStatement = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState({}); // { ledger: boolean }

  const { data, isLoading, isFetching } = useGetAccountStatementQuery(
    { from_date: fromDate, to_date: toDate },
    { skip: !fromDate || !toDate }
  );
  const { data: institute, isLoading: instLoading } = useGetInstituteLatestQuery();

  const quickRanges = {
    Today: () => {
      const t = new Date();
      const iso = t.toISOString().slice(0, 10);
      setFromDate(iso);
      setToDate(iso);
    },
    "Last 7 days": () => {
      const t = new Date();
      const end = t.toISOString().slice(0, 10);
      const start = new Date(t.getTime() - 6 * 86400000)
        .toISOString()
        .slice(0, 10);
      setFromDate(start);
      setToDate(end);
    },
    "This Month": () => {
      const t = new Date();
      const start = new Date(t.getFullYear(), t.getMonth(), 1)
        .toISOString()
        .slice(0, 10);
      const end = new Date(t.getFullYear(), t.getMonth() + 1, 0)
        .toISOString()
        .slice(0, 10);
      setFromDate(start);
      setToDate(end);
    },
  };

  const filteredAccounts = useMemo(() => {
    if (!data?.accounts) return [];
    const q = query.trim().toLowerCase();
    if (!q) return data.accounts;
    return data.accounts
      .map((acc) => ({
        ...acc,
        rows: acc.rows.filter((r) =>
          [
            acc.ledger,
            r.voucher_no,
            r.trn_type,
            r.particulars,
          ]
            .join(" ")
            .toLowerCase()
            .includes(q)
        ),
      }))
      .filter((acc) => acc.rows.length > 0 || acc.ledger.toLowerCase().includes(q));
  }, [data, query]);

  const overall = useMemo(() => ({
    debit: data?.overall_debit || 0,
    credit: data?.overall_credit || 0,
  }), [data]);

  const closingBalance = (acc) => {
    if (acc?.rows?.length) return acc.rows[acc.rows.length - 1].balance;
    // fallback if rows empty
    return Number(acc?.opening_balance || 0) + Number(acc?.total_debit || 0) - Number(acc?.total_credit || 0);
  };

  const handleToggle = (ledger) =>
    setCollapsed((s) => ({ ...s, [ledger]: !s[ledger] }));

  const buildReportHTML = () => {
    if (!data) return "";
    const title = `Account Statement (${fmtDate(data.from_date)} to ${fmtDate(
      data.to_date
    )})`;
    const logo = institute?.institute_logo;
    const org = institute?.institute_name || "Organization";
    const addr = institute?.institute_address || "Address";

    const rowsHTML = data.accounts
      .map((acc) => {
        const close = closingBalance(acc);
        return `
        <table style="width:100%; border-collapse:collapse; margin:18px 0; border:1px solid #e5e7eb;">
          <thead>
            <tr style="background:#f8fafc; border-bottom:2px solid #e5e7eb;">
              <th colspan="7" style="text-align:left; padding:10px 12px; font:600 12px/1.2 ui-sans-serif, system-ui; color:#0f172a;">
                ${acc.ledger}
                <span style="font:500 12px/1.2 ui-sans-serif; color:#64748b; margin-left:12px;">Opening: ৳${numberBD(
                  acc.opening_balance
                )} • Debit: ৳${numberBD(acc.total_debit)} • Credit: ৳${numberBD(
          acc.total_credit
        )} • Closing: ৳${numberBD(close)}</span>
              </th>
            </tr>
            <tr style="background:#f8fafc;">
              <th style="text-align:left; padding:8px 12px; font:600 11px ui-sans-serif; color:#334155;">Date</th>
              <th style="text-align:left; padding:8px 12px; font:600 11px ui-sans-serif; color:#334155;">Voucher No</th>
              <th style="text-align:left; padding:8px 12px; font:600 11px ui-sans-serif; color:#334155;">Type</th>
              <th style="text-align:left; padding:8px 12px; font:600 11px ui-sans-serif; color:#334155;">Particulars</th>
              <th style="text-align:right; padding:8px 12px; font:600 11px ui-sans-serif; color:#334155;">Debit (৳)</th>
              <th style="text-align:right; padding:8px 12px; font:600 11px ui-sans-serif; color:#334155;">Credit (৳)</th>
              <th style="text-align:right; padding:8px 12px; font:600 11px ui-sans-serif; color:#334155;">Balance (৳)</th>
            </tr>
          </thead>
          <tbody>
            ${acc.rows
              .map(
                (r, i) => `
                  <tr style="border-top:1px solid #f1f5f9; ${
                    i % 2 ? "background:#fafafa;" : ""
                  }">
                    <td style="padding:8px 12px; font:500 10px ui-sans-serif; color:#334155;">${fmtDate(
                      r.date
                    )}</td>
                    <td style="padding:8px 12px; font:500 10px ui-sans-serif; color:#334155;">${
                      r.voucher_no || "-"
                    }</td>
                    <td style="padding:8px 12px; font:500 10px ui-sans-serif; color:#334155;">${
                      r.trn_type
                    }</td>
                    <td style="padding:8px 12px; font:500 10px ui-sans-serif; color:#334155;">${
                      r.particulars || "-"
                    }</td>
                    <td style="padding:8px 12px; text-align:right; font:600 10px ui-monospace;">${numberBD(
                      r.debit
                    )}</td>
                    <td style="padding:8px 12px; text-align:right; font:600 10px ui-monospace;">${numberBD(
                      r.credit
                    )}</td>
                    <td style="padding:8px 12px; text-align:right; font:700 10px ui-monospace;">${numberBD(
                      r.balance
                    )}</td>
                  </tr>`
              )
              .join("")}
          </tbody>
        </table>`;
      })
      .join("");

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <style>
    @page { size: A4 portrait; margin: 15mm; }
    body { font: 10pt ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto; color:#111827; }
    .header { display:flex; align-items:center; justify-content:space-between; border-bottom:2px solid #2563eb; padding-bottom:16px; margin-bottom:18px; }
    .org { font: 700 18px/1.2 ui-sans-serif; }
    .addr { color:#64748b; font: 11px/1.4 ui-sans-serif; }
    .logo { width:52px; height:52px; object-fit:contain; border-radius:8px; }
    .meta { text-align:center; margin: 4px 0 14px; }
    .meta h1 { font: 800 16px ui-sans-serif; margin:0 0 6px; letter-spacing:.3px; }
    .meta .period { color:#475569; font: 12px ui-sans-serif; }
    .totals { display:flex; gap:18px; background:#f8fafc; border:1px solid #e5e7eb; border-radius:10px; padding:10px 14px; margin: 8px 0 12px; }
    .totals div { font: 600 12px ui-sans-serif; color:#0f172a; }
    .sign { display:flex; justify-content:space-between; align-items:center; margin-top:20px; padding-top:10px; border-top:1px solid #e5e7eb; color:#64748b; font: 10px ui-sans-serif; }
    .sigline { width:140px; border-top:1px solid #334155; margin-bottom:6px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="org">${org}</div>
      <div class="addr">${addr}</div>
    </div>
    ${logo ? `<img src="${logo}" class="logo" />` : ""}
  </div>

  <div class="meta">
    <h1>Account Statement</h1>
    <div class="period">${fmtDate(data.from_date)} to ${fmtDate(
      data.to_date
    )}</div>
  </div>

  <div class="totals">
    <div>Overall Debit: ৳${numberBD(overall.debit)}</div>
    <div>Overall Credit: ৳${numberBD(overall.credit)}</div>
  </div>

  ${rowsHTML}

  <div class="sign">
    <div>Generated: ${new Date().toLocaleString()}</div>
    <div style="text-align:center">
      <div class="sigline"></div>
      <div><strong>Authorized Signature</strong></div>
    </div>
  </div>

  <script>
    window.print();
    window.onafterprint = () => window.close();
  </script>
</body>
</html>`;
  };

  const exportPDF = () => {
    if (!data) return;
    const html = buildReportHTML();
    const w = window.open("", "_blank");
    w.document.write(html);
    w.document.close();
  };

  const collapseAll = (val) => {
    const map = {};
    (data?.accounts || []).forEach((a) => (map[a.ledger] = val));
    setCollapsed(map);
  };

  const loading = isLoading || isFetching || instLoading;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header / Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Statement</h1>
              <p className="text-gray-600">View ledger-wise transactions and balances for a period</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <DatePicker label="From" value={fromDate} onChange={setFromDate} required />
              <DatePicker label="To" value={toDate} onChange={setToDate} required />
            </div>
          </div>

          {/* Quick ranges */}
          <div className="flex items-center gap-2 mt-4 flex-wrap">
            {Object.keys(quickRanges).map((k) => (
              <Chip key={k} onClick={quickRanges[k]}>{k}</Chip>
            ))}
            {(fromDate || toDate) && (
              <Chip onClick={() => { setFromDate(""); setToDate(""); }}>Clear</Chip>
            )}
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search ledger, voucher, type, particulars..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => collapseAll(true)}
              className="px-3 py-2 text-sm rounded-lg border bg-gray-50 hover:bg-gray-100 text-gray-700 flex items-center gap-2"
            >
              <ChevronRight className="w-4 h-4" /> Collapse all
            </button>
            <button
              onClick={() => collapseAll(false)}
              className="px-3 py-2 text-sm rounded-lg border bg-gray-50 hover:bg-gray-100 text-gray-700 flex items-center gap-2"
            >
              <ChevronDown className="w-4 h-4" /> Expand all
            </button>
            <div className="h-6 w-px bg-gray-200 mx-1" />
            <button
              onClick={exportPDF}
              disabled={!data}
              className="px-3 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Download className="w-4 h-4" /> Export / Print
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-600">Loading account statement...</p>
          </div>
        )}

        {/* Empty hint */}
        {!loading && (!fromDate || !toDate) && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Pick a date range</h3>
                <p className="text-gray-600">Select both start and end dates to generate the account statement.</p>
              </div>
            </div>
          </div>
        )}

        {/* No data */}
        {!loading && fromDate && toDate && data && data.accounts?.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-gray-600">No accounts found for the selected range.</p>
          </div>
        )}

        {/* Totals cards */}
        {data && data.accounts?.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl p-6 border-2 border-blue-200 bg-blue-50">
              <div className="text-sm text-blue-900 font-semibold mb-1">Overall Debit</div>
              <div className="text-2xl font-bold text-blue-700">৳{numberBD(overall.debit)}</div>
            </div>
            <div className="rounded-xl p-6 border-2 border-emerald-200 bg-emerald-50">
              <div className="text-sm text-emerald-900 font-semibold mb-1">Overall Credit</div>
              <div className="text-2xl font-bold text-emerald-700">৳{numberBD(overall.credit)}</div>
            </div>
          </div>
        )}

        {/* Accounts */}
        {data && data.accounts?.length > 0 && (
          <div className="space-y-6">
            {filteredAccounts.map((acc) => {
              const close = closingBalance(acc);
              const isCollapsed = !!collapsed[acc.ledger];
              return (
                <div key={acc.ledger} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <AccountCardHeader
                    name={acc.ledger}
                    opening={acc.opening_balance}
                    debit={acc.total_debit}
                    credit={acc.total_credit}
                    closing={close}
                    collapsed={isCollapsed}
                    onToggle={() => handleToggle(acc.ledger)}
                  />

                  {!isCollapsed && (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr className="text-left text-sm text-gray-900">
                            <th className="py-3 px-6">Date</th>
                            <th className="py-3 px-6">Voucher No</th>
                            <th className="py-3 px-6">Type</th>
                            <th className="py-3 px-6">Particulars</th>
                            <th className="py-3 px-6 text-right">Debit (৳)</th>
                            <th className="py-3 px-6 text-right">Credit (৳)</th>
                            <th className="py-3 px-6 text-right">Balance (৳)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {acc.rows.map((r, idx) => (
                            <tr
                              key={acc.ledger + idx}
                              className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                            >
                              <td className="py-3 px-6 whitespace-nowrap">{fmtDate(r.date)}</td>
                              <td className="py-3 px-6 font-mono text-xs">{r.voucher_no || "-"}</td>
                              <td className="py-3 px-6">{r.trn_type}</td>
                              <td className="py-3 px-6">{r.particulars || "-"}</td>
                              <td className="py-3 px-6 text-right font-mono">{numberBD(r.debit)}</td>
                              <td className="py-3 px-6 text-right font-mono">{numberBD(r.credit)}</td>
                              <td className="py-3 px-6 text-right font-mono font-semibold">{numberBD(r.balance)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountStatement;
