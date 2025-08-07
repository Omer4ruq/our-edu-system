import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import BASE_URL from '../../../../../utilitis/apiConfig';

const getToken = () => localStorage.getItem('token');

export const paymentsApi = createApi({
  reducerPath: 'paymentsApi',
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
  tagTypes: ['Payments'],
  endpoints: (builder) => ({
    // GET: Fetch all payments
    getPayments: builder.query({
      query: () => '/payments/',
      providesTags: ['Payments'],
    }),

    // GET: Fetch a single payment by ID
    getPaymentById: builder.query({
      query: (id) => `/payments/${id}/`,
      providesTags: ['Payments'],
    }),

    // POST: Create a new payment
    createPayment: builder.mutation({
      query: (paymentData) => ({
        url: '/payments/',
        method: 'POST',
        body: paymentData,
      }),
      invalidatesTags: ['Payments'],
    }),

    // PUT: Update an existing payment
    updatePayment: builder.mutation({
      query: ({ id, ...paymentData }) => ({
        url: `/payments/${id}/`,
        method: 'PUT',
        body: paymentData,
      }),
      invalidatesTags: ['Payments'],
    }),

    // PATCH: Partially update a payment
    patchPayment: builder.mutation({
      query: ({ id, ...paymentData }) => ({
        url: `/payments/${id}/`,
        method: 'PATCH',
        body: paymentData,
      }),
      invalidatesTags: ['Payments'],
    }),

    // DELETE: Delete a payment
    deletePayment: builder.mutation({
      query: (id) => ({
        url: `/payments/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Payments'],
    }),
  }),
});

export const {
  useGetPaymentsQuery,
  useGetPaymentByIdQuery,
  useCreatePaymentMutation,
  useUpdatePaymentMutation,
  usePatchPaymentMutation,
  useDeletePaymentMutation,
} = paymentsApi;