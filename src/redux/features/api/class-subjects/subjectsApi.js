import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import BASE_URL from '../../../../utilitis/apiConfig';

const getToken = () => localStorage.getItem('token');

export const subjectsApi = createApi({
  reducerPath: 'subjectsApi',
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
  tagTypes: ['Subjects'],
  endpoints: (builder) => ({
    // GET: Fetch all subjects
    getSubjects: builder.query({
      query: () => '/subjects/',
      providesTags: ['Subjects'],
    }),

    // GET: Fetch a single subject by ID
    getSubjectById: builder.query({
      query: (id) => `/subjects/${id}/`,
      providesTags: ['Subjects'],
    }),

    // POST: Create a new subject
    createSubject: builder.mutation({
      query: (data) => ({
        url: '/subjects/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Subjects'],
    }),

    // PUT: Update an existing subject
    updateSubject: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/subjects/${id}/`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Subjects'],
    }),

    // PATCH: Partially update a subject
    patchSubject: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/subjects/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Subjects'],
    }),

    // DELETE: Delete a subject
    deleteSubject: builder.mutation({
      query: (id) => ({
        url: `/subjects/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Subjects'],
    }),
  }),
});

export const {
  useGetSubjectsQuery,
  useGetSubjectByIdQuery,
  useCreateSubjectMutation,
  useUpdateSubjectMutation,
  usePatchSubjectMutation,
  useDeleteSubjectMutation,
} = subjectsApi;