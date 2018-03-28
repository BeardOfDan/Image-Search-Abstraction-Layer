const express = require('express');
const app = express();

const KEYS = require('./keys.js');

const PORT = process.env.PORT || 5000;

const mongoose = require('mongoose');
mongoose.connect(KEYS.mongoURI);

require('./models/Searches');
const Searches = mongoose.model('searches');

app.get('/', (req, res, next) => {
  res.send('Image Search Abstraction Layer');
});




app.listen(PORT, () => {
  console.log('Now listening on port ' + PORT);
});
