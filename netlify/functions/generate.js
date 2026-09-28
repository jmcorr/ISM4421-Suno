const { sunoFetch, jsonResponse, handleError, siteUrl, getRequestApiKey } = require('./_suno');

const ALLOWED_MODELS = new Set([
  'V6', 'V6_WILD', 'V6_MINI',
  'V5_5', 'V5', 'V4_5PLUS', 'V4_5ALL', 'V4_5', 'V4',
]);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { code: 405, msg: 'Method not allowed' });
  }

  let apiKey;
  try {
    apiKey = getRequestApiKey(event);
  } catch (err) {
    return handleError(err);
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return jsonResponse(400, { code: 400, msg: 'Invalid JSON body' });
  }

  const customMode = Boolean(body.customMode);
  const instrumental = Boolean(body.instrumental);
  const model = ALLOWED_MODELS.has(body.model) ? body.model : 'V6';

  const payload = {
    customMode,
    instrumental,
    model,
    callBackUrl: `${siteUrl()}/.netlify/functions/callback`,
  };

  if (typeof body.prompt === 'string' && body.prompt.trim()) payload.prompt = body.prompt.trim();
  if (typeof body.style === 'string' && body.style.trim()) payload.style = body.style.trim();

  if (customMode) {
    if (typeof body.title === 'string' && body.title.trim()) payload.title = body.title.trim().slice(0, 80);
    if (!instrumental && typeof body.lyrics === 'string' && body.lyrics.trim()) {
      payload.lyrics = body.lyrics.trim();
    }
    if (typeof body.negativeTags === 'string' && body.negativeTags.trim()) {
      payload.negativeTags = body.negativeTags.trim();
    }
    if (!instrumental && (body.vocalGender === 'm' || body.vocalGender === 'f')) {
      payload.vocalGender = body.vocalGender;
    }
    if (!payload.style && !payload.lyrics && !payload.negativeTags) {
      return jsonResponse(400, {
        code: 400,
        msg: 'Custom mode needs at least a style, lyrics, or something to avoid.',
      });
    }
  } else {
    if (!payload.prompt && !payload.style) {
      return jsonResponse(400, { code: 400, msg: 'Add a description or a style to get started.' });
    }
  }

  try {
    const { status, json } = await sunoFetch('/api/v1/generate', apiKey, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return jsonResponse(status, json);
  } catch (err) {
    return handleError(err);
  }
};
