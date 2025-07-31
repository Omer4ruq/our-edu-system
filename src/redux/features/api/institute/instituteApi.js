import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import BASE_URL from '../../../../utilitis/apiConfig';

const getToken = () => {
  return localStorage.getItem('token'); 
};

export const instituteApi = createApi({
  reducerPath: 'instituteApi',
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
  tagTypes: ['Institute'],
  endpoints: (builder) => ({
    // GET: Fetch all institutes
    getInstitutes: builder.query({
      query: () => '/institute/',
      providesTags: ['Institute'],
    }),

    // GET: Fetch single institute by ID
    getInstituteById: builder.query({
      query: (id) => `/institute/${id}/`,
      providesTags: ['Institute'],
    }),

    // POST: Create a new institute
    createInstitute: builder.mutation({
      query: (instituteData) => ({
        url: '/institute/',
        method: 'POST',
        body: instituteData,
      }),
      invalidatesTags: ['Institute'],
    }),

    // PUT: Update an existing institute
    updateInstitute: builder.mutation({
      query: ({ id, ...instituteData }) => ({
        url: `/institute/${id}/`,
        method: 'PUT',
        body: instituteData,
      }),
      invalidatesTags: ['Institute'],
    }),

    // DELETE: Delete an institute
    deleteInstitute: builder.mutation({
      query: (id) => ({
        url: `/institute/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Institute'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetInstitutesQuery,
  useGetInstituteByIdQuery,
  useCreateInstituteMutation,
  useUpdateInstituteMutation,
  useDeleteInstituteMutation,
} = instituteApi;