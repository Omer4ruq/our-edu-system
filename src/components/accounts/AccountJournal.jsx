import React, { useMemo, useState } from "react";
import {
  Calendar,
  Download,
  FileText,
  Printer,
  Search,
  ChevronDown,
  ChevronRight,
  Receipt,
  Layers,
  Sparkles,
} from "lucide-react";

import { useGetAccountJournalQuery } from "../../redux/features/api/accounts/financialReports/financialReportsApi";
import { useGetInstituteLatestQuery } from "../../redux/features/api/institute/instituteLatestApi";

/* -------------------- UI helpers -------------------- */
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

const DateRangeBar = ({ from, to, setFrom, setTo }) => {
  const applyToday = () => {
    const t = todayStr();
    setFrom(t);
    setTo(t);
  };
  const applyThisMonth = () => {
    setFrom(firstDayOfMonth());
    setTo(todayStr());
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
                className="w-full pl-11 pr-3 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-gray-800 shadow-sm hover:border-gray-400"
              />
              <Calendar className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <div className="relative">
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full pl-11 pr-3 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-gray-800 shadow-sm hover:border-gray-400"
              />
              <Calendar className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={applyToday}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border bg-white hover:bg-gray-50 text-sm"
          >
            <Sparkles className="w-4 h-4 text-blue-600" /> Today
          </button>
          <button
            onClick={applyThisMonth}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border bg-white hover:bg-gray-50 text-sm"
          >
            <Calendar className="w-4 h-4 text-emerald-600" /> This Month
          </button>
          <button
            onClick={applyLastMonth}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border bg-white hover:bg-gray-50 text-sm"
          >
            <Calendar className="w-4 h-4 text-amber-600" /> Last Month
          </button>
        </div>
      </div>
    </div>
  );
};

