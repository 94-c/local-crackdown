export function parseJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function getRoleFromToken(token: string): string | null {
  const payload = parseJwtPayload(token);
  if (!payload) return null;
  return (payload.role as string) || null;
}

export function isAdmin(token: string): boolean {
  return getRoleFromToken(token) === "ADMIN";
}
