const express = require('express');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Define root route
app.get('/', (req, res) => {
  res.send('Welcome to the API!');
});

// Define status route
app.get('/status', (req, res) => {
  const status = {
    Status: 'Running'
  };
  res.send(status);
});

// Start server
app.listen(PORT, () => {
  console.log("Server Listening on PORT:", PORT);
});
