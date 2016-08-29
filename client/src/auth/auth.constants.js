export const AUTH_ADMIN_ROLE = 'admin';
export const AUTH_USER_ROLE = 'user';

export const getRoleLabel = (Role) => {
  switch (Role) {
    case AUTH_ADMIN_ROLE:
      return 'Admin';
    case AUTH_USER_ROLE:
      return 'User';
    default:
      return '';
  }
};
