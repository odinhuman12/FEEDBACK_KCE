const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000; // Choose a port number for your server

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (css, images, etc.)
app.use(express.static(__dirname + '/public'));

// Route for handling form submission
app.post('/auth', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Do whatever you want with the username and password here
  // For example, you can store them in a database or validate them
  
  // Respond with a simple message for now
  res.send(`Username: ${username}, Password: ${password}`);
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
