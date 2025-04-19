const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple root endpoint
app.get('/', (req, res) => {
  res.send('Bot is alive and running!');
});

// Simplified health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

const port = 5000; // Use port 5000

function startServer() {
  return new Promise((resolve, reject) => { // Return a Promise
    const server = app.listen(port, '0.0.0.0', () => {
      console.log(`Server is running on port ${port}`);
      resolve(server); // Resolve the promise with the server instance
    });

    server.keepAliveTimeout = 120000;
    server.headersTimeout = 120000;

    // Add error handling to reject the promise in case of failure
    server.on('error', (error) => {
      console.error('Could not start the server:', error);
      reject(error);
    });
  });
}

module.exports = startServer;