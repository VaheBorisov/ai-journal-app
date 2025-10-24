import type { UserResource } from '@clerk/types';

export const getUserDisplayName = (user: UserResource | null | undefined): string => {
  if (!user) return 'User';

  const firstName = user.firstName || '';
  const lastName = user.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim();

  return fullName || user.username || 'User';
};

export const getUserFirstName = (user: UserResource | null | undefined): string => {
  if (!user) return 'there';
  return user.firstName ?? user.username ?? 'there';
};

export const getUserInitials = (user: UserResource | null | undefined): string => {
  if (!user) return 'U';

  const firstName = user.firstName || '';
  const lastName = user.lastName || '';
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  return initials || 'U';
};
