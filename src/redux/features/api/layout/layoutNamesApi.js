import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import BASE_URL2 from '../../../../utilitis/apiConfig2';

const getToken = () => localStorage.getItem('token');

export const layoutNamesApi = createApi({
  reducerPath: 'layoutNamesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL2,
    prepareHeaders: (headers) => {
      const token = getToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['LayoutNames'],
  endpoints: (builder) => ({
    // GET: Fetch all layout names
    getLayoutNames: builder.query({
      query: () => '/layout-names/',
      providesTags: ['LayoutNames'],
    }),

    // GET: Fetch a single layout name by ID
    getLayoutNameById: builder.query({
      query: (id) => `/layout-names/${id}/`,
      providesTags: ['LayoutNames'],
    }),

    // POST: Create a new layout name
    createLayoutName: builder.mutation({
      query: (data) => ({
        url: '/layout-names/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['LayoutNames'],
    }),

    // PUT: Update an existing layout name
    updateLayoutName: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/layout-names/${id}/`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['LayoutNames'],
    }),

    // PATCH: Partially update a layout name
    patchLayoutName: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/layout-names/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['LayoutNames'],
    }),

    // DELETE: Delete a layout name
    deleteLayoutName: builder.mutation({
      query: (id) => ({
        url: `/layout-names/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['LayoutNames'],
    }),
  }),
});

export const {
  useGetLayoutNamesQuery,
  useGetLayoutNameByIdQuery,
  useCreateLayoutNameMutation,
  useUpdateLayoutNameMutation,
  usePatchLayoutNameMutation,
  useDeleteLayoutNameMutation,
} = layoutNamesApi;