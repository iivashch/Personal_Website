const fs = require('fs').promises;
const path = require('path');

const mimeTypes = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.pdf': 'application/pdf',
};

module.exports.handler = async (event) => {
  try {
    const filename = event.queryStringParameters?.file;
    if (!filename) {
      return { statusCode: 400, body: 'Missing file parameter' };
    }

    const ext = path.extname(filename).toLowerCase();
    const contentType = mimeTypes[ext];
    if (!contentType) {
      return { statusCode: 415, body: 'Unsupported file type' };
    }

    const filePath = path.resolve(__dirname, 'public/data', filename);
    const buffer = await fs.readFile(filePath);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=0',
        'Content-Disposition': ext === '.pdf' ? 'inline' : 'inline; filename=' + filename,
      },
      body: buffer.toString('base64'),
      isBase64Encoded: true,
    };
  } catch (err) {
    console.error('[BINARY SERVE ERROR]', err);
    return { statusCode: 404, body: 'File not found' };
  }
};
