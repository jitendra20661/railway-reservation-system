import { Roles } from "./roles";

type Permission = {
  resource: string;
  actions: string[];
};

type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
  permissions?: Permission[];
};

export function getToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("access_token");
}

export function getUser(): User | null {
  if (typeof window === "undefined") {
    return null;
  }

  const user = localStorage.getItem("user");

  if (!user) {
    return null;
  }

  try {
    return JSON.parse(user);
  } catch {
    return null;
  }
}

export function isAdmin(): boolean {
  const user = getUser();

  return user?.role === Roles.SUPER_ADMIN;
}

export function isSubAdmin(): boolean {
  const user = getUser();

  return user?.role === Roles.SUB_ADMIN;
}

export function hasPermission(
  resource: string,
  action: string,
): boolean {
  const user = getUser();

  if (!user) {
    return false;
  }

  /*
   * SUPER_ADMIN has everything.
   */
  if (user.role === Roles.SUPER_ADMIN) {
    return true;
  }

  /*
   * Only SUB_ADMIN uses explicit permissions.
   */
  if (user.role !== Roles.SUB_ADMIN) {
    return false;
  }

  const permission = user.permissions?.find(
    (item) => item.resource === resource,
  );

  if (!permission) {
    return false;
  }

  return permission.actions.includes(action);
}

export function logout(): void {
  localStorage.removeItem("access_token");
  localStorage.removeItem("user");
}