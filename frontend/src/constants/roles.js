export const ROLE = {
  SUPER_ADMIN: "super_admin",
  ARTIST_MANAGER: "artist_manager",
  ARTIST: "artist",
};

export function isArtistManager(role) {
  return role === ROLE.ARTIST_MANAGER;
}

export function isSuperAdmin(role) {
  return role === ROLE.SUPER_ADMIN;
}

/** Artist list */
export function canAccessArtistsSection(role) {
  return role === ROLE.SUPER_ADMIN || role === ROLE.ARTIST_MANAGER;
}

/** Import, export, create, update, delete artists */
export function canManageArtists(role) {
  return role === ROLE.ARTIST_MANAGER;
}

export function canManageUsers(role) {
  return role === ROLE.SUPER_ADMIN;
}

export function canManageSongsForAnyArtist(role) {
  return role === ROLE.SUPER_ADMIN || role === ROLE.ARTIST_MANAGER;
}

export const ROLE_TOOLTIP = {
  ARTISTS_NAV:
    "Only super administrators and artist managers can open the artist directory. Your role does not include access.",
  ARTISTS_MUTATE:
    "Only artist managers can add, edit, or delete artists or use CSV import and export. Super admins can view the list only.",
  USERS_NAV:
    "Only super administrators can open user management. Your role does not include access.",
  USERS_MUTATE: "Only super administrators can create or remove user accounts.",
  SONGS_MUTATE:
    "Only super administrators and artist managers can add or remove songs here. Artist accounts use the API with a linked artist profile.",
  SONGS_ARTIST_PICKER:
    "Choose which artist’s catalog to view. The table below lists songs for the selected artist. Add or delete songs requires a super admin or artist manager account.",
};
