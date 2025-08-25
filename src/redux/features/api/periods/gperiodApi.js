import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import BASE_URL2 from '../../../../utilitis/apiConfig2';

const getToken = () => localStorage.getItem('token');

export const gperiodApi = createApi({
  reducerPath: 'gperiodApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL2,
    prepareHeaders: (headers) => {
      const token = getToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Gperiod'],
  endpoints: (builder) => ({
    // GET: Fetch all gperiods
    getGperiods: builder.query({
      query: () => '/gperiod/',
      providesTags: ['Gperiod'],
    }),

    // GET: Fetch a single gperiod by ID
    getGperiodById: builder.query({
      query: (id) => `/gperiod/${id}/`,
      providesTags: ['Gperiod'],
    }),

    // POST: Create a new gperiod
    createGperiod: builder.mutation({
      query: (data) => ({
        url: '/gperiod/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Gperiod'],
    }),

    // PUT: Update an existing gperiod
    updateGperiod: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/gperiod/${id}/`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Gperiod'],
    }),

    // PATCH: Partially update a gperiod
    patchGperiod: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/gperiod/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Gperiod'],
    }),

    // DELETE: Delete a gperiod
    deleteGperiod: builder.mutation({
      query: (id) => ({
        url: `/gperiod/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Gperiod'],
    }),
  }),
});

export const {
  useGetGperiodsQuery,
  useGetGperiodByIdQuery,
  useCreateGperiodMutation,
  useUpdateGperiodMutation,
  usePatchGperiodMutation,
  useDeleteGperiodMutation,
} = gperiodApi;