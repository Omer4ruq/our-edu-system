import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import BASE_URL from '../../../../utilitis/apiConfig';

const getToken = () => localStorage.getItem('token');

export const employeesAdditionsApi = createApi({
  reducerPath: 'employeesAdditionsApi',
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
  tagTypes: ['EmployeesAdditions'],
  endpoints: (builder) => ({
    getEmployeesAdditions: builder.query({
      query: () => '/employees-additions/',
      providesTags: ['EmployeesAdditions'],
    }),

    getEmployeeAdditionById: builder.query({
      query: (id) => `/employees-additions/${id}/`,
      providesTags: ['EmployeesAdditions'],
    }),

    createEmployeeAddition: builder.mutation({
      query: (additionData) => ({
        url: '/employees-additions/',
        method: 'POST',
        body: additionData,
      }),
      invalidatesTags: ['EmployeesAdditions'],
    }),

    updateEmployeeAddition: builder.mutation({
      query: ({ id, ...additionData }) => ({
        url: `/employees-additions/${id}/`,
        method: 'PUT',
        body: additionData,
      }),
      invalidatesTags: ['EmployeesAdditions'],
    }),

    patchEmployeeAddition: builder.mutation({
      query: ({ id, ...additionData }) => ({
        url: `/employees-additions/${id}/`,
        method: 'PATCH',
        body: additionData,
      }),
      invalidatesTags: ['EmployeesAdditions'],
    }),

    deleteEmployeeAddition: builder.mutation({
      query: (id) => ({
        url: `/employees-additions/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['EmployeesAdditions'],
    }),
  }),
});

export const {
  useGetEmployeesAdditionsQuery,
  useGetEmployeeAdditionByIdQuery,
  useCreateEmployeeAdditionMutation,
  useUpdateEmployeeAdditionMutation,
  usePatchEmployeeAdditionMutation,
  useDeleteEmployeeAdditionMutation,
} = employeesAdditionsApi;