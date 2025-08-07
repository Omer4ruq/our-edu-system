import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import BASE_URL from '../../../../../utilitis/apiConfig';

const getToken = () => localStorage.getItem('token');

export const journalsApi = createApi({
  reducerPath: 'journalsApi',
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
  tagTypes: ['Journals'],
  endpoints: (builder) => ({
    // GET: Fetch all journals
    getJournals: builder.query({
      query: () => '/journals/',
      providesTags: ['Journals'],
    }),

    // GET: Fetch a single journal by ID
    getJournalById: builder.query({
      query: (id) => `/journals/${id}/`,
      providesTags: ['Journals'],
    }),

    // POST: Create a new journal entry
    createJournal: builder.mutation({
      query: (journalData) => ({
        url: '/journals/',
        method: 'POST',
        body: journalData,
      }),
      invalidatesTags: ['Journals'],
    }),

    // PUT: Update an existing journal
    updateJournal: builder.mutation({
      query: ({ id, ...journalData }) => ({
        url: `/journals/${id}/`,
        method: 'PUT',
        body: journalData,
      }),
      invalidatesTags: ['Journals'],
    }),

    // PATCH: Partially update a journal
    patchJournal: builder.mutation({
      query: ({ id, ...journalData }) => ({
        url: `/journals/${id}/`,
        method: 'PATCH',
        body: journalData,
      }),
      invalidatesTags: ['Journals'],
    }),

    // DELETE: Delete a journal
    deleteJournal: builder.mutation({
      query: (id) => ({
        url: `/journals/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Journals'],
    }),
  }),
});

export const {
  useGetJournalsQuery,
  useGetJournalByIdQuery,
  useCreateJournalMutation,
  useUpdateJournalMutation,
  usePatchJournalMutation,
  useDeleteJournalMutation,
} = journalsApi;