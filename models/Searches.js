const mongoose = require('mongoose');
const { Schema } = mongoose;

const searchesSchema = new Schema({
  'term': String,
  'when': Date
});

mongoose.model('searches', searchesSchema);
