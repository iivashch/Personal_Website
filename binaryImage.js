// binaryImage.js
const fs   = require('fs').promises;
const path = require('path');

const mimeTypes = {
  '.mov':  'video/quicktime',
  '.mp4':  'video/mp4',
  '.webm': 'video/webm',
  '.ogg':  'video/ogg',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png':  'image/png',
  '.webp': 'image/webp',
  '.gif':  'image/gif',
  '.pdf':  'application/pdf',
};

module.exports.handler = async (event) => {
  try {
    const filename = event.pathParameters.proxy;
    if (!filename) return { statusCode: 400, body: 'Missing file parameter' };

    const ext = path.extname(filename).toLowerCase();
    const contentType = mimeTypes[ext];
    if (!contentType) return { statusCode: 415, body: 'Unsupported file type' };

    const filePath = path.resolve(__dirname, 'public/data', filename);
    const buffer   = await fs.readFile(filePath);

    return {
      statusCode: 200,
      isBase64Encoded: true,
      headers: {
        'Content-Type':   contentType,
        'Content-Length': buffer.length,
        'Cache-Control':  'public, max-age=0',
        // Optional; letting the browser know it *can* do ranges later if needed
        'Accept-Ranges':  'bytes'
      },
      body: buffer.toString('base64'),
    };
  }
  catch (err) {
    console.error('[BINARY SERVE ERROR]', err);
    return { statusCode: 404, body: 'File not found' };
  }
};
