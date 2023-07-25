const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3001; 


app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(__dirname + '/public'));


app.post('/auth', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  //cmd 
  
  //username password
  res.send(`Username: ${username}, Password: ${password}`);
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
