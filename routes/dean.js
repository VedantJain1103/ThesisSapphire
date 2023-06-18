var express = require('express');
var router = express.Router();

require('dotenv').config()

var deanServices = require('../services/deanServices');
var thesisServices = require('../services/thesisServices');
var accountsServices = require('../services/accountsServices');

const verifyJWT = require('../middleware/verifyJWT');

router.get('/', verifyJWT, async function (req, res, next) {
    const { userId, userName, userRole } = req;
    if (userRole != "Dean") {
        res.redirect('/users/');
    }
    else {
        let user = await accountsServices.getUserById(userId);
        res.render('index', { layout: 'layout/deanLayout', name: user.name });
    }
});

router.get('/viewThesisList/', verifyJWT, async function (req, res, next) {
    const { userId, userName, userRole } = req;
    if (userRole != "Dean") {
        res.redirect('/users/');
    }
    else {
        let thesisListResult = await deanServices.getThesisList();
        if (thesisListResult.status == "Fail") {
            let error = thesisListResult.error;
            res.render('error', { layout: 'layout/deanLayout', name: userName, error: error });
        }
        else {
            let thesisList = (thesisListResult).result;
            res.render('dean/viewThesisList', { layout: 'layout/deanLayout', name: userName, thesisList: thesisList });
        }
    }
})

router.get('/viewThesis/:thesisId', verifyJWT, async function (req, res, next) {
    const { userId, userName, userRole } = req;
    const { thesisId } = req.params;
    if (userRole == "Dean") {
        const thesisResult = await thesisServices.getThesisById(thesisId, userId);
        if (thesisResult.status == "Fail") {
            error = thesisResult.error;
            res.render('error', { layout: 'layout/deanLayout', name: userName, error: error });
        } else {
            let thesis = thesisResult.result;
            let isOwner = thesisResult.isOwner;
            res.render('viewThesis', { layout: 'layout/deanLayout', name: userName, thesis: thesis, isOwner: isOwner });
        }
    }
    else {
        res.redirect('/users/');
    }
})


router.get('/viewApproveThesisList/', verifyJWT, async function (req, res, next) {
    const { userId, userName, userRole } = req;
    if (userRole == "Dean") {
        let thesisListResult = await deanServices.getThesisToBeApprovedList();
        if (thesisListResult.status == "Fail") {
            let error = thesisListResult.error;
            res.render('error', { layout: 'layout/deanLayout', name: userName, error: error });
        }
        let thesisList = (thesisListResult).result;
        res.render('dean/viewApproveThesisList', { layout: 'layout/deanLayout', name: userName, thesisList: thesisList });
    }
    else {
        res.redirect('/users/');
    }

});

router.get('/approveThesis/:thesisId', verifyJWT, async function (req, res, next) {
    const { userId, userName, userRole } = req;
    const { thesisId } = req.params;
    if (userRole == "Dean") {
        const thesisResult = await thesisServices.getThesisById(thesisId, userId);
        if (thesisResult.status == "Fail") {
            error = thesisResult.error;
            res.render('error', { layout: 'layout/deanLayout', name: userName, error: error });
        } else {
            let thesis = thesisResult.result;
            let isOwner = thesisResult.isOwner;
            res.render('dean/approveThesis', { layout: 'layout/deanLayout', name: userName, thesis: thesis, isOwner: isOwner });
        }
    }
    else {
        res.redirect('/users/');
    }
})

router.post('/approveThesis/forwardToDirector/:thesisId', verifyJWT, async function (req, res, next) {
    const { userId, userName, userRole } = req;
    const { thesisId } = req.params;
    const { thesisName, scholarEmail, mentorEmail } = req.body;
    if (userRole == "Dean") {
        let status = "Forwarded to Director";
        const updationResult = await deanServices.approveThesis(userName, thesisId, thesisName, scholarEmail, mentorEmail);
        if (updationResult.status == "Fail") {
            let error = updationResult.error;
            res.render('error', { layout: 'layout/deanLayout', error: error });
        } else {
            res.redirect('/dean/viewApproveThesisList/');
        }
    }
    else {
        res.redirect('/users/');
    }
});

module.exports = router;
