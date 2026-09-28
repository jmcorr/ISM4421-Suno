const SUNO_BASE_URL = 'https://api.sunoapi.org';

function siteUrl() {
  return process.env.URL || process.env.DEPLOY_PRIME_URL || 'http://localhost:8888';
}

// Each visitor supplies their own Suno API key from the browser (BYOK).
// We only ever relay it to Suno for the current request — never logged,
// never persisted, never written to env vars.
function getRequestApiKey(event) {
  const headers = event.headers || {};
  const normalized = {};
  for (const key in headers) normalized[key.toLowerCase()] = headers[key];

  const apiKey = normalized['x-suno-key'];
  if (!apiKey || !apiKey.trim()) {
    const err = new Error('Missing Suno API key. Paste your key in the app to continue.');
    err.statusCode = 401;
    throw err;
  }
  return apiKey.trim();
}

async function sunoFetch(path, apiKey, options = {}) {
  const res = await fetch(`${SUNO_BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { code: res.status, msg: text || 'Unexpected response from Suno API' };
  }
  return { status: res.status, json };
}

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

function handleError(err) {
  const statusCode = err.statusCode || 502;
  return jsonResponse(statusCode, { code: statusCode, msg: err.message || 'Unexpected server error' });
}

module.exports = { SUNO_BASE_URL, siteUrl, getRequestApiKey, sunoFetch, jsonResponse, handleError };
