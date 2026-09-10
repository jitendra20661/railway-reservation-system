export function getToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("access_token");
}

export function getUser() {
  if (typeof window === "undefined") {
    return null;
  }

  const user = localStorage.getItem("user");

  return user ? JSON.parse(user) : null;
}

export function isAdmin(): boolean {
  const user = getUser();

  return user?.role === "SUPER_ADMIN";
}

export function logout(): void {
  localStorage.removeItem("access_token");
  localStorage.removeItem("user");
}