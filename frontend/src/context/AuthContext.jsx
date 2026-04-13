import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "@/api/api";
import { getAuthToken } from "@/utils/authStorage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [tokenVersion, setTokenVersion] = useState(0);

  useEffect(() => {
    const onAuth = () => setTokenVersion((v) => v + 1);
    window.addEventListener("sonic-curator-auth", onAuth);
    return () => window.removeEventListener("sonic-curator-auth", onAuth);
  }, []);

  const hasToken = Boolean(getAuthToken());

  const meQuery = useQuery({
    queryKey: ["auth", "me", tokenVersion],
    queryFn: getCurrentUser,
    enabled: hasToken,
    staleTime: 60_000,
    retry: 1,
  });

  const user = meQuery.data?.user ?? null;
  const role = user?.role ?? null;

  const value = {
    user,
    role,
    isLoading: hasToken && meQuery.isPending,
    isError: meQuery.isError,
    refetch: meQuery.refetch,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
