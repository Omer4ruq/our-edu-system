import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import BASE_URL from '../../../../../utilitis/apiConfig';

const getToken = () => localStorage.getItem('token');

export const contraApi = createApi({
  reducerPath: 'contraApi',
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
  tagTypes: ['Contra'],
  endpoints: (builder) => ({
    // 🔍 Get list with optional filters
    getContraList: builder.query({
      query: ({ class_id, date_from, date_to, type, fund_id } = {}) => {
        const params = new URLSearchParams();
        if (class_id) params.append('class_id', class_id);
        if (date_from) params.append('date_from', date_from);
        if (date_to) params.append('date_to', date_to);
        if (type) params.append('type', type);
        if (fund_id) params.append('fund_id', fund_id);
        return `/contra/?${params.toString()}`;
      },
      providesTags: ['Contra'],
    }),

    // 📄 Get single entry
    getContraById: builder.query({
      query: (id) => `/contra/${id}/`,
      providesTags: ['Contra'],
    }),

    // ➕ Create
    createContra: builder.mutation({
      query: (data) => ({
        url: '/contra/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Contra'],
    }),

    // ✏️ Update
    updateContra: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/contra/${id}/`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Contra'],
    }),

    // 🩹 Patch
    patchContra: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/contra/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Contra'],
    }),

    // ❌ Delete
    deleteContra: builder.mutation({
      query: (id) => ({
        url: `/contra/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Contra'],
    }),
  }),
});

export const {
  useGetContraListQuery,
  useGetContraByIdQuery,
  useCreateContraMutation,
  useUpdateContraMutation,
  usePatchContraMutation,
  useDeleteContraMutation,
} = contraApi;