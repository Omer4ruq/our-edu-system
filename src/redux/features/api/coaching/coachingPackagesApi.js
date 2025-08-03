import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import BASE_URL from '../../../../utilitis/apiConfig';

const getToken = () => localStorage.getItem('token');

export const coachingPackagesApi = createApi({
  reducerPath: 'coachingPackagesApi',
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
  tagTypes: ['CoachingPackages'],
  endpoints: (builder) => ({
    // GET: Fetch all coaching packages
    getCoachingPackages: builder.query({
      query: () => '/coaching-packages/',
      providesTags: ['CoachingPackages'],
    }),

    // GET: Fetch a single coaching package by ID
    getCoachingPackageById: builder.query({
      query: (id) => `/coaching-packages/${id}/`,
      providesTags: ['CoachingPackages'],
    }),

    // POST: Create a new coaching package
    createCoachingPackage: builder.mutation({
      query: (packageData) => ({
        url: '/coaching-packages/',
        method: 'POST',
        body: packageData,
      }),
      invalidatesTags: ['CoachingPackages'],
    }),

    // PUT: Update an existing coaching package
    updateCoachingPackage: builder.mutation({
      query: ({ id, ...packageData }) => ({
        url: `/coaching-packages/${id}/`,
        method: 'PUT',
        body: packageData,
      }),
      invalidatesTags: ['CoachingPackages'],
    }),

    // PATCH: Partially update a coaching package
    patchCoachingPackage: builder.mutation({
      query: ({ id, ...packageData }) => ({
        url: `/coaching-packages/${id}/`,
        method: 'PATCH',
        body: packageData,
      }),
      invalidatesTags: ['CoachingPackages'],
    }),

    // DELETE: Delete a coaching package
    deleteCoachingPackage: builder.mutation({
      query: (id) => ({
        url: `/coaching-packages/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['CoachingPackages'],
    }),
  }),
});

export const {
  useGetCoachingPackagesQuery,
  useGetCoachingPackageByIdQuery,
  useCreateCoachingPackageMutation,
  useUpdateCoachingPackageMutation,
  usePatchCoachingPackageMutation,
  useDeleteCoachingPackageMutation,
} = coachingPackagesApi;