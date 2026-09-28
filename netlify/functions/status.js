const { sunoFetch, jsonResponse, handleError } = require('./_suno');

const PATHS = {
  music: '/api/v1/generate/record-info',
  lyrics: '/api/v1/lyrics/record-info',
};

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return jsonResponse(405, { code: 405, msg: 'Method not allowed' });
  }

  const params = event.queryStringParameters || {};
  const taskId = params.taskId;
  const type = PATHS[params.type] ? params.type : 'music';

  if (!taskId) {
    return jsonResponse(400, { code: 400, msg: 'taskId is required' });
  }

  try {
    const { status, json } = await sunoFetch(
      `${PATHS[type]}?taskId=${encodeURIComponent(taskId)}`,
      { method: 'GET' }
    );
    return jsonResponse(status, json);
  } catch (err) {
    return handleError(err);
  }
};
