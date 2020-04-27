if (process.env.NODE_ENV === 'production') {
  module.exports = { mongoURI: 'mongodb+srv://Admin:4JIOltjuJLT0Cwy7@cluster0-5j2rl.mongodb.net/test?retryWrites=true&w=majority' }
} else {
  module.exports = { mongoURI: 'mongodb://localhost/blogapp' }
}
