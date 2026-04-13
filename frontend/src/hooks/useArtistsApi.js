import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createArtist,
  deleteArtist,
  exportArtistsCsv,
  importArtistsCsv,
  listArtists,
  updateArtist,
} from "@/api/api";

export function useArtistsQuery(page, perPage) {
  return useQuery({
    queryKey: ["artists", { page, perPage }],
    queryFn: () =>
      listArtists({
        page,
        per_page: perPage,
      }),
  });
}

export function useExportArtistsCsvMutation() {
  return useMutation({
    mutationFn: exportArtistsCsv,
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "artists.csv";
      anchor.click();
      URL.revokeObjectURL(url);
    },
  });
}

export function useImportArtistsCsvMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: importArtistsCsv,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["artists"] });
    },
  });
}

export function useCreateArtistMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createArtist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["artists"] });
    },
  });
}

export function useUpdateArtistMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }) => updateArtist(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["artists"] });
    },
  });
}

export function useDeleteArtistMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteArtist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["artists"] });
    },
  });
}
