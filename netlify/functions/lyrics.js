const { sunoFetch, jsonResponse, handleError, siteUrl } = require('./_suno');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { code: 405, msg: 'Method not allowed' });
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return jsonResponse(400, { code: 400, msg: 'Invalid JSON body' });
  }

  const prompt = typeof body.prompt === 'string' ? body.prompt.trim().slice(0, 200) : '';
  if (!prompt) {
    return jsonResponse(400, { code: 400, msg: 'prompt is required' });
  }

  try {
    const { status, json } = await sunoFetch('/api/v1/lyrics', {
      method: 'POST',
      body: JSON.stringify({
        prompt,
        callBackUrl: `${siteUrl()}/.netlify/functions/callback`,
      }),
    });
    return jsonResponse(status, json);
  } catch (err) {
    return handleError(err);
  }
};
