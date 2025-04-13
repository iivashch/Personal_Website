const awsServerlessExpress = require('aws-serverless-express');
const app = require('./app');

const binaryMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/octet-stream',
  'multipart/form-data',
];

const server = awsServerlessExpress.createServer(app, null, binaryMimeTypes);

exports.handler = (event, context) => {
  // Proxy MUST include base64 encoding handling
  return awsServerlessExpress.proxy(server, event, context);
};
