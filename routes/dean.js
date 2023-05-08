var express = require('express');
var router = express.Router();

require('dotenv').config()

const verifyJWT = require('../middleware/verifyJWT');

router.get('/', verifyJWT, function (req, res, next) {
    res.send("Hello dean");
  
});

module.exports = router;