import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import BASE_URL2 from '../../../../utilitis/apiConfig2';

const getToken = () => localStorage.getItem('token');

export const layoutModelsApi = createApi({
  reducerPath: 'layoutModelsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL2,
    prepareHeaders: (headers) => {
      const token = getToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['LayoutModels'],
  endpoints: (builder) => ({
    // GET: Fetch all layout models
    getLayoutModels: builder.query({
      query: () => '/layout-models/',
      providesTags: ['LayoutModels'],
    }),

    // GET: Fetch a single layout model by ID
    getLayoutModelById: builder.query({
      query: (id) => `/layout-models/${id}/`,
      providesTags: ['LayoutModels'],
    }),

    // ✅ NEW: GET layout models filtered by layout_name_id
    getLayoutModelsByNameId: builder.query({
      query: (layout_name_id) => `/layout-models/?layout_name_id=${layout_name_id}`,
      providesTags: ['LayoutModels'],
   
    }),
  }),
});

export const {
  useGetLayoutModelsQuery,
  useGetLayoutModelByIdQuery,
  useGetLayoutModelsByNameIdQuery,
} = layoutModelsApi;