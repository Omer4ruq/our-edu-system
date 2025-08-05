import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import BASE_URL from '../../../../utilitis/apiConfig';

const getToken = () => {
  return localStorage.getItem('token');
};

export const hostelRoomsApi = createApi({
  reducerPath: 'hostelRoomsApi',
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
  tagTypes: ['HostelRooms'],
  endpoints: (builder) => ({
    // GET: Fetch all hostel rooms
    getHostelRooms: builder.query({
      query: () => '/hostel-rooms/',
      providesTags: ['HostelRooms'],
    }),

    // GET: Fetch a single hostel room by ID
    getHostelRoomById: builder.query({
      query: (id) => `/hostel-rooms/${id}/`,
      providesTags: ['HostelRooms'],
    }),

    // POST: Create a new hostel room
    createHostelRoom: builder.mutation({
      query: (roomData) => ({
        url: '/hostel-rooms/',
        method: 'POST',
        body: roomData,
      }),
      invalidatesTags: ['HostelRooms'],
    }),

    // PUT: Update an existing hostel room
    updateHostelRoom: builder.mutation({
      query: ({ id, ...roomData }) => ({
        url: `/hostel-rooms/${id}/`,
        method: 'PUT',
        body: roomData,
      }),
      invalidatesTags: ['HostelRooms'],
    }),

    // PATCH: Partially update a hostel room
    patchHostelRoom: builder.mutation({
      query: ({ id, ...roomData }) => ({
        url: `/hostel-rooms/${id}/`,
        method: 'PATCH',
        body: roomData,
      }),
      invalidatesTags: ['HostelRooms'],
    }),

    // DELETE: Delete a hostel room
    deleteHostelRoom: builder.mutation({
      query: (id) => ({
        url: `/hostel-rooms/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['HostelRooms'],
    }),
  }),
});

export const {
  useGetHostelRoomsQuery,
  useGetHostelRoomByIdQuery,
  useCreateHostelRoomMutation,
  useUpdateHostelRoomMutation,
  usePatchHostelRoomMutation,
  useDeleteHostelRoomMutation,
} = hostelRoomsApi;