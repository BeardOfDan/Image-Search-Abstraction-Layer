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

app.get('/imagesearch/:searchTerm', async (req, res, next) => {
  const searchTerm = req.params.searchTerm;
  const offset = ~~(req.query.offset || 0);

  if (offset < 0) {
    return res.json({
      'error': 'The offset cannot be less than 0'
    });
  }

  // Log the searches
  (new Searches({
    'term': searchTerm,
    'when': Date.now()
  })).save();

  const images = await client.search(searchTerm, { 'page': offset })
    .catch((e) => {
      console.log(`e: ${e}`);
      return { 'error': e };
    });

  if (images.error) {
    return res.json(images);
  }

  const result = images.map((image) => {
    return {
      'url': image.url,
      'snippet': image.description,
      'thumbnail': image.thumbnail.url,
      'context': image.parentPage
    };
  });

  return res.json(result);
});

app.get('/latest/imagesearch/', async (req, res, next) => {
  const result = (await Searches.find({})
    .limit(10)
    .sort({ 'when': -1 }))
    .map(({ term, when }) => {
      return { term, when };
    });

  res.json(result);
});

app.listen(PORT, () => {
  console.log(`Now listening on port ${PORT}`);
});
