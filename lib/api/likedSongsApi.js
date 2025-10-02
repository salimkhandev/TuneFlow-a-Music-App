import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const likedSongsApi = createApi({
  reducerPath: "likedSongsApi",
  baseQuery: fetchBaseQuery({ baseUrl: "" }),
  tagTypes: ["LikedSongs"],
  endpoints: (builder) => ({
    getLikedSongs: builder.query({
      query: () => `/api/liked-songs`,
      providesTags: (result) => [
        { type: "LikedSongs", id: "LIST" },
        ...(result?.items?.map(s => ({ type: "LikedSongs", id: s.id })) ?? [])
      ],
    }),
    getLikedSongsIds: builder.query({
      query: () => `/api/liked-songs?view=ids`,
      providesTags: (result) => [
        { type: "LikedSongs", id: "LIST" },
        ...(result?.ids?.map(id => ({ type: "LikedSongs", id })) ?? [])
      ],
    }),
    getLikedSongsCount: builder.query({
      query: () => `/api/liked-songs?view=count`,
      providesTags: [{ type: "LikedSongs", id: "COUNT" }],
    }),
    getSongLikeStatus: builder.query({
      query: (songId) => `/api/liked-songs?view=ids`,
      providesTags: (result, error, songId) => [
        { type: "LikedSongs", id: songId },
        { type: "LikedSongs", id: "LIST" }
      ],
      transformResponse: (response, meta, songId) => {
        const ids = response?.ids ?? [];
        return { isLiked: ids.includes(songId), songId };
      }
    }),
    likeSong: builder.mutation({
      query: (song) => ({
        url: `/api/liked-songs`,
        method: "POST",
        body: { song },
      }),
      invalidatesTags: (_res, _err, song) => [
        song?.id ? { type: "LikedSongs", id: song.id } : undefined,
        { type: "LikedSongs", id: "LIST" }
      ].filter(Boolean),
    }),
    unlikeSong: builder.mutation({
      query: (songId) => ({
        url: `/api/liked-songs?songId=${encodeURIComponent(songId)}`,
        method: "DELETE",
      }),
      invalidatesTags: (_res, _err, songId) => [
        songId ? { type: "LikedSongs", id: songId } : undefined,
        { type: "LikedSongs", id: "LIST" }
      ].filter(Boolean),
    }),
  }),
});

export const {
  useGetLikedSongsQuery,
  useGetLikedSongsIdsQuery,
  useGetLikedSongsCountQuery,
  useGetSongLikeStatusQuery,
  useLikeSongMutation,
  useUnlikeSongMutation,
} = likedSongsApi;


