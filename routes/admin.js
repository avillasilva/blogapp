const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/Category')
const Category = mongoose.model('categories')
require('../models/Post')
const Post = mongoose.model('posts')
const {isAdmin} = require('../helpers/isAdmin')

router.get('/', isAdmin, (req, res) => {
    res.render('admin/index')
})

router.get('/categories', isAdmin, (req, res) => {
    Category.find().lean().sort({ date: 'desc' }).then((categories) => {
        res.render('admin/categories', { categories: categories })
    }).catch((err) => {
        res.flash('error_msg', 'There was an error listing the categories.')
        res.redirect('/admin')
    })
})

router.get('/categories/add', isAdmin, (req, res) => {
    res.render('admin/addcategory')
})

router.post('/categories/new', isAdmin, (req, res) => {

    var errors = []

    if (!req.body.name || typeof req.body.name == undefined || req.body.name == null) {
        errors.push({ text: 'Invalid name!' })
    }

    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
        errors.push({ text: 'Invalid slug!' })
    }

    if (req.body.name < 2) {
        errors.push({ text: 'The category name is too short!' })
    }

    if (errors.length > 0) {
        res.render('admin/addcategory', { errors: errors })
    } else {
        const newCategory = {
            name: req.body.name,
            slug: req.body.slug
        }

        new Category(newCategory).save().then(() => {
            req.flash('success_msg', 'Category created successfully!')
            res.redirect('/admin/categories')
        }).catch((err) => {
            req.flash('error_msg', 'There was an error saving the category, try again!')
            res.redirect('/admin/categories')
        })
    }
})

router.get('/categories/edit/:id', isAdmin, (req, res) => {
    Category.findOne({ _id: req.params.id }).lean().then((category) => {
        res.render('admin/editcategory', { category: category })
    }).catch((err) => {
        req.flash('error_msg', 'This category does not exist!')
        res.redirect('/admin/categories')
    })
})

router.post('/categories/edit', isAdmin, (req, res) => {
    Category.findOne({ _id: req.body.id }).then((category) => {

        var errors = []

        if (!req.body.name || typeof req.body.name == undefined || req.body.name == null) {
            errors.push({ text: 'Invalid name!' })
        }

        if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
            errors.push({ text: 'Invalid slug!' })
        }

        if (req.body.name < 2) {
            errors.push({ text: 'The category name is too short!' })
        }

        if (errors.length > 0) {
            res.render('admin/editcategory', { errors: errors, category: category })
        } else {

            category.name = req.body.name
            category.slug = req.body.slug

            category.save().then(() => {
                req.flash('success_msg', 'Category edited successfully!')
                res.redirect('/admin/categories')
            }).catch((err) => {
                req.flash('error_msg', 'There was an error editing the category!')
                res.redirect('/admin/categories')
            })
        }
    }).catch((err) => {
        req.flash('error_msg', 'There was an error editing the category!')
        res.redirect('/admin/categories')
    })
})

router.post("/categories/delete", isAdmin, (req, res) => {
    Category.deleteOne({ _id: req.body.id }).then((category) => {
        req.flash('success_msg', 'Category successfully removed!')
        res.redirect('/admin/categories')
    }).catch((err) => {
        req.flash('error_msg', 'There was an error while trying to remove the category!')
        res.redirect('/admin/categories')
    })
})

router.get('/posts', isAdmin, (req, res) => {
    Post.find().populate('category').sort({ date: 'desc' }).then((posts) => {
        res.render('admin/posts', { posts: posts })
    }).catch((err) => {
        req.flash('error_msg', 'There was an error listing the posts.')
        res.redirect('/admin')
    })
})

router.get('/posts/add', isAdmin, (req, res) => {
    Category.find().lean().then((categories) => {
        res.render('admin/addpost', { categories: categories })
    }).catch((err) => {
        req.flash('error_msg', 'An error occurred while loading the form.')
        res.redirect('/admin')
    })
})

router.post('/posts/new', isAdmin, (req, res) => {

    var errors = []

    if (!req.body.title || typeof req.body.title == undefined || req.body.title == null) {
        errors.push({ text: 'Invalid title!' })
    }

    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
        errors.push({ text: 'Invalid slug!' })
    }

    if (!req.body.description || typeof req.body.description == undefined || req.body.description == null) {
        errors.push({ text: 'Invalid description!' })
    }

    if (!req.body.content || typeof req.body.content == undefined || req.body.content == null) {
        errors.push({ text: 'Invalid content!' })
    }

    if (req.body.category == "0") {
        errors.push({ text: 'Please, enter a category!' })
    }

    if (errors.length > 0) {
        console.log(errors)
        Category.find().lean().then((categories) => {
            res.render('admin/addpost', { errors: errors, categories: categories })
        }).catch((err) => {
            req.flash('error_msg', 'An error occurred while loading the form.')
            res.render('admin/addpost')
        })
    } else {
        const newPost = {
            title: req.body.title,
            description: req.body.description,
            content: req.body.content,
            category: req.body.category,
            slug: req.body.slug
        }

        new Post(newPost).save().then(() => {
            req.flash('success_msg', 'Post created successfully.')
            res.redirect('/admin/posts')
        }).catch((err) => {
            req.flash('error_msg', 'Error: ' + err)
            res.redirect('/admin/posts')
        })
    }
})

router.get('/posts/edit/:id', isAdmin, (req, res) => {

    Post.findOne({ _id: req.params.id }).then((post) => {
        Category.find().then((categories) => {
            res.render('admin/editpost', { categories: categories, post: post })
        }).catch((err) => {
            req.flash('error_msg', 'There was an error listing the categories.')
            res.redirect('/admin/posts')
            console.log(err)
        })
    }).catch((err) => {
        req.flash('error_msg', 'An error occurred while loading the form.')
        res.redirect('/admin/posts')
        console.log(err)
    })
})

router.post('/posts/edit', isAdmin, (req, res) => {
    Post.findOne({ _id: req.body.id }).then((post) => {

        post.title = req.body.title
        post.slug = req.body.slug
        post.description = req.body.description
        post.content = req.body.content
        post.category = req.body.category

        post.save().then(() => {
            req.flash('success_msg', 'Post edited successfully!')
            res.redirect('/admin/posts')
        }).catch((err) => {
            req.flash('error_msg', 'Intern error!')
            res.redirect('/admin/posts')
            console.log(err)
        })

    }).catch((err) => {
        req.flash('error_msg', 'There was an error while saving the changes!')
        res.redirect('/admin/posts')
        console.log(err)
    })
})

router.get('/posts/delete/:id', isAdmin, (req, res) => {
    Post.remove({ _id: req.params.id }).then(() => {
        req.flash('success_msg', 'Post deleted successfully!')
        res.redirect('/admin/posts')
    }).catch((err) => {
        req.flash('error_msg', 'An error ocurred while deleting the post!')
        res.redirect('/admin/posts')
    })
})

module.exports = router