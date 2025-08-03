import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import BASE_URL from '../../../../utilitis/apiConfig';

const getToken = () => localStorage.getItem('token');

export const hostelNamesApi = createApi({
  reducerPath: 'hostelNamesApi',
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
  tagTypes: ['HostelNames'],
  endpoints: (builder) => ({
    // GET: Fetch all hostel names
    getHostelNames: builder.query({
      query: () => '/hostel-names/',
      providesTags: ['HostelNames'],
    }),

    // GET: Fetch a single hostel name by ID
    getHostelNameById: builder.query({
      query: (id) => `/hostel-names/${id}/`,
      providesTags: ['HostelNames'],
    }),

    // POST: Create a new hostel name
    createHostelName: builder.mutation({
      query: (hostelNameData) => ({
        url: '/hostel-names/',
        method: 'POST',
        body: hostelNameData,
      }),
      invalidatesTags: ['HostelNames'],
    }),

    // PUT: Update an existing hostel name
    updateHostelName: builder.mutation({
      query: ({ id, ...hostelNameData }) => ({
        url: `/hostel-names/${id}/`,
        method: 'PUT',
        body: hostelNameData,
      }),
      invalidatesTags: ['HostelNames'],
    }),

    // PATCH: Partially update a hostel name
    patchHostelName: builder.mutation({
      query: ({ id, ...hostelNameData }) => ({
        url: `/hostel-names/${id}/`,
        method: 'PATCH',
        body: hostelNameData,
      }),
      invalidatesTags: ['HostelNames'],
    }),

    // DELETE: Delete a hostel name
    deleteHostelName: builder.mutation({
      query: (id) => ({
        url: `/hostel-names/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['HostelNames'],
    }),
  }),
});

export const {
  useGetHostelNamesQuery,
  useGetHostelNameByIdQuery,
  useCreateHostelNameMutation,
  useUpdateHostelNameMutation,
  usePatchHostelNameMutation,
  useDeleteHostelNameMutation,
} = hostelNamesApi;