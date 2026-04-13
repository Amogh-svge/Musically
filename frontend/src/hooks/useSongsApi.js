import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createSong,
  deleteSong,
  listSongsByArtist,
  updateSong,
} from "@/api/api";

export function useSongsByArtistQuery(artistId, page, perPage, enabled = true) {
  return useQuery({
    queryKey: ["songs", artistId, { page, perPage }],
    queryFn: () =>
      listSongsByArtist(artistId, {
        page,
        per_page: perPage,
      }),
    enabled: Boolean(artistId) && enabled,
  });
}

export function useCreateSongMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ artistId, body }) => createSong(artistId, body),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["songs", variables.artistId],
      });
    },
  });
}

export function useUpdateSongMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ artistId, songId, body }) =>
      updateSong(artistId, songId, body),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["songs", variables.artistId],
      });
    },
  });
}

export function useDeleteSongMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ artistId, songId }) => deleteSong(artistId, songId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["songs", variables.artistId],
      });
    },
  });
}
