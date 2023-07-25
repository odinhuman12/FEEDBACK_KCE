const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000; 


app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(__dirname + '/public'));


app.post('/auth', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Do whatever you want with the username and password here
  // For example, you can store them in a database or validate them
  
  // Respond with a simple message for now
  res.send(`Username: ${username}, Password: ${password}`);
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
