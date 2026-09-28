const { sunoFetch, jsonResponse, handleError } = require('./_suno');

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return jsonResponse(405, { code: 405, msg: 'Method not allowed' });
  }

  try {
    const { status, json } = await sunoFetch('/api/v1/generate/credit', { method: 'GET' });
    return jsonResponse(status, json);
  } catch (err) {
    return handleError(err);
  }
};
