// Modules
    const express = require('express')
    const app = express()
    const handlebars = require('express-handlebars')
    const bodyParser = require('body-parser')
    const admin = require('./routes/admin')
    const users = require('./routes/users')
    const path = require('path')
    const mongoose = require('mongoose')
    const session = require('express-session')
    const flash = require('connect-flash')
    require('./models/Post')
    const Post = mongoose.model('posts')
    require('./models/Category')
    const Category = mongoose.model('categories')
    const passport = require('passport')
    require('./config/auth')(passport)

// Settings
    // Session
        app.use(session({
            secret: "cursodenode",
            resave: true,
            saveUninitialized: true
        }))
        app.use(passport.initialize())
        app.use(passport.session())
        app.use(flash())
    // Middleware
        app.use((req, res, next) => {
            res.locals.success_msg = req.flash('success_msg')
            res.locals.error_msg = req.flash('error_msg')
            res.locals.error = req.flash('error')
            res.locals.user = req.user || null
            next()
        })
    // Body Parser
        app.use(bodyParser.urlencoded({extended: true}))
        app.use(bodyParser.json())
    // Handlebars
        app.engine('handlebars', handlebars({defaultLayout: 'main'}))
        app.set('view engine', 'handlebars')
    // Mongoose
        mongoose.Promise = global.Promise
        mongoose.connect('mongodb://localhost/blogapp', {useNewUrlParser: true, useUnifiedTopology: true}).then(() => {
            console.log('Connected to MongoDB.')
        }).catch((err) => {
            console.error(err.stack)
        })
    // Public
        app.use(express.static(path.join(__dirname, 'public')))
        app.use((req, res, next) => {
            next()
        })
    // Routes
        app.get('/', (req, res) => {
            Post.find().populate('categories').sort({ date: 'desc' }).then((posts) => {
                res.render('index', { posts: posts })
            }).catch((err) => {
                req.flash('error_msg', 'Intern error')
                res.redirect('/404')
            })
        })

        app.get('/404', (req, res) => {
            res.send('Error: 404!')
        })

        app.get('/posts', (req, res) => {
            res.send('Lista posts!')
        })
        
        app.get('/post/:slug', (req, res) => {
            Post.findOne({ slug: req.params.slug }).then((post) => {
                if (post) {
                    res.render('posts/index', { post: post})
                } else {
                    req.flash('error_msg', 'The post does not exist!')
                    res.redirect('/')
                }
            }).catch((err) => {
                req.flash('error_msg', 'Internal error!')
                res.redirect('/')
                console.log(err)
            })
        })

        app.get('/categories', (req, res) => {
            Category.find().then((categories) => {
                res.render('categories/index', { categories: categories })
            }).catch((err) => {
                req.flash('error_msg', 'Intern error')
                console.log(err)
            })
        })
        
        app.get('/categories/:slug', (req, res) => {
            Category.findOne({ slug: req.params.slug }).then((category) => {
                if (category) {
                    Post.find({ category: category._id }).then((posts) => {
                        res.render('categories/posts', { posts: posts, category: category })
                    }).catch((err) => {
                        req.flash('error_msg', 'Error ehile listing the post!')
                        res.redirect('/')
                    })
                } else {
                    req.flash('error_msg', 'Category does not exist!')
                    res.redirect('/')
                }
            }).catch((err) => {
                req.flash('error_msg', 'Intern error')
                res.redirect('/')
            })
        })

        app.use('/admin', admin)
        app.use('/users', users)
// Others
const PORT = process.env.PORT || 8081
app.listen(PORT, () => {
    console.log('The server is running.')
})