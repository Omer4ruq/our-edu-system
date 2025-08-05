import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import BASE_URL from '../../../../utilitis/apiConfig';

const getToken = () => localStorage.getItem('token');

export const deductionTypesApi = createApi({
  reducerPath: 'deductionTypesApi',
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
  tagTypes: ['DeductionTypes'],
  endpoints: (builder) => ({
    // GET: Fetch all deduction types
    getDeductionTypes: builder.query({
      query: () => '/deduction-types/',
      providesTags: ['DeductionTypes'],
    }),

    // GET: Fetch a single deduction type by ID
    getDeductionTypeById: builder.query({
      query: (id) => `/deduction-types/${id}/`,
      providesTags: ['DeductionTypes'],
    }),

    // POST: Create a new deduction type
    createDeductionType: builder.mutation({
      query: (deductionTypeData) => ({
        url: '/deduction-types/',
        method: 'POST',
        body: deductionTypeData,
      }),
      invalidatesTags: ['DeductionTypes'],
    }),

    // PUT: Update an existing deduction type
    updateDeductionType: builder.mutation({
      query: ({ id, ...deductionTypeData }) => ({
        url: `/deduction-types/${id}/`,
        method: 'PUT',
        body: deductionTypeData,
      }),
      invalidatesTags: ['DeductionTypes'],
    }),

    // PATCH: Partially update a deduction type
    patchDeductionType: builder.mutation({
      query: ({ id, ...deductionTypeData }) => ({
        url: `/deduction-types/${id}/`,
        method: 'PATCH',
        body: deductionTypeData,
      }),
      invalidatesTags: ['DeductionTypes'],
    }),

    // DELETE: Delete a deduction type
    deleteDeductionType: builder.mutation({
      query: (id) => ({
        url: `/deduction-types/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['DeductionTypes'],
    }),
  }),
});

export const {
  useGetDeductionTypesQuery,
  useGetDeductionTypeByIdQuery,
  useCreateDeductionTypeMutation,
  useUpdateDeductionTypeMutation,
  usePatchDeductionTypeMutation,
  useDeleteDeductionTypeMutation,
} = deductionTypesApi;