import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import BASE_URL from '../../../../utilitis/apiConfig';

const getToken = () => localStorage.getItem('token');

export const salaryIncrementsApi = createApi({
  reducerPath: 'salaryIncrementsApi',
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
  tagTypes: ['SalaryIncrements'],
  endpoints: (builder) => ({
    // GET: Fetch all salary increments
    getSalaryIncrements: builder.query({
      query: () => '/salary-increments/',
      providesTags: ['SalaryIncrements'],
    }),

    // GET: Fetch a single salary increment by ID
    getSalaryIncrementById: builder.query({
      query: (id) => `/salary-increments/${id}/`,
      providesTags: ['SalaryIncrements'],
    }),

    // POST: Create a new salary increment
    createSalaryIncrement: builder.mutation({
      query: (incrementData) => ({
        url: '/salary-increments/',
        method: 'POST',
        body: incrementData,
      }),
      invalidatesTags: ['SalaryIncrements'],
    }),

    // PUT: Update an existing salary increment
    updateSalaryIncrement: builder.mutation({
      query: ({ id, ...incrementData }) => ({
        url: `/salary-increments/${id}/`,
        method: 'PUT',
        body: incrementData,
      }),
      invalidatesTags: ['SalaryIncrements'],
    }),

    // PATCH: Partially update a salary increment
    patchSalaryIncrement: builder.mutation({
      query: ({ id, ...incrementData }) => ({
        url: `/salary-increments/${id}/`,
        method: 'PATCH',
        body: incrementData,
      }),
      invalidatesTags: ['SalaryIncrements'],
    }),

    // DELETE: Delete a salary increment
    deleteSalaryIncrement: builder.mutation({
      query: (id) => ({
        url: `/salary-increments/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SalaryIncrements'],
    }),
  }),
});

export const {
  useGetSalaryIncrementsQuery,
  useGetSalaryIncrementByIdQuery,
  useCreateSalaryIncrementMutation,
  useUpdateSalaryIncrementMutation,
  usePatchSalaryIncrementMutation,
  useDeleteSalaryIncrementMutation,
} = salaryIncrementsApi;