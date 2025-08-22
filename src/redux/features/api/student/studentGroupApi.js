import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import BASE_URL from '../../../../utilitis/apiConfig';

const getToken = () => localStorage.getItem('token');

export const studentGroupApi = createApi({
  reducerPath: 'studentGroupApi',
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
  tagTypes: ['StudentGroup'],
  endpoints: (builder) => ({
    // GET: Fetch all student groups
    getStudentGroups: builder.query({
      query: () => '/student-groups/',
      providesTags: ['StudentGroup'],
    }),

    // GET: Fetch a single student group by ID
    getStudentGroupById: builder.query({
      query: (id) => `/student-groups/${id}/`,
      providesTags: ['StudentGroup'],
    }),

    // POST: Create a new student group
    createStudentGroup: builder.mutation({
      query: (data) => ({
        url: '/student-groups/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['StudentGroup'],
    }),

    // PUT: Update an existing student group
    updateStudentGroup: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/student-groups/${id}/`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['StudentGroup'],
    }),

    // PATCH: Partially update a student group
    patchStudentGroup: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/student-groups/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['StudentGroup'],
    }),

    // DELETE: Delete a student group
    deleteStudentGroup: builder.mutation({
      query: (id) => ({
        url: `/student-groups/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['StudentGroup'],
    }),
  }),
});

export const {
  useGetStudentGroupsQuery,
  useGetStudentGroupByIdQuery,
  useCreateStudentGroupMutation,
  useUpdateStudentGroupMutation,
  usePatchStudentGroupMutation,
  useDeleteStudentGroupMutation,
} = studentGroupApi;