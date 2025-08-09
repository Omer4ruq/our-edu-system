import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import BASE_URL from '../../../../utilitis/apiConfig';

const getToken = () => localStorage.getItem('token');

export const salaryProcessApi = createApi({
  reducerPath: 'salaryProcessApi',
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
  tagTypes: ['SalaryProcess'],
  endpoints: (builder) => ({
    // GET: Fetch all salary process records
    getSalaryProcesses: builder.query({
      query: () => '/salary-process/',
      providesTags: ['SalaryProcess'],
    }),

    // GET: Fetch a single salary process record by ID
    getSalaryProcessById: builder.query({
      query: (id) => `/salary-process/${id}/`,
      providesTags: ['SalaryProcess'],
    }),

    // POST: Create a new salary process record
    createSalaryProcess: builder.mutation({
      query: (data) => ({
        url: '/salary-process/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['SalaryProcess'],
    }),

    // PUT: Update an existing salary process record
    updateSalaryProcess: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/salary-process/${id}/`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['SalaryProcess'],
    }),

    // PATCH: Partially update a salary process record
    patchSalaryProcess: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/salary-process/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['SalaryProcess'],
    }),

    // DELETE: Delete a salary process record
    deleteSalaryProcess: builder.mutation({
      query: (id) => ({
        url: `/salary-process/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SalaryProcess'],
    }),
  }),
});

export const {
  useGetSalaryProcessesQuery,
  useGetSalaryProcessByIdQuery,
  useCreateSalaryProcessMutation,
  useUpdateSalaryProcessMutation,
  usePatchSalaryProcessMutation,
  useDeleteSalaryProcessMutation,
} = salaryProcessApi;