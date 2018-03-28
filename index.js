const express = require('express');
const app = express();

const PORT = process.env.PORT || 5000;

app.get('/', (req, res, next) => {
  res.send('Image Search Abstraction Layer');
});



app.listen(PORT, () => {
  console.log('Now listening on port ' + PORT);
});
