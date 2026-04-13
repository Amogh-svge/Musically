import { axiosInstance } from "@/utils/axiosConfiguration";
import { buildQuery } from "@/utils/apiBuilder";

function withQuery(path, params = {}) {
  const query = buildQuery(params);
  return query ? `${path}?${query}` : path;
}

/**
 * Auth (public)
 */
export const loginUser = ({ email, password }) =>
  axiosInstance.post("/auth/login", { email, password }).then((r) => r.data);

export const registerUser = ({ name, email, password }) =>
  axiosInstance
    .post("/auth/register", { name, email, password })
    .then((response) => response.data);

export const getCurrentUser = () =>
  axiosInstance.get("/auth/me").then((response) => response.data);

/** Optional acknowledgment; JWTs are stateless — always clear storage on the client too. */
export const logoutUser = () =>
  axiosInstance.post("/auth/logout").then((response) => response.data);

/**
 * Users (super_admin)
 */
export const listUsers = (params) =>
  axiosInstance
    .get(withQuery("/users", params))
    .then((response) => response.data);

export const createUser = (body) =>
  axiosInstance
    .post("/users", body)
    .then((response) => response.data?.user ?? response.data);

export const updateUser = (id, body) =>
  axiosInstance.put(`/users/${id}`, body).then((response) => response.data);

export const deleteUser = (id) =>
  axiosInstance.delete(`/users/${id}`).then((response) => response.data);

/**
 * Artists
 */
export const listArtists = (params) =>
  axiosInstance
    .get(withQuery("/artists", params))
    .then((response) => response.data);

export const createArtist = (body) =>
  axiosInstance
    .post("/artists", body)
    .then((response) => response.data?.artist ?? response.data);

export const updateArtist = (id, body) =>
  axiosInstance
    .put(`/artists/${id}`, body)
    .then((response) => response.data?.artist ?? response.data);

export const deleteArtist = (id) =>
  axiosInstance.delete(`/artists/${id}`).then((response) => response.data);

export const exportArtistsCsv = () =>
  axiosInstance
    .get("/artists/export/csv", { responseType: "blob" })
    .then((response) => response.data);

export const importArtistsCsv = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return axiosInstance
    .post("/artists/import/csv", formData)
    .then((response) => response.data);
};

/**
 * Songs (nested under artist)
 */
export const listSongsByArtist = (artistId, params) =>
  axiosInstance
    .get(withQuery(`/artists/${artistId}/songs`, params))
    .then((response) => response.data);

export const createSong = (artistId, body) =>
  axiosInstance
    .post(`/artists/${artistId}/songs`, body)
    .then((response) => response.data?.song ?? response.data);

export const updateSong = (artistId, songId, body) =>
  axiosInstance
    .put(`/artists/${artistId}/songs/${songId}`, body)
    .then((response) => response.data?.song ?? response.data);

export const deleteSong = (artistId, songId) =>
  axiosInstance
    .delete(`/artists/${artistId}/songs/${songId}`)
    .then((response) => response.data);
