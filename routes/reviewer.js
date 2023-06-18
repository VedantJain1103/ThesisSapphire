var express = require('express');
var router = express.Router();

require('dotenv').config()

var accountsServices = require('../services/accountsServices');

const verifyJWT = require('../middleware/verifyJWT');

router.get('/', verifyJWT, async function (req, res, next) {
    const { userId, userName, userRole } = req;
    if (userRole != "Reviewer" && userRole != "HOD" && userRole != "Faculty") {
        res.redirect('/users/')
    }
    let user = await accountsServices.getUserById(userId);
    res.render('index', { layout: 'layout/scholarLayout', name: user.name });
});

// to accept/reject invitations

// to view under review

// to view completed reviews

// to comment public (available to scholar)

// to comment private (available to Director)
module.exports = router;