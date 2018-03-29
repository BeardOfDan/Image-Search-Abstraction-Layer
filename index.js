const express = require('express');
const app = express();

const KEYS = require('./keys.js');

const PORT = process.env.PORT || 5000;

const mongoose = require('mongoose');
mongoose.connect(KEYS.mongoURI);

require('./models/Searches');
const Searches = mongoose.model('searches');

const GoogleImages = require('google-images');
const client = new GoogleImages(KEYS.googleImagesId, KEYS.googleImagesKey);

app.get('/', (req, res, next) => {
  res.send('Image Search Abstraction Layer');
});

app.get('/imagesearch/:searchTerm', (req, res, next) => {
  const searchTerm = req.params.searchTerm;
  const offset = ~~(req.query.offset || 0);

  res.json({
    searchTerm,
    offset
  });
  // URLs, alt text, and page urls
});

app.get('/latest/imagesearch/', (req, res, next) => {


  res.json({
    'term': 'term',
    'when': 'when'
  });
});

app.listen(PORT, () => {
  console.log('Now listening on port ' + PORT);
});
