var express = require('express');
var router = express.Router();

require('dotenv').config()

var accountsServices = require('../services/accountsServices');

const verifyJWT = require('../middleware/verifyJWT');

router.get('/', verifyJWT, async function (req, res, next) {
    const { userId, userName, userRole } = req;
    if (userRole != "Scholar") {
        res.redirect('/users/')
    }
    let user = await accountsServices.getUserById(userId);
    res.render('index', { layout: 'layout/scholarLayout', name: user.name });
});

module.exports = router;