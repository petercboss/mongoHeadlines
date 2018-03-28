const express = require('express');
const router = express.Router();
const db = require('../models/headlines.js');
const cheerio = require('cheerio');
const request = require('request');

module.exports = router;