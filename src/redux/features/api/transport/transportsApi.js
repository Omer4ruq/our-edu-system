import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import BASE_URL from '../../../../utilitis/apiConfig';

const getToken = () => localStorage.getItem('token');

export const transportsApi = createApi({
  reducerPath: 'transportsApi',
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
  tagTypes: ['Transports'],
  endpoints: (builder) => ({
    // GET: Fetch all transports
    getTransports: builder.query({
      query: () => '/transports/',
      providesTags: ['Transports'],
    }),

    // GET: Fetch a single transport by ID
    getTransportById: builder.query({
      query: (id) => `/transports/${id}/`,
      providesTags: ['Transports'],
    }),

    // POST: Create a new transport
    createTransport: builder.mutation({
      query: (transportData) => ({
        url: '/transports/',
        method: 'POST',
        body: transportData,
      }),
      invalidatesTags: ['Transports'],
    }),

    // PUT: Update an existing transport
    updateTransport: builder.mutation({
      query: ({ id, ...transportData }) => ({
        url: `/transports/${id}/`,
        method: 'PUT',
        body: transportData,
      }),
      invalidatesTags: ['Transports'],
    }),

    // PATCH: Partially update a transport
    patchTransport: builder.mutation({
      query: ({ id, ...transportData }) => ({
        url: `/transports/${id}/`,
        method: 'PATCH',
        body: transportData,
      }),
      invalidatesTags: ['Transports'],
    }),

    // DELETE: Delete a transport
    deleteTransport: builder.mutation({
      query: (id) => ({
        url: `/transports/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Transports'],
    }),
  }),
});

export const {
  useGetTransportsQuery,
  useGetTransportByIdQuery,
  useCreateTransportMutation,
  useUpdateTransportMutation,
  usePatchTransportMutation,
  useDeleteTransportMutation,
} = transportsApi;