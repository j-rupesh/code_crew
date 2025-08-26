export const API_URL = "https://code-crew-2.onrender.com";

export async function getData() {
  const res = await fetch(`${API_URL}/api/data`);
  return res.json();
}
