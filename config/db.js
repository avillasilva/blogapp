if (process.env.NODE_ENV == 'production') {
    module.exports = { mongoURI: 'mongodb+srv://Admin:<password>@cluster0-5j2rl.mongodb.net/test?retryWrites=true&w=majority'}
} else {
    module.exports = { mongoURI: 'mongodb://localhost/blogapp' }
}