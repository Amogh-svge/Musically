import { useCallback, useEffect, useState } from "react";
import ArtistsPage from "./pages/ArtistsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

const routes = {
  "/": "/login",
  "/artists": "artists",
  "/login": "login",
  "/register": "register",
};

function getRoute(pathname) {
  return routes[pathname] ?? "login";
}

export default function App() {
  return <>adasdasd</>
}
