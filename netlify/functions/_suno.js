const SUNO_BASE_URL = 'https://api.sunoapi.org';

function getApiKey() {
  const key = process.env.SUNO_API_KEY;
  if (!key) {
    const err = new Error(
      'This site is missing the SUNO_API_KEY environment variable. Add it in Netlify: Site settings > Environment variables.'
    );
    err.statusCode = 500;
    throw err;
  }
  return key;
}

function siteUrl() {
  return process.env.URL || process.env.DEPLOY_PRIME_URL || 'http://localhost:8888';
}

async function sunoFetch(path, options = {}) {
  const apiKey = getApiKey();
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

module.exports = { SUNO_BASE_URL, getApiKey, siteUrl, sunoFetch, jsonResponse, handleError };
