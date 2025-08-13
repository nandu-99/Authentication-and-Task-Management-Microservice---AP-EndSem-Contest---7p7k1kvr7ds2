const express = require('express');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
app.use(express.json());


// Write your code


app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});

module.exports={app};