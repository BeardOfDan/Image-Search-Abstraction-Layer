if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

module.exports = {
  'mongoURI': `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}`,
  'googleImagesKey': process.env.GOOGLE_IMAGES_API_KEY,
  'googleImagesId': process.env.GOOGLE_IMAGES_ID
};
