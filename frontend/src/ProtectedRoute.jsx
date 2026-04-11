import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children, isAllowed, redirectPath }) {
  const location = useLocation();

  if (!isAllowed) {
    return <Navigate to={redirectPath} replace state={{ from: location }} />;
  }

  return children;
}