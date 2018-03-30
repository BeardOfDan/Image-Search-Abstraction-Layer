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

  // since the api searches by pages of 10,
  // and offsets can be done in increments of 1,
  // it is possible to need to do 2 image searches
  const pages = [];
  const multiplePages = (offset % 10) !== 0;

  if (multiplePages) { // multiple pages
    pages.push(~~(offset / 10));
    pages.push(pages[0] + 1);
  } else { // singe page
    pages.push(offset / 10);
  }

  if (multiplePages) {

    return res.json({
      searchTerm,
      offset
    });
  } else {
    const images = await client.search(searchTerm, { 'page': pages[0] })
      .catch((e) => {
        console.log('e: ' + e);
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
  }
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
