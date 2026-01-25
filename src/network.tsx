function getCookie(name: string) {
  return document.cookie
    .split("; ")
    .find(row => row.startsWith(name + "="))
    ?.split("=")[1];
}

const getApiBase = () => {
  const configured = import.meta.env.VITE_API_URL || "";
  if (import.meta.env.DEV) {
    return "";
  }
  return configured;
};

const ensureCsrfToken = async () => {
  const apiUrl = getApiBase();
  const existing = getCookie("XSRF-TOKEN");
  if (existing) return existing;

  const res = await fetch(`${apiUrl}/api/csrf-token`, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch CSRF token");
  }

  const tokenFromCookie = getCookie("XSRF-TOKEN");
  if (tokenFromCookie) return tokenFromCookie;

  const payload = await res.json().catch(() => null);
  const token = payload?.token;
  if (token) {
    document.cookie = `XSRF-TOKEN=${encodeURIComponent(token)}; path=/; SameSite=Lax`;
    return token;
  }

  return null;
};

export { getApiBase, getCookie, ensureCsrfToken };
