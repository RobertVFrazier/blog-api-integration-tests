const chai = require('chai');
const chaiHttp = require('chai-http');

const {app, runServer, closeServer} = require('../server');

// This lets us use *should* style syntax in our tests
// so we can do things like `(1 + 1).should.equal(2);`
// http://chaijs.com/api/bdd/
const should = chai.should();

// This lets us make HTTP requests
// in our tests.
// See: https://github.com/chaijs/chai-http
chai.use(chaiHttp);


describe('Blog Posts', function() {

  // Before our tests run, we activate the server. Our `runServer`
  // function returns a promise, and we return the that promise by
  // doing `return runServer`. If we didn't return a promise here,
  // there's a possibility of a race condition where our tests start
  // running before our server has started.
  before(function() {
    return runServer();
  });

  // Although we only have one test module at the moment, we'll
  // close our server at the end of these tests. Otherwise,
  // if we add another test module that also has a `before` block
  // that starts our server, it will cause an error because the
  // server would still be running from the previous tests.
  after(function() {
    return closeServer();
  });

  // Test strategy:
  //   1. Make a request to `/blog-posts`.
  //   2. Inspect response object and prove has right code and have
  //   right keys in response object.
  it('should list all blog posts on GET', function() {
    // For Mocha tests, when we're dealing with asynchronous operations,
    // we must either return a Promise object or else call a `done` callback
    // at the end of the test. The `chai.request(server).get...` call is asynchronous
    // and returns a Promise, so we just return it.
    return chai.request(app)
      .get('/blog-posts')
      .then(function(res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('array');

        // Because we create two items on app load.
        res.body.length.should.be.at.least(1);
        // Each item should be an object with key/value pairs
        // for 'title', 'content', and 'author'.
        const expectedKeys = ['title', 'content', 'author'];
        res.body.forEach(function(item) {
          item.should.be.a('object');
          item.should.include.keys(expectedKeys);
        });
      });
  });

  // Test strategy:
  //  1. Make a POST request with data for a new item.
  //  2. Inspect response object and prove it has right
  //  status code and that the returned object has an `id`.
  it('should add a blog post on POST.', function() {
    const newPost = {title: 'Test Post', content: 'Words go here.', author: 'Joe Testdata'};
    return chai.request(app)
      .post('/blog-posts')
      .send(newPost)
      .then(function(res) {
        res.should.have.status(201);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.include.keys('title', 'content', 'author');
        res.body.id.should.not.be.null;
        // response should be deep equal to `newPost` from above if we assign
        // `id` to it from `res.body.id`
        res.body.should.deep.equal(Object.assign(newPost, {id: res.body.id, publishDate: res.body.publishDate}));
      });
  });

  // Test strategy:
  //  1. Initialize some update data (we won't have an `id` yet).
  //  2. Wake a GET request so we can get a post to update.
  //  3. Add the `id` to `updateData`.
  //  4. Make a PUT request with `updateData`.
  //  5. Inspect the response object to ensure it
  //  has the right status code and that we get back an updated
  //  post with the right data in it.
  it('should update a blog post on PUT.', function() {
    // We initialize our updateData here and then after the initial
    // request to the app, we update it with an `id` property so
    // we can make a second, PUT call to the app.
    const updateData = {
      title: 'Edited Title',
      content: 'New words here.',
      author: 'Ann Author'
    };

    return chai.request(app)
      // First have to GET so we know which blog post to update.
      .get('/blog-posts')
      .then(function(res) {
        updateData.id = res.body[0].id;
        // This will return a promise whose value will be the response
        // object, which we can inspect in the next `then` back. Note
        // that we could have used a nested callback here instead of
        // returning a promise and chaining with `then`, but we find
        // this approach cleaner and easier to read and reason about.
        return chai.request(app)
          .put(`/blog-posts/${updateData.id}`)
          .send(updateData);
      })
      // Prove that the PUT request has right status code.
      .then(function(res) {
        res.should.have.status(204);
      });
  });

  // Test strategy:
  //  1. GET a shopping list items so we can get the ID of the one
  //  to delete.
  //  2. DELETE an item and ensure we get back a status 204.
  it('should delete a blog post on DELETE.', function() {
    return chai.request(app)
      // First have to GET so we have the `id` of the item to delete.
      .get('/blog-posts')
      .then(function(res) {
        return chai.request(app)
          .delete(`/blog-posts/${res.body[0].id}`);
      })
      .then(function(res) {
        res.should.have.status(204);
      });
  });
});