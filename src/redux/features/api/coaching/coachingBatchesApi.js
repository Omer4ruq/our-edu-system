import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import BASE_URL from '../../../../utilitis/apiConfig';

const getToken = () => localStorage.getItem('token');

export const coachingBatchesApi = createApi({
  reducerPath: 'coachingBatchesApi',
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
  tagTypes: ['CoachingBatches'],
  endpoints: (builder) => ({
    // GET: Fetch all coaching batches
    getCoachingBatches: builder.query({
      query: () => '/coaching-batches/',
      providesTags: ['CoachingBatches'],
    }),

    // GET: Fetch a single coaching batch by ID
    getCoachingBatchById: builder.query({
      query: (id) => `/coaching-batches/${id}/`,
      providesTags: ['CoachingBatches'],
    }),

    // POST: Create a new coaching batch
    createCoachingBatch: builder.mutation({
      query: (batchData) => ({
        url: '/coaching-batches/',
        method: 'POST',
        body: batchData,
      }),
      invalidatesTags: ['CoachingBatches'],
    }),

    // PUT: Update an existing coaching batch
    updateCoachingBatch: builder.mutation({
      query: ({ id, ...batchData }) => ({
        url: `/coaching-batches/${id}/`,
        method: 'PUT',
        body: batchData,
      }),
      invalidatesTags: ['CoachingBatches'],
    }),

    // PATCH: Partially update a coaching batch
    patchCoachingBatch: builder.mutation({
      query: ({ id, ...batchData }) => ({
        url: `/coaching-batches/${id}/`,
        method: 'PATCH',
        body: batchData,
      }),
      invalidatesTags: ['CoachingBatches'],
    }),

    // DELETE: Delete a coaching batch
    deleteCoachingBatch: builder.mutation({
      query: (id) => ({
        url: `/coaching-batches/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['CoachingBatches'],
    }),
  }),
});

export const {
  useGetCoachingBatchesQuery,
  useGetCoachingBatchByIdQuery,
  useCreateCoachingBatchMutation,
  useUpdateCoachingBatchMutation,
  usePatchCoachingBatchMutation,
  useDeleteCoachingBatchMutation,
} = coachingBatchesApi;