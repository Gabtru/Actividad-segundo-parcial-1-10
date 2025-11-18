// jsonParseSeguro.js
export function jsonParseSeguro(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    return { ok: true, data, error: null };
  } catch (err) {
    console.error("Error al parsear JSON:", err.message);
    return { ok: false, data: null, error: err.message };
  }
}
