import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import BASE_URL from '../../../../utilitis/apiConfig';

const getToken = () => localStorage.getItem('token');

export const setExamSchedulesApi = createApi({
  reducerPath: 'setExamSchedulesApi',
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
  tagTypes: ['SetExamSchedules'],
  endpoints: (builder) => ({
    // GET: Fetch all exam schedules
    getSetExamSchedules: builder.query({
      query: () => '/set-exam-schedules/',
      providesTags: ['SetExamSchedules'],
    }),

    // GET: Fetch a single exam schedule by ID
    getSetExamScheduleById: builder.query({
      query: (id) => `/set-exam-schedules/${id}/`,
      providesTags: ['SetExamSchedules'],
    }),

    // POST: Create a new exam schedule
    createSetExamSchedule: builder.mutation({
      query: (data) => ({
        url: '/set-exam-schedules/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['SetExamSchedules'],
    }),

    // PUT: Update an existing exam schedule
    updateSetExamSchedule: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/set-exam-schedules/${id}/`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['SetExamSchedules'],
    }),

    // PATCH: Partially update an exam schedule
    patchSetExamSchedule: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/set-exam-schedules/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['SetExamSchedules'],
    }),

    // DELETE: Delete an exam schedule
    deleteSetExamSchedule: builder.mutation({
      query: (id) => ({
        url: `/set-exam-schedules/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SetExamSchedules'],
    }),
  }),
});

export const {
  useGetSetExamSchedulesQuery,
  useGetSetExamScheduleByIdQuery,
  useCreateSetExamScheduleMutation,
  useUpdateSetExamScheduleMutation,
  usePatchSetExamScheduleMutation,
  useDeleteSetExamScheduleMutation,
} = setExamSchedulesApi;