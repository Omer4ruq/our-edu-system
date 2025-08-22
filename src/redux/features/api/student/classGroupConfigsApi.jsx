import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import BASE_URL from '../../../../utilitis/apiConfig';

const getToken = () => localStorage.getItem('token');

export const classGroupConfigsApi = createApi({
  reducerPath: 'classGroupConfigsApi',
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
  tagTypes: ['ClassGroupConfigs'],
  endpoints: (builder) => ({
    // GET: Fetch all class group configs
    getClassGroupConfigs: builder.query({
      query: () => '/class-group-configs/',
      providesTags: ['ClassGroupConfigs'],
    }),

    // GET: Fetch a single config by ID
    getClassGroupConfigById: builder.query({
      query: (id) => `/class-group-configs/${id}/`,
      providesTags: ['ClassGroupConfigs'],
    }),

    // POST: Create a new config
    createClassGroupConfig: builder.mutation({
      query: (data) => ({
        url: '/class-group-configs/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ClassGroupConfigs'],
    }),

    // PUT: Update an existing config
    updateClassGroupConfig: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/class-group-configs/${id}/`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['ClassGroupConfigs'],
    }),

    // PATCH: Partially update a config
    patchClassGroupConfig: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/class-group-configs/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['ClassGroupConfigs'],
    }),

    // DELETE: Remove a config
    deleteClassGroupConfig: builder.mutation({
      query: (id) => ({
        url: `/class-group-configs/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ClassGroupConfigs'],
    }),
  }),
});

export const {
  useGetClassGroupConfigsQuery,
  useGetClassGroupConfigByIdQuery,
  useCreateClassGroupConfigMutation,
  useUpdateClassGroupConfigMutation,
  usePatchClassGroupConfigMutation,
  useDeleteClassGroupConfigMutation,
} = classGroupConfigsApi;