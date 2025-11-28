const API_URL = "http://localhost:3333/api";

export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem("accessToken");
  if (!options.method) options.method = "GET";

  const response = await fetch(API_URL + endpoint, {
    method: options.method,
    headers: {
      ...(token && { authorization: `Bearer ${token}` }),
      "Content-Type": "application/json",
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });


  // Se servidor retornou 401
  if (response.status == 401) {
    localStorage.removeItem("accessToken");
    window.location.href = "/frontend/public/login.html"; // redireciona
    return; // evita continuar
  }

  return response;
}
