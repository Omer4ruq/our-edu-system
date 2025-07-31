import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import BASE_URL from '../../../../utilitis/apiConfig';


const getToken = () => {
  return localStorage.getItem('token'); 
};

export const feePackagesApi = createApi({
  reducerPath: 'feePackagesApi',
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
  tagTypes: ['FeePackages'],
  endpoints: (builder) => ({
    // GET: Fetch all fee packages
    getFeePackages: builder.query({
      query: () => '/fee-packages/',
      providesTags: ['FeePackages'],
    }),

    // GET: Fetch single fee package by ID
    getFeePackageById: builder.query({
      query: (id) => `/fee-packages/${id}/`,
      providesTags: ['FeePackages'],
    }),

    // POST: Create a new fee package
    createFeePackage: builder.mutation({
      query: (feePackageData) => ({
        url: '/fee-packages/',
        method: 'POST',
        body: feePackageData,
      }),
      invalidatesTags: ['FeePackages'],
    }),

    // PUT: Update an existing fee package
    updateFeePackage: builder.mutation({
      query: ({ id, ...feePackageData }) => ({
        url: `/fee-packages/${id}/`,
        method: 'PUT',
        body: feePackageData,
      }),
      invalidatesTags: ['FeePackages'],
    }),

    // DELETE: Delete a fee package
    deleteFeePackage: builder.mutation({
      query: (id) => ({
        url: `/fee-packages/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['FeePackages'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetFeePackagesQuery,
  useGetFeePackageByIdQuery,
  useCreateFeePackageMutation,
  useUpdateFeePackageMutation,
  useDeleteFeePackageMutation,
} = feePackagesApi;