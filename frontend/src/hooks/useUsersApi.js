import { useQuery } from "@tanstack/react-query";
import { listUsers } from "@/api/api";

export function useUsersQuery(page, perPage) {
  return useQuery({
    queryKey: ["users", { page, perPage }],
    queryFn: () =>
      listUsers({
        page,
        per_page: perPage,
      }),
  });
}