/* -------------------- Main component -------------------- */
const AccountJournal = () => {
  const [from, setFrom] = useState(firstDayOfMonth());
  const [to, setTo] = useState(todayStr());
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState({}); // { voucher_id: boolean }

  const { data, isLoading, isFetching } = useGetAccountJournalQuery(
    { from_date: from, to_date: to },
    { skip: !from || !to }
  );
  const { data: institute } = useGetInstituteLatestQuery();

  const journals = data?.results?.journals || [];

  const filtered = useMemo(() => {
    const q = (query || "").toLowerCase();
    if (!q) return journals;
    return journals.filter((j) => {
      const head = [j.voucher_id, j.vch_type, j.posted_by, j.date].join(" ");
      const lines = (j.entries || []).map((e) => e.ledger).join(" ");
      return (head + " " + lines).toLowerCase().includes(q);
    });
  }, [journals, query]);

  const totals = useMemo(() => {
    const d = filtered.reduce((s, j) => s + Number(j.total_debit || 0), 0);
    const c = filtered.reduce((s, j) => s + Number(j.total_credit || 0), 0);
    return { d, c, diff: d - c };
  }, [filtered]);

  const toggle = (id) => setCollapsed((m) => ({ ...m, [id]: !m[id] }));
  const collapseAll = (val) => {
    const map = {};
    (filtered || []).forEach((j) => (map[j.voucher_id] = !!val));
    setCollapsed(map);
  };

  /* ---------- Print / PDF ---------- */
 // ---------- Print / PDF ----------
const printReport = () => {
  if (!data) return;

  const logo = institute?.institute_logo || null;
  const name = institute?.institute_name || "Organization";
  const addr = institute?.institute_address || "";

  // Precompute values to avoid nested ${} in the template string
  const tDebit = numberBD(totals.d);
  const tCredit = numberBD(totals.c);
  const tDiff = numberBD(totals.diff);
  const diffColor = totals.diff >= 0 ? "#16a34a" : "#b91c1c";

  const rowsHTML = (filtered || [])
    .map((j) => {
      const entriesHTML = (j.entries || [])
        .map(
          (e, idx) => `
            <tr style="border-top:1px solid #f1f5f9; ${idx % 2 ? "background:#fafafa;" : ""}">
              <td style="padding:8px 12px; font:500 10px ui-sans-serif; color:#334155;">${e.ledger}</td>
              <td style="padding:8px 12px; text-align:right; font:600 10px ui-monospace;">${numberBD(e.debit)}</td>
              <td style="padding:8px 12px; text-align:right; font:600 10px ui-monospace;">${numberBD(e.credit)}</td>
              <td style="padding:8px 12px; text-align:right; font:600 10px ui-monospace;">${numberBD((e.debit || 0) - (e.credit || 0))}</td>
              <td style="padding:8px 12px; font:500 10px ui-sans-serif; color:#64748b;">—</td>
            </tr>`
        )
        .join("");

      return `
        <table style="width:100%; border-collapse:collapse; margin:14px 0; border:1px solid #e5e7eb;">
          <thead>
            <tr style="background:#f8fafc; border-bottom:2px solid #e2e8f0;">
              <th colspan="5" style="text-align:left; padding:10px 12px; font:700 12px ui-sans-serif; color:#0f172a;">
                ${j.voucher_id}
                <span style="font:500 12px ui-sans-serif; color:#64748b; margin-left:10px;">
                  ${j.vch_type} • ${fmtDate(j.date)} • Posted by: ${j.posted_by || "—"}
                </span>
              </th>
            </tr>
            <tr style="background:#f8fafc;">
              <th style="text-align:left; padding:8px 12px; font:600 11px ui-sans-serif; color:#334155;">Ledger</th>
              <th style="text-align:right; padding:8px 12px; font:600 11px ui-sans-serif; color:#334155;">Debit (৳)</th>
              <th style="text-align:right; padding:8px 12px; font:600 11px ui-sans-serif; color:#334155;">Credit (৳)</th>
              <th style="text-align:right; padding:8px 12px; font:600 11px ui-sans-serif; color:#334155;">Balance Effect</th>
              <th style="text-align:left; padding:8px 12px; font:600 11px ui-sans-serif; color:#334155;">Note</th>
            </tr>
          </thead>
          <tbody>
            ${entriesHTML}
          </tbody>
          <tfoot>
            <tr>
              <td style="padding:10px 12px; font:700 11px ui-sans-serif;">Totals</td>
              <td style="padding:10px 12px; text-align:right; font:700 11px ui-monospace;">৳${numberBD(j.total_debit)}</td>
              <td style="padding:10px 12px; text-align:right; font:700 11px ui-monospace;">৳${numberBD(j.total_credit)}</td>
              <td style="padding:10px 12px; text-align:right; font:700 11px ui-monospace; color:${j.total_debit - j.total_credit >= 0 ? "#16a34a" : "#b91c1c"};">
                ৳${numberBD(j.total_debit - j.total_credit)}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>`;
    })
    .join("");

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Account Journal</title>
  <style>
    @page { size: A4 portrait; margin: 14mm; }
    body { font: 10pt ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto; color:#0f172a; }
    .header { display:flex; align-items:center; justify-content:space-between; border-bottom:2px solid #2563eb; padding-bottom:12px; margin-bottom:14px; }
    .brand { display:flex; gap:12px; align-items:center; }
    .brand .logo { width:50px; height:50px; object-fit:contain; border-radius:8px; }
    .brand .name { font: 800 18px ui-sans-serif; }
    .brand .addr { color:#64748b; font: 11px ui-sans-serif; }
    .meta { text-align:center; margin: 4px 0 10px; }
    .meta h1 { margin:0; font: 800 15px ui-sans-serif; letter-spacing:.3px; }
    .meta .period { color:#334155; font: 12px ui-sans-serif; }
    .totals { display:flex; gap:12px; margin:10px 0 12px; }
    .totals .card { border:1px solid #e5e7eb; background:#f8fafc; border-radius:10px; padding:8px 12px; }
    .totals .card h3 { margin:0 0 2px; font: 600 11px ui-sans-serif; color:#475569; text-transform:uppercase; }
    .totals .card .v { font:700 14px ui-sans-serif; }
    .sign { display:flex; justify-content:space-between; align-items:center; margin-top:18px; padding-top:10px; border-top:1px solid #e5e7eb; color:#64748b; font: 10px ui-sans-serif; }
    .sigline { width:140px; border-top:1px solid #334155; margin-bottom:6px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">
      ${logo ? `<img src="${logo}" class="logo" />` : ""}
      <div>
        <div class="name">${name}</div>
        <div class="addr">${addr}</div>
      </div>
    </div>
    <div style="text-align:right; font: 11px ui-sans-serif; color:#475569">Generated: ${new Date().toLocaleString()}</div>
  </div>

  <div class="meta">
    <h1>Account Journal</h1>
    <div class="period">${fmtDate(data.results.from_date)} → ${fmtDate(data.results.to_date)}</div>
  </div>

  <div class="totals">
    <div class="card"><h3>Total Debit</h3><div class="v">৳${tDebit}</div></div>
    <div class="card"><h3>Total Credit</h3><div class="v">৳${tCredit}</div></div>
    <div class="card"><h3>Difference</h3><div class="v" style="color:${diffColor}">৳${tDiff}</div></div>
  </div>

  ${rowsHTML}

  <div class="sign">
    <div>Journals: ${filtered.length} / ${journals.length}</div>
    <div style="text-align:center">
      <div class="sigline"></div>
      <div><strong>Authorized Signature</strong></div>
    </div>
  </div>

  <script>window.print(); window.onafterprint = () => window.close();</script>
</body>
</html>`;

  const w = window.open("", "_blank");
  w.document.write(html);
  w.document.close();
};


  const loading = isLoading || isFetching;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Account Journal</h1>
              <p className="text-gray-600">Voucher-wise double-entry view for a period</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={printReport}
                disabled={!data}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 text-sm disabled:opacity-50"
              >
                <Printer className="w-4 h-4" /> Print / PDF
              </button>
            </div>
          </div>
        </div>

        {/* Date range */}
        <DateRangeBar from={from} to={to} setFrom={setFrom} setTo={setTo} />

        {/* Search & brand row */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search voucher id, ledger, type, posted by..."
              className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            {institute?.institute_logo && (
              <img src={institute.institute_logo} alt="Logo" className="w-10 h-10 rounded-md border object-contain" />
            )}
            <div className="text-sm">
              <div className="font-semibold text-gray-900">{institute?.institute_name || "Organization"}</div>
              <div className="text-gray-500">{fmtDate(from)} → {fmtDate(to)}</div>
            </div>
          </div>
        </div>

        {/* Totals */}
        {data && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl p-6 border-2 border-emerald-200 bg-emerald-50">
              <div className="flex items-center gap-2 mb-1">
                <Layers className="w-5 h-5 text-emerald-600" />
                <h3 className="font-semibold text-emerald-900">Total Debit</h3>
              </div>
              <div className="text-2xl font-bold text-emerald-700">৳{numberBD(totals.d)}</div>
            </div>
            <div className="rounded-xl p-6 border-2 border-amber-200 bg-amber-50">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-5 h-5 text-amber-600" />
                <h3 className="font-semibold text-amber-900">Total Credit</h3>
              </div>
              <div className="text-2xl font-bold text-amber-700">৳{numberBD(totals.c)}</div>
            </div>
            <div className="rounded-xl p-6 border-2 border-sky-200 bg-sky-50">
              <div className="flex items-center gap-2 mb-1">
                <Receipt className="w-5 h-5 text-sky-600" />
                <h3 className="font-semibold text-sky-900">Journals</h3>
              </div>
              <div className="text-2xl font-bold text-sky-700">{filtered.length} / {journals.length}</div>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-600">Loading account journal...</p>
          </div>
        )}

        {/* No data hint */}
        {!loading && (!from || !to) && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Pick a date range</h3>
                <p className="text-gray-600">Select both start and end dates to view journals.</p>
              </div>
            </div>
          </div>
        )}

        {/* Journal list */}
        {!loading && filtered.length > 0 && (
          <div className="space-y-6">
            {filtered.map((j) => {
              const isCollapsed = !!collapsed[j.voucher_id];
              return (
                <div key={j.voucher_id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <button
                    onClick={() => toggle(j.voucher_id)}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 border-b rounded-t-xl"
                  >
                    <div className="flex items-center gap-2 text-left">
                      {isCollapsed ? (
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      )}
                      <div>
                        <div className="font-semibold text-gray-900">{j.voucher_id}</div>
                        <div className="text-xs text-gray-600">{j.vch_type} • {fmtDate(j.date)} • Posted by: {j.posted_by || "—"}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-6 text-sm text-gray-700">
                      <div>
                        <div className="text-gray-500">Total Debit</div>
                        <div className="font-mono font-semibold">৳{numberBD(j.total_debit)}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Total Credit</div>
                        <div className="font-mono font-semibold">৳{numberBD(j.total_credit)}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Diff (D−C)</div>
                        <div className={`font-mono font-semibold ${j.total_debit - j.total_credit >= 0 ? "text-green-700" : "text-red-700"}`}>
                          ৳{numberBD(j.total_debit - j.total_credit)}
                        </div>
                      </div>
                    </div>
                  </button>

                  {!isCollapsed && (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr className="text-left text-sm text-gray-900">
                            <th className="py-3 px-6">Ledger</th>
                            <th className="py-3 px-6 text-right">Debit (৳)</th>
                            <th className="py-3 px-6 text-right">Credit (৳)</th>
                            <th className="py-3 px-6 text-right">Effect</th>
                          </tr>
                        </thead>
                        <tbody>
                          {j.entries.map((e, idx) => (
                            <tr key={j.voucher_id + idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                              <td className="py-3 px-6">{e.ledger}</td>
                              <td className="py-3 px-6 text-right font-mono">{numberBD(e.debit)}</td>
                              <td className="py-3 px-6 text-right font-mono">{numberBD(e.credit)}</td>
                              <td className={`py-3 px-6 text-right font-mono ${e.debit - e.credit >= 0 ? "text-green-700" : "text-red-700"}`}>
                                {numberBD((e.debit || 0) - (e.credit || 0))}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Bulk actions */}
            <div className="flex items-center gap-2 justify-end">
              <button onClick={() => collapseAll(true)} className="px-3 py-2 text-sm rounded-lg border bg-gray-50 hover:bg-gray-100 text-gray-700 flex items-center gap-2">
                <ChevronRight className="w-4 h-4" /> Collapse all
              </button>
              <button onClick={() => collapseAll(false)} className="px-3 py-2 text-sm rounded-lg border bg-gray-50 hover:bg-gray-100 text-gray-700 flex items-center gap-2">
                <ChevronDown className="w-4 h-4" /> Expand all
              </button>
            </div>
          </div>
        )}

        {/* No results */}
        {!loading && from && to && filtered.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-gray-600">No journals found for the selected range.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountJournal;
