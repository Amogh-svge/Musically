import { axiosInstance } from "@/utils/axiosConfiguration";
import { buildQuery } from "@/utils/apiBuilder";

function withQuery(path, params = {}) {
  const q = buildQuery(params);
  return q ? `${path}?${q}` : path;
}

// --- Auth (public) ---
export const loginUser = ({ email, password }) =>
  axiosInstance.post("/auth/login", { email, password }).then((r) => r.data);

export const registerUser = ({ name, email, password }) =>
  axiosInstance
    .post("/auth/register", { name, email, password })
    .then((r) => r.data);

export const getCurrentUser = () =>
  axiosInstance.get("/auth/me").then((r) => r.data);

// --- Users (super_admin) ---
export const listUsers = (params) =>
  axiosInstance.get(withQuery("/users", params)).then((r) => r.data);

export const createUser = (body) =>
  axiosInstance.post("/users", body).then((r) => r.data);

export const updateUser = (id, body) =>
  axiosInstance.put(`/users/${id}`, body).then((r) => r.data);

export const deleteUser = (id) =>
  axiosInstance.delete(`/users/${id}`).then((r) => r.data);

// --- Artists ---
export const listArtists = (params) =>
  axiosInstance.get(withQuery("/artists", params)).then((r) => r.data);

export const createArtist = (body) =>
  axiosInstance.post("/artists", body).then((r) => r.data);

export const updateArtist = (id, body) =>
  axiosInstance.put(`/artists/${id}`, body).then((r) => r.data);

export const deleteArtist = (id) =>
  axiosInstance.delete(`/artists/${id}`).then((r) => r.data);

export const exportArtistsCsv = () =>
  axiosInstance
    .get("/artists/export/csv", { responseType: "blob" })
    .then((r) => r.data);

export const importArtistsCsv = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return axiosInstance
    .post("/artists/import/csv", formData)
    .then((r) => r.data);
};

// --- Songs (nested under artist) ---
export const listSongsByArtist = (artistId, params) =>
  axiosInstance
    .get(withQuery(`/artists/${artistId}/songs`, params))
    .then((r) => r.data);

export const createSong = (artistId, body) =>
  axiosInstance.post(`/artists/${artistId}/songs`, body).then((r) => r.data);

export const updateSong = (artistId, songId, body) =>
  axiosInstance
    .put(`/artists/${artistId}/songs/${songId}`, body)
    .then((r) => r.data);

export const deleteSong = (artistId, songId) =>
  axiosInstance
    .delete(`/artists/${artistId}/songs/${songId}`)
    .then((r) => r.data);
