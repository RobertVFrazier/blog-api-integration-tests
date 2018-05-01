const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();


const {BlogPosts} = require('./models.js');

// we're going to add some posts to Posts
// so there's some data to look at
BlogPosts.create(
  'Pointless Blog Post', 'Not much to see here. If only I could think of a hot topic to blog about!', 'Joe Enui');
BlogPosts.create(
  'This Blog is Crap!', 'I cannot believe I wasted seconds of my life reading that other post.', 'Mary Critique');

// send back JSON representation of all posts
// on GET requests to root
router.get('/', (req, res) => {
  res.json(BlogPosts.get());
});


// When a new post is added, ensure it has the required fields. if not,
// log an error and return a 400 status code with a helpful message.
// If it's okay, add the new item, and return it with a status 201.
router.post('/', jsonParser, (req, res) => {
  // Ensure 'title', 'content', and 'author' are in the request body.
  const requiredFields = ['title', 'content', 'author'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing '${field}' in request body.`
      console.error(message);
      return res.status(400).send(message);
    }
  }
  const item = BlogPosts.create(req.body.title, req.body.content, req.body.author);
  res.status(201).json(item);
});

// Delete posts (by id)!
router.delete('/:id', (req, res) => {
    BlogPosts.delete(req.params.id);
  console.log(`Deleted shopping list item '${req.params.ID}'`);
  res.status(204).end();
});

// When a PUT request comes in with an updated post, ensure it has
// the required fields. Also ensure that the post id is in url path, and
// the post id in the updated item object matches. If there are problems with any
// of that, log the error and send back a status code 400. Otherwise,
// call `Posts.updateItem` with the updated post.
router.put('/:id', jsonParser, (req, res) => {
  const requiredFields = ['title', 'content', 'author'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing '${field}' in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  }
  if (req.params.id !== req.body.id) {
    const message = (
      `Request path id (${req.params.id}) and request body id `
      `(${req.body.id}) must match`);
    console.error(message);
    return res.status(400).send(message);
  }
  console.log(`Updating blog post item '${req.params.id}'`);
  const updatedItem = BlogPosts.update({
    id: req.params.id,
    title: req.body.title,
    content: req.body.content,
    author: req.body.author,
    publishDate: req.body.publishDate
  });
  res.status(204).end();
})

module.exports = router;