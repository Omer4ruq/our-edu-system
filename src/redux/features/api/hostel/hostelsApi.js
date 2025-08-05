import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import BASE_URL from '../../../../utilitis/apiConfig';

const getToken = () => localStorage.getItem('token');

export const hostelsApi = createApi({
  reducerPath: 'hostelsApi',
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
  tagTypes: ['Hostels'],
  endpoints: (builder) => ({
    // GET: Fetch all hostels
    getHostels: builder.query({
      query: () => '/hostels/',
      providesTags: ['Hostels'],
    }),

    // GET: Fetch a single hostel by ID
    getHostelById: builder.query({
      query: (id) => `/hostels/${id}/`,
      providesTags: ['Hostels'],
    }),

    // POST: Create a new hostel
    createHostel: builder.mutation({
      query: (hostelData) => ({
        url: '/hostels/',
        method: 'POST',
        body: hostelData,
      }),
      invalidatesTags: ['Hostels'],
    }),

    // PUT: Update an existing hostel
    updateHostel: builder.mutation({
      query: ({ id, ...hostelData }) => ({
        url: `/hostels/${id}/`,
        method: 'PUT',
        body: hostelData,
      }),
      invalidatesTags: ['Hostels'],
    }),

    // PATCH: Partially update a hostel
    patchHostel: builder.mutation({
      query: ({ id, ...hostelData }) => ({
        url: `/hostels/${id}/`,
        method: 'PATCH',
        body: hostelData,
      }),
      invalidatesTags: ['Hostels'],
    }),

    // DELETE: Delete a hostel
    deleteHostel: builder.mutation({
      query: (id) => ({
        url: `/hostels/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Hostels'],
    }),
  }),
});

export const {
  useGetHostelsQuery,
  useGetHostelByIdQuery,
  useCreateHostelMutation,
  useUpdateHostelMutation,
  usePatchHostelMutation,
  useDeleteHostelMutation,
} = hostelsApi;