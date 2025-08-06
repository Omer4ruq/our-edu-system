import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import BASE_URL from '../../../../utilitis/apiConfig';

const getToken = () => localStorage.getItem('token');

export const basicSalaryApi = createApi({
  reducerPath: 'basicSalaryApi',
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
  tagTypes: ['BasicSalary'],
  endpoints: (builder) => ({
    // GET: Fetch all basic salary records
    getBasicSalaries: builder.query({
      query: () => '/basic-salary/',
      providesTags: ['BasicSalary'],
    }),

    // GET: Fetch a single basic salary record by ID
    getBasicSalaryById: builder.query({
      query: (id) => `/basic-salary/${id}/`,
      providesTags: ['BasicSalary'],
    }),

    // POST: Create a new basic salary record
    createBasicSalary: builder.mutation({
      query: (salaryData) => ({
        url: '/basic-salary/',
        method: 'POST',
        body: salaryData,
      }),
      invalidatesTags: ['BasicSalary'],
    }),

    // PUT: Update an existing basic salary record
    updateBasicSalary: builder.mutation({
      query: ({ id, ...salaryData }) => ({
        url: `/basic-salary/${id}/`,
        method: 'PUT',
        body: salaryData,
      }),
      invalidatesTags: ['BasicSalary'],
    }),

    // PATCH: Partially update a basic salary record
    patchBasicSalary: builder.mutation({
      query: ({ id, ...salaryData }) => ({
        url: `/basic-salary/${id}/`,
        method: 'PATCH',
        body: salaryData,
      }),
      invalidatesTags: ['BasicSalary'],
    }),

    // DELETE: Delete a basic salary record
    deleteBasicSalary: builder.mutation({
      query: (id) => ({
        url: `/basic-salary/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['BasicSalary'],
    }),
  }),
});

export const {
  useGetBasicSalariesQuery,
  useGetBasicSalaryByIdQuery,
  useCreateBasicSalaryMutation,
  useUpdateBasicSalaryMutation,
  usePatchBasicSalaryMutation,
  useDeleteBasicSalaryMutation,
} = basicSalaryApi;