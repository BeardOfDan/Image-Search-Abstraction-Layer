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

// Yeah, I totally violate the principles of DRY in this route handler
// If you actually are reading this code... then quite fankly I am surprised!
// I mean, this is a minor project that I probably wrote a long time ago
// Whatever your deal future person, who's possibly me, I was lazy with this one, I admit it
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
    const result = [];

    let images = await client.search(searchTerm, { 'page': pages[0] }).catch((e) => {
      console.log('e: ' + e);
      return { 'error': e };
    });

    if (images.error) {
      return res.json(images);
    }

    const start = 10 % offset;
    const end = 10 - start;

    for (let i = start; i < end; i++) {
      const image = images[i];
      result.push({
        'url': image.url,
        'snippet': image.description,
        'thumbnail': image.thumbnail.url,
        'context': image.parentPage
      });
    }

    images = await client.search(searchTerm, { 'page': pages[1] }).catch((e) => {
      console.log('e: ' + e);
      return { 'error': e };
    });

    if (images.error) {
      return res.json(images);
    }

    for (let i = 0; i < start; i++) {
      const image = images[i];
      result.push({
        'url': image.url,
        'snippet': image.description,
        'thumbnail': image.thumbnail.url,
        'context': image.parentPage
      });
    }

    return res.json(result);

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
