import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = 'https://test.madrasa.top/api';

const getToken = () => localStorage.getItem('token');

export const financialReportsApi = createApi({
  reducerPath: 'financialReportsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers) => {
      const token = getToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: [
    'TrialBalance',
    'IncomeStatement',
    'BalanceSheet',
    'CashSummary',
    'LedgerSummary',
    'AccountJournal',
    'UserTransactions',
    'CashBankBook',
    'AccountStatement',
  ],
  endpoints: (builder) => ({
    getTrialBalance: builder.query({
      query: ({ from_date, to_date }) =>
        `/trial-balance/?from_date=${from_date}&to_date=${to_date}`,
      providesTags: ['TrialBalance'],
    }),

    getIncomeStatement: builder.query({
      query: ({ from_date, to_date }) =>
        `/income-statement/?from_date=${from_date}&to_date=${to_date}`,
      providesTags: ['IncomeStatement'],
    }),

    getBalanceSheet: builder.query({
      query: ({ from_date, to_date }) =>
        `/balance-sheet/?from_date=${from_date}&to_date=${to_date}`,
      providesTags: ['BalanceSheet'],
    }),

    getCashSummary: builder.query({
      query: ({ from_date, to_date }) =>
        `/cash-summary/?from_date=${from_date}&to_date=${to_date}`,
      providesTags: ['CashSummary'],
    }),

    getLedgerSummary: builder.query({
      query: ({ from_date, to_date }) =>
        `/ledger-summary/?from_date=${from_date}&to_date=${to_date}`,
      providesTags: ['LedgerSummary'],
    }),

    getAccountJournal: builder.query({
      query: ({ from_date, to_date }) =>
        `/account-journal/?from_date=${from_date}&to_date=${to_date}`,
      providesTags: ['AccountJournal'],
    }),

    getUserTransactions: builder.query({
      query: ({ from_date, to_date }) =>
        `/user-transactions/?from_date=${from_date}&to_date=${to_date}`,
      providesTags: ['UserTransactions'],
    }),

    getCashBankBook: builder.query({
      query: ({ from_date, to_date }) =>
        `/cash-bank-book/?from_date=${from_date}&to_date=${to_date}`,
      providesTags: ['CashBankBook'],
    }),

    getAccountStatement: builder.query({
      query: ({ from_date, to_date }) =>
        `/account-statement/?from_date=${from_date}&to_date=${to_date}`,
      providesTags: ['AccountStatement'],
    }),
  }),
});

export const {
  useGetTrialBalanceQuery,
  useGetIncomeStatementQuery,
  useGetBalanceSheetQuery,
  useGetCashSummaryQuery,
  useGetLedgerSummaryQuery,
  useGetAccountJournalQuery,
  useGetUserTransactionsQuery,
  useGetCashBankBookQuery,
  useGetAccountStatementQuery,
} = financialReportsApi;