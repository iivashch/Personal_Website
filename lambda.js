// lambda.js
const awsServerlessExpress = require('aws-serverless-express');
const app = require('./app'); // your Express app instance

// Create the server instance
const server = awsServerlessExpress.createServer(app);

// Export the Lambda-compatible handler
exports.handler = (event, context) => {
  return awsServerlessExpress.proxy(server, event, context);
};