import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import BASE_URL from '../../../../utilitis/apiConfig';

const getToken = () => localStorage.getItem('token');

export const additionTypesApi = createApi({
  reducerPath: 'additionTypesApi',
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
  tagTypes: ['AdditionTypes'],
  endpoints: (builder) => ({
    // GET: Fetch all addition types
    getAdditionTypes: builder.query({
      query: () => '/addition-types/',
      providesTags: ['AdditionTypes'],
    }),

    // GET: Fetch a single addition type by ID
    getAdditionTypeById: builder.query({
      query: (id) => `/addition-types/${id}/`,
      providesTags: ['AdditionTypes'],
    }),

    // POST: Create a new addition type
    createAdditionType: builder.mutation({
      query: (additionTypeData) => ({
        url: '/addition-types/',
        method: 'POST',
        body: additionTypeData,
      }),
      invalidatesTags: ['AdditionTypes'],
    }),

    // PUT: Update an existing addition type
    updateAdditionType: builder.mutation({
      query: ({ id, ...additionTypeData }) => ({
        url: `/addition-types/${id}/`,
        method: 'PUT',
        body: additionTypeData,
      }),
      invalidatesTags: ['AdditionTypes'],
    }),

    // PATCH: Partially update an addition type
    patchAdditionType: builder.mutation({
      query: ({ id, ...additionTypeData }) => ({
        url: `/addition-types/${id}/`,
        method: 'PATCH',
        body: additionTypeData,
      }),
      invalidatesTags: ['AdditionTypes'],
    }),

    // DELETE: Delete an addition type
    deleteAdditionType: builder.mutation({
      query: (id) => ({
        url: `/addition-types/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AdditionTypes'],
    }),
  }),
});

export const {
  useGetAdditionTypesQuery,
  useGetAdditionTypeByIdQuery,
  useCreateAdditionTypeMutation,
  useUpdateAdditionTypeMutation,
  usePatchAdditionTypeMutation,
  useDeleteAdditionTypeMutation,
} = additionTypesApi;