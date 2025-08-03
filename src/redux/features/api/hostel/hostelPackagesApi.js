import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import BASE_URL from '../../../../utilitis/apiConfig';

const getToken = () => {
  return localStorage.getItem('token');
};

export const hostelPackagesApi = createApi({
  reducerPath: 'hostelPackagesApi',
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
  tagTypes: ['HostelPackages'],
  endpoints: (builder) => ({
    // GET: Fetch all hostel packages
    getHostelPackages: builder.query({
      query: () => '/hostel-packages/',
      providesTags: ['HostelPackages'],
    }),

    // GET: Fetch a single hostel package by ID
    getHostelPackageById: builder.query({
      query: (id) => `/hostel-packages/${id}/`,
      providesTags: ['HostelPackages'],
    }),

    // POST: Create a new hostel package
    createHostelPackage: builder.mutation({
      query: (packageData) => ({
        url: '/hostel-packages/',
        method: 'POST',
        body: packageData,
      }),
      invalidatesTags: ['HostelPackages'],
    }),

    // PUT: Update an existing hostel package
    updateHostelPackage: builder.mutation({
      query: ({ id, ...packageData }) => ({
        url: `/hostel-packages/${id}/`,
        method: 'PUT',
        body: packageData,
      }),
      invalidatesTags: ['HostelPackages'],
    }),

    // PATCH: Partially update a hostel package
    patchHostelPackage: builder.mutation({
      query: ({ id, ...packageData }) => ({
        url: `/hostel-packages/${id}/`,
        method: 'PATCH',
        body: packageData,
      }),
      invalidatesTags: ['HostelPackages'],
    }),

    // DELETE: Delete a hostel package
    deleteHostelPackage: builder.mutation({
      query: (id) => ({
        url: `/hostel-packages/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['HostelPackages'],
    }),
  }),
});

export const {
  useGetHostelPackagesQuery,
  useGetHostelPackageByIdQuery,
  useCreateHostelPackageMutation,
  useUpdateHostelPackageMutation,
  usePatchHostelPackageMutation,
  useDeleteHostelPackageMutation,
} = hostelPackagesApi;