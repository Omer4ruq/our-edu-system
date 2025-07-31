import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import BASE_URL from '../../../../utilitis/apiConfig';

const getToken = () => {
  return localStorage.getItem('token'); 
};

export const leaveQuotasApi = createApi({
  reducerPath: 'leaveQuotasApi',
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
  tagTypes: ['leaveQuotasApi'],
  endpoints: (builder) => ({
    // GET: Fetch all leaveQuotasApis
    getLeaveQuotasApi: builder.query({
      query: () => '/leave-quotas/',
      providesTags: ['leaveQuotasApi'],
    }),

    // GET: Fetch single leaveQuotasApi by ID 
    getLeaveQuotasApiById: builder.query({
      query: (id) => `/leave-quotas/${id}/`,
      providesTags: ['leaveQuotasApi'],
    }),

    // POST: Create a new leaveQuotasApi
    createLeaveQuotasApi: builder.mutation({
      query: (leaveQuotasApiData) => ({
        url: '/leave-quotas/',
        method: 'POST',
        body: leaveQuotasApiData,
      }),
      invalidatesTags: ['leaveQuotasApi'],
    }),

    // PUT: Update an existing leaveQuotasApi
    updateLeaveQuotasApi: builder.mutation({
      query: ({ id, ...leaveQuotasApiData }) => ({
        url: `/leave-quotas/${id}/`,
        method: 'PUT',
        body: leaveQuotasApiData,
      }),
      invalidatesTags: ['leaveQuotasApi'],
    }),

    // DELETE: Delete an leaveQuotasApi 
    deleteLeaveQuotasApi: builder.mutation({
      query: (id) => ({
        url: `/leave-quotas/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['leaveQuotasApi'],
    }),
  }),
});

// Export hooks for usage in components 
export const {
  useGetLeaveQuotasApiQuery,
  useGetLeaveQuotasApiByIdQuery,
  useCreateLeaveQuotasApiMutation,
  useUpdateLeaveQuotasApiMutation,
  useDeleteLeaveQuotasApiMutation,
} = leaveQuotasApi;