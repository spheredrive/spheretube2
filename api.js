import { API_BASE_URL } from './config.js';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include', // niezbędne, żeby ciasteczko sesji (logowanie) wędrowało między pages.dev a workers.dev
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.ok === false) {
    throw new Error(data.error || `Błąd żądania (${res.status})`);
  }
  return data;
}

export const api = {
  // Filmy
  listVideos: (cursor) => request(`/api/videos${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''}`),
  getVideo: (id) => request(`/api/videos/${encodeURIComponent(id)}`),
  registerView: (id) => request(`/api/videos/${encodeURIComponent(id)}/view`, { method: 'POST' }),
  reactToVideo: (id, value) => request(`/api/videos/${encodeURIComponent(id)}/react`, { method: 'POST', body: JSON.stringify({ value }) }),
  listComments: (id) => request(`/api/videos/${encodeURIComponent(id)}/comments`),
  addComment: (id, content, parentId) => request(`/api/videos/${encodeURIComponent(id)}/comments`, { method: 'POST', body: JSON.stringify({ content, parentId }) }),
  listRelated: (id) => request(`/api/videos/${encodeURIComponent(id)}/related`),

  // Wyszukiwanie
  search: (query) => request(`/api/search?q=${encodeURIComponent(query)}`),

  // Konto
  me: () => request('/api/me'),
  login: (email, password) => request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (name, email, password, birthdate) => request('/api/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password, birthdate }) }),
  logout: () => request('/api/auth/logout', { method: 'POST' }),
  getChannel: (slug) => request(`/api/channel/${encodeURIComponent(slug)}`),

  // Pozostałe
  submitReport: (videoId, reason, details) => request('/api/reports', { method: 'POST', body: JSON.stringify({ videoId, reason, details }) }),
  checkEditAccess: (id, accessId) => request(`/api/videos/${encodeURIComponent(id)}/edit-access?accessId=${encodeURIComponent(accessId)}`),
  updateVideo: (id, accessId, payload) => request(`/api/videos/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify({ accessId, ...payload }) }),
};