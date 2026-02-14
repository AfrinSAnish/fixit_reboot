import axios from "axios";

const API_BASE = "http://127.0.0.1:8000";

export async function getFirstWorking(paths) {
  let lastErr = null;
  for (const path of paths) {
    try {
      const res = await axios.get(`${API_BASE}${path}`);
      return { path, data: res.data };
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr;
}

export { API_BASE };
