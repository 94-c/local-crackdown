const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const REQUEST_TIMEOUT = 15_000;
const MAX_RETRIES = 2;

const STATUS_MESSAGES: Record<number, string> = {
  400: "요청 형식이 올바르지 않습니다",
  401: "로그인이 필요합니다",
  403: "접근 권한이 없습니다",
  404: "요청한 데이터를 찾을 수 없습니다",
  409: "이미 처리된 요청입니다",
  500: "서버에 문제가 발생했습니다",
  502: "서버에 연결할 수 없습니다",
  503: "서버가 점검 중입니다",
};

class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  retryCount = 0
): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    if (res.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      window.location.href = "/login";
      throw new ApiError(401, "로그인이 필요합니다");
    }

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const fallback = STATUS_MESSAGES[res.status] || `요청 실패 (${res.status})`;
      throw new ApiError(res.status, body.error || body.message || fallback);
    }

    if (res.status === 204) return {} as T;
    return res.json();
  } catch (err) {
    if (err instanceof ApiError) throw err;

    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ApiError(0, "요청 시간이 초과되었습니다");
    }

    // GET 요청 자동 재시도 (500+ 에러 또는 네트워크 에러)
    const method = (options.method || "GET").toUpperCase();
    if (method === "GET" && retryCount < MAX_RETRIES) {
      await new Promise((r) => setTimeout(r, 1000 * 2 ** retryCount));
      return request<T>(path, options, retryCount + 1);
    }

    throw new ApiError(0, "네트워크 연결을 확인해주세요");
  } finally {
    clearTimeout(timeoutId);
  }
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
