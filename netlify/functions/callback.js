// Suno calls this URL when a generation task finishes. The app itself polls
// status.js instead of relying on this callback, so we just acknowledge
// receipt (required: generate/lyrics requests must include a callBackUrl).
exports.handler = async () => {
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ received: true }),
  };
};
