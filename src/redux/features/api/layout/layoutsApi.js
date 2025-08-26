import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import BASE_URL from '../../../../utilitis/apiConfig';

const getToken = () => localStorage.getItem('token');

export const layoutsApi = createApi({
  reducerPath: 'layoutsApi',
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
  tagTypes: ['Layouts'],
  endpoints: (builder) => ({
    // GET: Fetch all layouts
    getLayouts: builder.query({
      query: () => '/layouts/',
      providesTags: ['Layouts'],
    }),

    // GET: Fetch a single layout by ID
    getLayoutById: builder.query({
      query: (id) => `/layouts/${id}/`,
      providesTags: ['Layouts'],
    }),

    // ✅ GET: Filtered by layout_name_id
    getLayoutsByNameId: builder.query({
      query: (layout_name_id) => `/layouts/?layout_name_id=${layout_name_id}`,
      providesTags: ['Layouts'],
    }),

    // POST: Create a new layout
    createLayout: builder.mutation({
      query: (data) => ({
        url: '/layouts/bulk/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Layouts'],
    }),

    // PUT: Update an existing layout
    updateLayout: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/layouts/${id}/`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Layouts'],
    }),

    // PATCH: Partially update a layout
    patchLayout: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/layouts/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Layouts'],
    }),

    // DELETE: Delete a layout
    deleteLayout: builder.mutation({
      query: (id) => ({
        url: `/layouts/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Layouts'],
    }),
       bulkUpdateLayouts: builder.mutation({
      query: (dataArray) => ({
        url: '/layouts/bulk-update/',
        method: 'PUT',
        body: dataArray,
      }),
      invalidatesTags: ['Layouts'],
    }),

  }),
});

export const {
  useGetLayoutsQuery,
  useGetLayoutByIdQuery,
  useGetLayoutsByNameIdQuery,
  useCreateLayoutMutation,
  useUpdateLayoutMutation,
  usePatchLayoutMutation,
  useDeleteLayoutMutation,
  useBulkUpdateLayoutsMutation,
} = layoutsApi;