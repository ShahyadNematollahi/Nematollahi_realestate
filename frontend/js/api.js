(function (window) {
  function resolveBase() {
    if (window.APP_CONFIG && window.APP_CONFIG.apiBase) return window.APP_CONFIG.apiBase.replace(/\/$/, "");
    if (location.protocol === "file:") return "http://127.0.0.1:4000";
    if (["5500", "5173", "8080", "3000"].includes(location.port)) return "http://127.0.0.1:4000";
    return "";
  }

  async function request(path, options) {
    const response = await fetch(resolveBase() + path, {
      headers: { "Content-Type": "application/json", ...(options && options.headers) },
      ...options
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data.error || "Request failed");
      error.status = response.status;
      error.data = data;
      throw error;
    }
    return data;
  }

  window.api = {
    get: (path, headers) => request(path, { headers }),
    post: (path, body, headers) => request(path, { method: "POST", body: JSON.stringify(body || {}), headers }),
    patch: (path, body, headers) => request(path, { method: "PATCH", body: JSON.stringify(body || {}), headers }),
    del: (path, headers) => request(path, { method: "DELETE", headers })
  };
})(window);
