import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import BASE_URL2 from '../../../../../../utilitis/apiConfig2';

const getToken = () => localStorage.getItem('token');

export const accountSubGroupApi = createApi({
  reducerPath: 'accountSubGroupApi',
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
  tagTypes: ['AccountSubCategory', 'AccountGroupCategory'],
  endpoints: (builder) => ({
    // GET: All account subcategories
    getAccountSubCategories: builder.query({
      query: () => '/account-subcategories/',
      providesTags: ['AccountSubCategory'],
    }),

    // GET: Group categories filtered by subcategory ID
    getAccountGroupCategories: builder.query({
      query: (subCategoryId) =>
        `/account-groupcategories/?account_sub_Category_id=${subCategoryId}`,
      providesTags: ['AccountGroupCategory'],
    }),
  }),
});

export const {
  useGetAccountSubCategoriesQuery,
  useGetAccountGroupCategoriesQuery,
} = accountSubGroupApi;