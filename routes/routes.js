const express = require('express');
const db = require('../models');
const cheerio = require('cheerio');
const axios = require('axios');

module.exports = app => {
    app.get('/', (req, res) => {
        db.Article.find({ saved: false }).sort({ '_id': -1 }).then(dbArticle => {
            res.render('index', { articles: dbArticle });
        }).catch(err => res.json(err));
    });

    app.get('/scrape', (req, res) => {
        db.Article.find({}).then(articles => {
            let alreadyScraped = articles.map(article => article.link);
            axios.get('https://www.tinymixtapes.com/news').then(response => {
                const $ = cheerio.load(response.data);
                $('article.tile--small-rect').each((i, element) => {
                    let result = {};
                    result.title = $(element).find('div').find('a').find('h4').find('span').text().trim();
                    result.link = $(element).find('figure').find('a').attr('href');
                    result.img = $(element).find('figure').find('a').find('img').attr('src');
                    if (!alreadyScraped.includes(result.link)) {
                        db.Article.create(result).then(dbArticle => {
                            console.log(dbArticle);
                        }).catch(err => res.json(err));
                    };
                });
                res.redirect('/');
            });
        });
    });

    app.get('/saved', function (req, res) {
        db.Article.find({ saved: true }).sort({ '_id': -1 })
        .populate('comment')
        .exec(function (err, article) {
            if (err) res.json(err);
            console.log(article);
            res.render('index', { articles: article });
        });
    });

    app.get('/saved/:id', (req, res) => {
        db.Article.findOne({ _id: req.params.id })
        .populate('comment')
        .exec((err, article) => {
            if (err) res.json(err);
            console.log(article);
            res.json(article);
        });
    });

    app.post('/saved/:id', (req, res) => {
        db.Comment.create(req.body)
        .then( result => {
            db.Article.findOneAndUpdate({ _id: req.params.id }, { $push: { comment: result._id }}, { new: true })
            .then(dbArticle => res.json(dbArticle))
            .catch(err => res.json(err));
        }).catch(err => res.json(err));
    });

    app.delete('/saved/:id', (req, res) => {
        db.Article.findByIdAndRemove(req.params.id)
        .then(dbArticle => res.json(dbArticle))
        .catch(err => res.json(err));
    });

    app.get('/articles', (req, res) => {
        db.Article.find({})
        .then(dbArticle => res.json(dbArticle))
        .catch(err => res.json(err));
    });

    app.post('/articles/:id', (req, res) => {
        db.Article.findOneAndUpdate({ _id: req.params.id }, { saved: true })
        .then(dbArticle => res.json(dbArticle))
        .catch(err => res.json(err));
    });
}