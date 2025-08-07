import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import BASE_URL from '../../../../../utilitis/apiConfig';

const getToken = () => localStorage.getItem('token');

export const ledgerListApi = createApi({
  reducerPath: 'ledgerListApi',
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
  tagTypes: ['LedgerList'],
  endpoints: (builder) => ({
    // GET: Fetch all ledger entries
    getLedgerList: builder.query({
      query: () => '/ledger-list/',
      providesTags: ['LedgerList'],
    }),

    // GET: Fetch a single ledger entry by ID
    getLedgerById: builder.query({
      query: (id) => `/ledger-list/${id}/`,
      providesTags: ['LedgerList'],
    }),

    // POST: Create a new ledger entry
    createLedgerEntry: builder.mutation({
      query: (ledgerData) => ({
        url: '/ledger-list/',
        method: 'POST',
        body: ledgerData,
      }),
      invalidatesTags: ['LedgerList'],
    }),

    // PUT: Update an existing ledger entry
    updateLedgerEntry: builder.mutation({
      query: ({ id, ...ledgerData }) => ({
        url: `/ledger-list/${id}/`,
        method: 'PUT',
        body: ledgerData,
      }),
      invalidatesTags: ['LedgerList'],
    }),

    // PATCH: Partially update a ledger entry
    patchLedgerEntry: builder.mutation({
      query: ({ id, ...ledgerData }) => ({
        url: `/ledger-list/${id}/`,
        method: 'PATCH',
        body: ledgerData,
      }),
      invalidatesTags: ['LedgerList'],
    }),

    // DELETE: Delete a ledger entry
    deleteLedgerEntry: builder.mutation({
      query: (id) => ({
        url: `/ledger-list/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['LedgerList'],
    }),
       getLedgerOptions: builder.query({
      query: () => '/ledgers/options/',
      providesTags: ['LedgerOptions'],
    }),

  }),
});

export const {
  useGetLedgerListQuery,
  useGetLedgerByIdQuery,
  useCreateLedgerEntryMutation,
  useUpdateLedgerEntryMutation,
  usePatchLedgerEntryMutation,
  useDeleteLedgerEntryMutation,
  useGetLedgerOptionsQuery,
} = ledgerListApi;