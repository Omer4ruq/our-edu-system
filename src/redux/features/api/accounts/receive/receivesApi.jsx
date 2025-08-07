import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import BASE_URL from '../../../../../utilitis/apiConfig';

const getToken = () => localStorage.getItem('token');

export const receivesApi = createApi({
  reducerPath: 'receivesApi',
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
  tagTypes: ['Receives'],
  endpoints: (builder) => ({
    // GET: Fetch all receives
    getReceives: builder.query({
      query: () => '/receives/',
      providesTags: ['Receives'],
    }),

    // GET: Fetch a single receive by ID
    getReceiveById: builder.query({
      query: (id) => `/receives/${id}/`,
      providesTags: ['Receives'],
    }),

    // POST: Create a new receive
    createReceive: builder.mutation({
      query: (receiveData) => ({
        url: '/receives/',
        method: 'POST',
        body: receiveData,
      }),
      invalidatesTags: ['Receives'],
    }),

    // PUT: Update an existing receive
    updateReceive: builder.mutation({
      query: ({ id, ...receiveData }) => ({
        url: `/receives/${id}/`,
        method: 'PUT',
        body: receiveData,
      }),
      invalidatesTags: ['Receives'],
    }),

    // PATCH: Partially update a receive
    patchReceive: builder.mutation({
      query: ({ id, ...receiveData }) => ({
        url: `/receives/${id}/`,
        method: 'PATCH',
        body: receiveData,
      }),
      invalidatesTags: ['Receives'],
    }),

    // DELETE: Delete a receive
    deleteReceive: builder.mutation({
      query: (id) => ({
        url: `/receives/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Receives'],
    }),
  }),
});

export const {
  useGetReceivesQuery,
  useGetReceiveByIdQuery,
  useCreateReceiveMutation,
  useUpdateReceiveMutation,
  usePatchReceiveMutation,
  useDeleteReceiveMutation,
} = receivesApi;