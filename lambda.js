// lambda.js
const awsServerlessExpress = require('aws-serverless-express');
const app = require('./app');

const binaryMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
  'application/octet-stream',
  'multipart/form-data',
];

const server = awsServerlessExpress.createServer(app, null, binaryMimeTypes);

exports.handler = (event, context) => {
  return awsServerlessExpress.proxy(server, event, context);
};
