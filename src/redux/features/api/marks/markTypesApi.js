import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import BASE_URL from '../../../../utilitis/apiConfig';

const getToken = () => localStorage.getItem('token');

export const markTypesApi = createApi({
  reducerPath: 'markTypesApi',
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
  tagTypes: ['MarkTypes'],
  endpoints: (builder) => ({
    // GET: Fetch all mark types
    getMarkTypes: builder.query({
      query: () => '/mark-types/',
      providesTags: ['MarkTypes'],
    }),

    // GET: Fetch a single mark type by ID
    getMarkTypeById: builder.query({
      query: (id) => `/mark-types/${id}/`,
      providesTags: ['MarkTypes'],
    }),

    // POST: Create a new mark type
    createMarkType: builder.mutation({
      query: (data) => ({
        url: '/mark-types/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['MarkTypes'],
    }),

    // PUT: Update an existing mark type
    updateMarkType: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/mark-types/${id}/`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['MarkTypes'],
    }),

    // PATCH: Partially update a mark type
    patchMarkType: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/mark-types/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['MarkTypes'],
    }),

    // DELETE: Delete a mark type
    deleteMarkType: builder.mutation({
      query: (id) => ({
        url: `/mark-types/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['MarkTypes'],
    }),
  }),
});

export const {
  useGetMarkTypesQuery,
  useGetMarkTypeByIdQuery,
  useCreateMarkTypeMutation,
  useUpdateMarkTypeMutation,
  usePatchMarkTypeMutation,
  useDeleteMarkTypeMutation,
} = markTypesApi;