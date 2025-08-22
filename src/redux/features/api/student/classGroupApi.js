import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import BASE_URL from '../../../../utilitis/apiConfig';

const getToken = () => localStorage.getItem('token');

export const classGroupApi = createApi({
  reducerPath: 'classGroupApi',
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
  tagTypes: ['ClassGroup'],
  endpoints: (builder) => ({
    // GET: Fetch all class groups
    getClassGroups: builder.query({
      query: () => '/class-groups/',
      providesTags: ['ClassGroup'],
    }),

    // GET: Fetch a single class group by ID
    getClassGroupById: builder.query({
      query: (id) => `/class-groups/${id}/`,
      providesTags: ['ClassGroup'],
    }),

    // POST: Create a new class group
    createClassGroup: builder.mutation({
      query: (data) => ({
        url: '/class-groups/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ClassGroup'],
    }),

    // PUT: Update an existing class group
    updateClassGroup: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/class-groups/${id}/`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['ClassGroup'],
    }),

    // PATCH: Partially update a class group
    patchClassGroup: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/class-groups/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['ClassGroup'],
    }),

    // DELETE: Delete a class group
    deleteClassGroup: builder.mutation({
      query: (id) => ({
        url: `/class-groups/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ClassGroup'],
    }),
  }),
});

export const {
  useGetClassGroupsQuery,
  useGetClassGroupByIdQuery,
  useCreateClassGroupMutation,
  useUpdateClassGroupMutation,
  usePatchClassGroupMutation,
  useDeleteClassGroupMutation,
} = classGroupApi;