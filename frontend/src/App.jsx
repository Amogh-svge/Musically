import { useCallback, useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import ArtistsPage from "./pages/ArtistsPage";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./ProtectedRoute";
import RegisterPage from "./pages/RegisterPage";
import UsersPage from "./pages/UsersPage";
import {
  AUTH_TOKEN_STORAGE_KEY,
  clearAuthToken,
  getAuthToken,
  notifyAuthChanged,
} from "./utils/authStorage";

export default function App() {
  const [hasSession, setHasSession] = useState(() => Boolean(getAuthToken()));
  const defaultProtectedPath = "/artists";
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

  const logout = useCallback(() => {
    clearAuthToken();
    notifyAuthChanged();
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
