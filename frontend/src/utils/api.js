const API_BASE = "/api";

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;

  const config = {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  };

  const res = await fetch(url, config);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Something went wrong");
  }

  return data;
}

// Auth
export const authAPI = {
  login: (email, password) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (name, email, password) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),

  logout: () => request("/auth/logout", { method: "POST" }),

  getMe: () => request("/auth/me"),
};

// Applications
export const applicationsAPI = {
  getAll: () => request("/applications"),
  getOne: (id) => request(`/applications/${id}`),
  create: (data) =>
    request("/applications", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id, data) =>
    request(`/applications/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id) => request(`/applications/${id}`, { method: "DELETE" }),
};

// Resumes
export const resumesAPI = {
  getAll: () => request("/resumes"),
  getOne: (id) => request(`/resumes/${id}`),
  create: (data) =>
    request("/resumes", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id, data) =>
    request(`/resumes/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id) => request(`/resumes/${id}`, { method: "DELETE" }),
};

// Contacts
export const contactsAPI = {
  getAll: () => request("/contacts"),
  getOne: (id) => request(`/contacts/${id}`),
  create: (data) =>
    request("/contacts", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id, data) =>
    request(`/contacts/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id) => request(`/contacts/${id}`, { method: "DELETE" }),
};

// Deadlines
export const deadlinesAPI = {
  getAll: () => request("/deadlines"),
  getOne: (id) => request(`/deadlines/${id}`),
  create: (data) =>
    request("/deadlines", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id, data) =>
    request(`/deadlines/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id) => request(`/deadlines/${id}`, { method: "DELETE" }),
};

// Analytics
export const analyticsAPI = {
  get: () => request("/analytics"),
};
