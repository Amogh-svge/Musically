import { useCallback, useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import ArtistsPage from "./pages/ArtistsPage";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./ProtectedRoute";
import RegisterPage from "./pages/RegisterPage";
import SongsPage from "./pages/SongsPage";
import UsersPage from "./pages/UsersPage";
import { logoutUser } from "./api/api";
import { queryClient } from "./query/queryClient";
import {
  AUTH_TOKEN_STORAGE_KEY,
  clearAuthToken,
  getAuthToken,
  notifyAuthChanged,
} from "./utils/authStorage";

export default function App() {
  const [hasSession, setHasSession] = useState(() => Boolean(getAuthToken()));
  const defaultProtectedPath = "/dashboard";
  const defaultPublicPath = "/login";

  useEffect(() => {
    const syncSession = () => setHasSession(Boolean(getAuthToken()));

    window.addEventListener("sonic-curator-auth", syncSession);
    const handleStorage = (event) => {
      if (event.key === AUTH_TOKEN_STORAGE_KEY) {
        syncSession();
      }
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("sonic-curator-auth", syncSession);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const logout = useCallback(async () => {
    try {
      if (getAuthToken()) {
        await logoutUser();
      }
    } catch {
      /* still clear local session if the request fails */
    } finally {
      clearAuthToken();
      queryClient.clear();
      notifyAuthChanged();
    }
  }, []);

  const isAuthenticated = hasSession;

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Navigate
            to={isAuthenticated ? defaultProtectedPath : defaultPublicPath}
            replace
          />
        }
      />
      <Route
        path="/login"
        element={
          <ProtectedRoute
            isAllowed={!isAuthenticated}
            redirectPath={defaultProtectedPath}
          >
            <LoginPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/register"
        element={
          <ProtectedRoute
            isAllowed={!isAuthenticated}
            redirectPath={defaultProtectedPath}
          >
            <RegisterPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute
            isAllowed={isAuthenticated}
            redirectPath={defaultPublicPath}
          >
            <DashboardPage onLogout={logout} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/artists"
        element={
          <ProtectedRoute
            isAllowed={isAuthenticated}
            redirectPath={defaultPublicPath}
          >
            <ArtistsPage onLogout={logout} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute
            isAllowed={isAuthenticated}
            redirectPath={defaultPublicPath}
          >
            <UsersPage onLogout={logout} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/songs"
        element={
          <ProtectedRoute
            isAllowed={isAuthenticated}
            redirectPath={defaultPublicPath}
          >
            <SongsPage onLogout={logout} />
          </ProtectedRoute>
        }
      />
      <Route
        path="*"
        element={
          <Navigate
            to={isAuthenticated ? defaultProtectedPath : defaultPublicPath}
            replace
          />
        }
      />
    </Routes>
  );
}
