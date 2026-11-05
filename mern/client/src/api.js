// All requests are same-origin, so the browser sends the login cookie automatically.
async function request(url, { method = 'GET', body } = {}) {
  const res = await fetch(url, {
    method,
    credentials: 'same-origin',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* no JSON body */
  }
  if (!res.ok) {
    const err = new Error((data && data.message) || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

export const fetchSections = () => request('/api/logos/sections');

// Auth
export async function fetchMe() {
  try {
    return (await request('/api/auth/me')).user;
  } catch (err) {
    if (err.status === 401) return null; // not signed in
    throw err;
  }
}
export const loginUser = (email, code) => request('/api/auth/login', { method: 'POST', body: { email, code } }).then((r) => r.user);
export const loginAdmin = (email, password) =>
  request('/api/auth/admin/login', { method: 'POST', body: { email, password } }).then((r) => r.user);
export const logout = () => request('/api/auth/logout', { method: 'POST' });

// Admin
export const listUsers = () => request('/api/admin/users');
export const createUser = (email, name) => request('/api/admin/users', { method: 'POST', body: { email, name } });
export const regenerateCode = (id) => request(`/api/admin/users/${id}/code`, { method: 'POST' });
export const setUserActive = (id, active) => request(`/api/admin/users/${id}`, { method: 'PATCH', body: { active } });
export const deleteUser = (id) => request(`/api/admin/users/${id}`, { method: 'DELETE' });
