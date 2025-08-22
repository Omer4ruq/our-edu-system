import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import BASE_URL from '../../../../utilitis/apiConfig';

const getToken = () => localStorage.getItem('token');

export const subjectAssignApi = createApi({
  reducerPath: 'subjectAssignApi',
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
  tagTypes: ['SubjectAssign'],
  endpoints: (builder) => ({
    // GET: Fetch all subject assignments
    getSubjectAssignments: builder.query({
      query: () => '/subject-assign/',
      providesTags: ['SubjectAssign'],
    }),

    // GET: Fetch a single subject assignment by ID
    getSubjectAssignmentById: builder.query({
      query: (id) => `/subject-assign/${id}/`,
      providesTags: ['SubjectAssign'],
    }),
// ✅ NEW: GET subject assignments by student_group_id
    getSubjectAssignmentsByGroup: builder.query({
      query: (student_group_id) => `/subject-assign/?student_group_id=${student_group_id}`,
      providesTags: ['SubjectAssign'],
    }),

    // POST: Create a new subject assignment
    createSubjectAssignment: builder.mutation({
      query: (data) => ({
        url: '/subject-assign/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['SubjectAssign'],
    }),

    // PUT: Update an existing subject assignment
    updateSubjectAssignment: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/subject-assign/${id}/`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['SubjectAssign'],
    }),

    // PATCH: Partially update a subject assignment
    patchSubjectAssignment: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/subject-assign/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['SubjectAssign'],
    }),

    // DELETE: Delete a subject assignment
    deleteSubjectAssignment: builder.mutation({
      query: (id) => ({
        url: `/subject-assign/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SubjectAssign'],
    }),

  }),
});

export const {
  useGetSubjectAssignmentsQuery,
  useGetSubjectAssignmentByIdQuery,
  useCreateSubjectAssignmentMutation,
  useUpdateSubjectAssignmentMutation,
  usePatchSubjectAssignmentMutation,
  useDeleteSubjectAssignmentMutation,
  useGetSubjectAssignmentsByGroupQuery,
} = subjectAssignApi;