import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import BASE_URL from '../../../../utilitis/apiConfig';

const getToken = () => localStorage.getItem('token');

export const generateUnpaidSalariesApi = createApi({
  reducerPath: 'generateUnpaidSalariesApi',
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
  tagTypes: ['UnpaidSalaries'],
  endpoints: (builder) => ({
    // GET: Fetch unpaid salaries by month
    getUnpaidSalariesByMonth: builder.query({
      query: (salary_month) => `/generate-unpaid-salaries/?salary_month=${salary_month}`,
      providesTags: ['UnpaidSalaries'],
    }),

    // POST: Generate unpaid salaries
    generateUnpaidSalaries: builder.mutation({
      query: (payload) => ({
        url: '/generate-unpaid-salaries/',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['UnpaidSalaries'],
    }),
  }),
});

export const {
  useGetUnpaidSalariesByMonthQuery,
  useGenerateUnpaidSalariesMutation,
} = generateUnpaidSalariesApi;