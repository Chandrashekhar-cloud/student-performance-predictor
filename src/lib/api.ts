export const getApiBaseUrl = (): string => {
  if (typeof window !== "undefined") {
    const env = (window as unknown as { __ENV__?: { VITE_API_URL?: string } }).__ENV__;
    if (env?.VITE_API_URL) {
      return env.VITE_API_URL.replace(/\/+$/, "");
    }
  }

  const viteUrl = (import.meta.env as Record<string, string | undefined>)["VITE_API_URL"];
  if (viteUrl) {
    return viteUrl.replace(/\/+$/, "");
  }

  return "http://127.0.0.1:5000";
};

export const API_BASE = getApiBaseUrl();
