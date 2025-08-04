const API_BASE = "http://localhost:8000"; // Ganti kalau berbeda

export const login = async (email, password) => {
  const res = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return await res.json();
};

export const signup = async (username, email, password) => {
  const res = await fetch(`${API_BASE}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });
  return await res.json();
};

export const sendChat = async (question) => {
  const res = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });
  return await res.json();
};

export const saveChat = async (userId, question, answer) => {
  await fetch(`${API_BASE}/chat-log`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, question, answer }),
  });
};
