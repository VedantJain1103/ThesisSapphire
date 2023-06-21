var express = require('express');
var router = express.Router();

require('dotenv').config()

var accountsServices = require('../services/accountsServices');
var thesisServices = require('../services/thesisServices');

const verifyJWT = require('../middleware/verifyJWT');

router.get('/', verifyJWT, async function (req, res, next) {
    const { userId, userName, userRole } = req;
    if (userRole != "Scholar") {
        res.redirect('/users/')
    }
    let user = await accountsServices.getUserById(userId);
    res.render('index', { layout: 'layout/scholarLayout', name: user.name });
});

router.get('/viewThesis/:thesisId', verifyJWT, async function (req, res, next) {
    const { userId, userName, userRole } = req;
    const { thesisId } = req.params;
    if (userRole != "Scholar") {
        res.redirect('/users/');
    }
    else {
        let thesisResult = await thesisServices.getThesisById(thesisId, userId);
        if (thesisResult.status == "Fail") {
            error = thesisResult.error;
            res.render('error', { layout: 'layout/scholarLayout', name: userName, error: error });
        } else {
            thesisResult = thesisResult.result;
            let thesis = thesisResult.thesis;
            let invitations = thesisResult.invitations;
            let isOwner = thesisResult.isOwner;
            let comments = thesisResult.comments;
            res.render('viewThesis', { layout: 'layout/scholarLayout', name: userName, thesis: thesis, invitations: invitations, comments: comments, isOwner: isOwner });
        }
    }
});

router.get('/viewThesisList/', verifyJWT, async function (req, res, next) {
    const { userId, userName, userRole } = req;
    if (userRole == "Scholar") {
        let thesisListResult = await thesisServices.getThesisListByScholarId(userId);
        if (thesisListResult.status == "Fail") {
            let error = thesisListResult.error;
            res.render('error', { layout: 'layout/scholarLayout', name: userName, error: error });
        }
        let thesisList = (thesisListResult).result;
        res.render('scholar/viewThesisList', { layout: 'layout/scholarLayout', name: userName, thesisList: thesisList });
    }
    else {
        res.redirect('/users/');
    }

});

module.exports = router;