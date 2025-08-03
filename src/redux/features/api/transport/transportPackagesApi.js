import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import BASE_URL from '../../../../utilitis/apiConfig';

const getToken = () => localStorage.getItem('token');

export const transportPackagesApi = createApi({
  reducerPath: 'transportPackagesApi',
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
  tagTypes: ['TransportPackages'],
  endpoints: (builder) => ({
    // GET: Fetch all transport packages
    getTransportPackages: builder.query({
      query: () => '/transport-packages/',
      providesTags: ['TransportPackages'],
    }),

    // GET: Fetch a single transport package by ID
    getTransportPackageById: builder.query({
      query: (id) => `/transport-packages/${id}/`,
      providesTags: ['TransportPackages'],
    }),

    // POST: Create a new transport package
    createTransportPackage: builder.mutation({
      query: (packageData) => ({
        url: '/transport-packages/',
        method: 'POST',
        body: packageData,
      }),
      invalidatesTags: ['TransportPackages'],
    }),

    // PUT: Update an existing transport package
    updateTransportPackage: builder.mutation({
      query: ({ id, ...packageData }) => ({
        url: `/transport-packages/${id}/`,
        method: 'PUT',
        body: packageData,
      }),
      invalidatesTags: ['TransportPackages'],
    }),

    // PATCH: Partially update a transport package
    patchTransportPackage: builder.mutation({
      query: ({ id, ...packageData }) => ({
        url: `/transport-packages/${id}/`,
        method: 'PATCH',
        body: packageData,
      }),
      invalidatesTags: ['TransportPackages'],
    }),

    // DELETE: Delete a transport package
    deleteTransportPackage: builder.mutation({
      query: (id) => ({
        url: `/transport-packages/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['TransportPackages'],
    }),
  }),
});

export const {
  useGetTransportPackagesQuery,
  useGetTransportPackageByIdQuery,
  useCreateTransportPackageMutation,
  useUpdateTransportPackageMutation,
  usePatchTransportPackageMutation,
  useDeleteTransportPackageMutation,
} = transportPackagesApi;