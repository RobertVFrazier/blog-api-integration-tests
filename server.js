const express = require('express');
const morgan = require('morgan');

const app = express();

const blogRouter = require('./blogRouter');

// log the http layer
app.use(morgan('common'));

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// when requests come into `/blog`, we'll route them 
// to the express router instance we've imported. Remember,
// the router instance acts as modular, mini-express app.
app.use('/blog', blogRouter);

app.listen(process.env.PORT || 8080, () => {
  console.log(`Your app is listening on port ${process.env.PORT || 8080}`);
});