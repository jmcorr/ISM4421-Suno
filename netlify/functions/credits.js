const { sunoFetch, jsonResponse, handleError, getRequestApiKey } = require('./_suno');

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return jsonResponse(405, { code: 405, msg: 'Method not allowed' });
  }

  let apiKey;
  try {
    apiKey = getRequestApiKey(event);
  } catch (err) {
    return handleError(err);
  }

  try {
    const { status, json } = await sunoFetch('/api/v1/generate/credit', apiKey, { method: 'GET' });
    return jsonResponse(status, json);
  } catch (err) {
    return handleError(err);
  }
};
