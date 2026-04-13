import { useMutation } from "@tanstack/react-query";
import { loginUser, registerUser } from "@/api/api";
import { queryClient } from "@/query/queryClient";
import { notifyAuthChanged, setAuthToken } from "@/utils/authStorage";

export function useLoginMutation() {
  return useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      if (data?.token) {
        setAuthToken(data.token);
        notifyAuthChanged();
        queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      }
    },
  });
}

export function useRegisterMutation() {
  return useMutation({
    mutationFn: registerUser,
  });
}
