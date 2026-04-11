export const AUTH_TOKEN_STORAGE_KEY = "sonic-curator-jwt";

export function getAuthToken() {
  return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
}

export function setAuthToken(token) {
  if (token) {
    window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
  } else {
    window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  }
}

export function clearAuthToken() {
  window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
}

export function notifyAuthChanged() {
  window.dispatchEvent(new Event("sonic-curator-auth"));
}
