import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import BASE_URL from '../../../../utilitis/apiConfig';

const getToken = () => {
  return localStorage.getItem('token'); 
};

export const transactionBooksApi = createApi({
  reducerPath: 'transactionBooksApi',
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
  tagTypes: ['TransactionBooks'],
  endpoints: (builder) => ({
    // GET: Fetch all transaction books
    getTransactionBooks: builder.query({
      query: () => '/transaction-books/',
      providesTags: ['TransactionBooks'],
    }),

    // GET: Fetch single transaction book by ID
    getTransactionBookById: builder.query({
      query: (id) => `/transaction-books/${id}/`,
      providesTags: ['TransactionBooks'],
    }),

    // POST: Create a new transaction book
    createTransactionBook: builder.mutation({
      query: (transactionBookData) => ({
        url: '/transaction-books/',
        method: 'POST',
        body: transactionBookData,
      }),
      invalidatesTags: ['TransactionBooks'],
    }),

    // PUT: Update an existing transaction book
    updateTransactionBook: builder.mutation({
      query: ({ id, ...transactionBookData }) => ({
        url: `/transaction-books/${id}/`,
        method: 'PUT',
        body: transactionBookData,
      }),
      invalidatesTags: ['TransactionBooks'],
    }),

    // DELETE: Delete a transaction book
    deleteTransactionBook: builder.mutation({
      query: (id) => ({
        url: `/transaction-books/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['TransactionBooks'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetTransactionBooksQuery,
  useGetTransactionBookByIdQuery,
  useCreateTransactionBookMutation,
  useUpdateTransactionBookMutation,
  useDeleteTransactionBookMutation,
} = transactionBooksApi;