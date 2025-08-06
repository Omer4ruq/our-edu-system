import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import BASE_URL from '../../../../utilitis/apiConfig';

const getToken = () => localStorage.getItem('token');

export const employeesDeductionsApi = createApi({
  reducerPath: 'employeesDeductionsApi',
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
  tagTypes: ['EmployeesDeductions'],
  endpoints: (builder) => ({
    getEmployeesDeductions: builder.query({
      query: () => '/employees-deductions/',
      providesTags: ['EmployeesDeductions'],
    }),

    getEmployeeDeductionById: builder.query({
      query: (id) => `/employees-deductions/${id}/`,
      providesTags: ['EmployeesDeductions'],
    }),

    createEmployeeDeduction: builder.mutation({
      query: (deductionData) => ({
        url: '/employees-deductions/',
        method: 'POST',
        body: deductionData,
      }),
      invalidatesTags: ['EmployeesDeductions'],
    }),

    updateEmployeeDeduction: builder.mutation({
      query: ({ id, ...deductionData }) => ({
        url: `/employees-deductions/${id}/`,
        method: 'PUT',
        body: deductionData,
      }),
      invalidatesTags: ['EmployeesDeductions'],
    }),

    patchEmployeeDeduction: builder.mutation({
      query: ({ id, ...deductionData }) => ({
        url: `/employees-deductions/${id}/`,
        method: 'PATCH',
        body: deductionData,
      }),
      invalidatesTags: ['EmployeesDeductions'],
    }),

    deleteEmployeeDeduction: builder.mutation({
      query: (id) => ({
        url: `/employees-deductions/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['EmployeesDeductions'],
    }),
  }),
});

export const {
  useGetEmployeesDeductionsQuery,
  useGetEmployeeDeductionByIdQuery,
  useCreateEmployeeDeductionMutation,
  useUpdateEmployeeDeductionMutation,
  usePatchEmployeeDeductionMutation,
  useDeleteEmployeeDeductionMutation,
} = employeesDeductionsApi;