import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import BASE_URL from '../../../../utilitis/apiConfig';

const getToken = () => localStorage.getItem('token');

export const transportRoutesApi = createApi({
  reducerPath: 'transportRoutesApi',
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
  tagTypes: ['TransportRoutes'],
  endpoints: (builder) => ({
    // GET: Fetch all transport routes
    getTransportRoutes: builder.query({
      query: () => '/transport-routes/',
      providesTags: ['TransportRoutes'],
    }),

    // GET: Fetch a single transport route by ID
    getTransportRouteById: builder.query({
      query: (id) => `/transport-routes/${id}/`,
      providesTags: ['TransportRoutes'],
    }),

    // POST: Create a new transport route
    createTransportRoute: builder.mutation({
      query: (routeData) => ({
        url: '/transport-routes/',
        method: 'POST',
        body: routeData,
      }),
      invalidatesTags: ['TransportRoutes'],
    }),

    // PUT: Update an existing transport route
    updateTransportRoute: builder.mutation({
      query: ({ id, ...routeData }) => ({
        url: `/transport-routes/${id}/`,
        method: 'PUT',
        body: routeData,
      }),
      invalidatesTags: ['TransportRoutes'],
    }),

    // PATCH: Partially update a transport route
    patchTransportRoute: builder.mutation({
      query: ({ id, ...routeData }) => ({
        url: `/transport-routes/${id}/`,
        method: 'PATCH',
        body: routeData,
      }),
      invalidatesTags: ['TransportRoutes'],
    }),

    // DELETE: Delete a transport route
    deleteTransportRoute: builder.mutation({
      query: (id) => ({
        url: `/transport-routes/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['TransportRoutes'],
    }),
  }),
});

export const {
  useGetTransportRoutesQuery,
  useGetTransportRouteByIdQuery,
  useCreateTransportRouteMutation,
  useUpdateTransportRouteMutation,
  usePatchTransportRouteMutation,
  useDeleteTransportRouteMutation,
} = transportRoutesApi;