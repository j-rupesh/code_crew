export const API_URL = "https://srv-d2moudhr0fns73bfb120.onrender.com";

export async function getData() {
  const res = await fetch(`${API_URL}/api/data`);
  return res.json();
}
