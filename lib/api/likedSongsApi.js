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
      async onQueryStarted(song, { dispatch, queryFulfilled }) {
        // Optimistically update the cache
        const patchResult = dispatch(
          likedSongsApi.util.updateQueryData('getLikedSongs', undefined, (draft) => {
            if (draft?.items) {
              draft.items.unshift(song); // Add to beginning
            }
          })
        );
        
        // Also update IDs cache
        dispatch(
          likedSongsApi.util.updateQueryData('getLikedSongsIds', undefined, (draft) => {
            if (draft?.ids) {
              draft.ids.unshift(song.id);
            }
          })
        );
        
        // Update count cache
        dispatch(
          likedSongsApi.util.updateQueryData('getLikedSongsCount', undefined, (draft) => {
            if (draft?.count !== undefined) {
              draft.count += 1;
            }
          })
        );
        
        // Update individual song status
        dispatch(
          likedSongsApi.util.updateQueryData('getSongLikeStatus', song.id, (draft) => {
            draft.isLiked = true;
          })
        );

        try {
          await queryFulfilled;
        } catch {
          // Revert optimistic updates on failure
          patchResult.undo();
        }
      },
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
      async onQueryStarted(songId, { dispatch, queryFulfilled }) {
        // Optimistically update the cache
        const patchResult = dispatch(
          likedSongsApi.util.updateQueryData('getLikedSongs', undefined, (draft) => {
            if (draft?.items) {
              draft.items = draft.items.filter(song => song.id !== songId);
            }
          })
        );
        
        // Also update IDs cache
        dispatch(
          likedSongsApi.util.updateQueryData('getLikedSongsIds', undefined, (draft) => {
            if (draft?.ids) {
              draft.ids = draft.ids.filter(id => id !== songId);
            }
          })
        );
        
        // Update count cache
        dispatch(
          likedSongsApi.util.updateQueryData('getLikedSongsCount', undefined, (draft) => {
            if (draft?.count !== undefined) {
              draft.count = Math.max(0, draft.count - 1);
            }
          })
        );
        
        // Update individual song status
        dispatch(
          likedSongsApi.util.updateQueryData('getSongLikeStatus', songId, (draft) => {
            draft.isLiked = false;
          })
        );

        try {
          await queryFulfilled;
        } catch {
          // Revert optimistic updates on failure
          patchResult.undo();
        }
      },
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


