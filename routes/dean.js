var express = require('express');
var router = express.Router();

require('dotenv').config()

var deanServices = require('../services/deanServices');
var thesisServices = require('../services/thesisServices');
var accountsServices = require('../services/accountsServices');

const verifyJWT = require('../middleware/verifyJWT');

router.get('/', verifyJWT, async function (req, res, next) {
    const { userId, userName, userRole } = req;
    const { msg, successStatus, failStatus } = req.query;
    if (userRole != "Dean") {
        res.redirect('/users/');
    }
    else {
        let user = await accountsServices.getUserById(userId);
        let extraData = {
            layout: 'layout/deanLayout',
            name: userName, role: userRole,
            alert: msg,
            successAlert: successStatus,
            failAlert: failStatus
        }
        res.render('index', extraData);
    }
});

router.get('/viewThesisList/', verifyJWT, async function (req, res, next) {
    const { userId, userName, userRole } = req;
    const { msg, successStatus, failStatus } = req.query;
    if (userRole != "Dean") {
        res.redirect('/users/');
    }
    else {
        let thesisListResult = await deanServices.getThesisList();
        if (thesisListResult.status == "Fail") {
            let error = thesisListResult.error;
            let extraData = {
                layout: 'layout/deanLayout',
                name: userName, role: userRole,
                alert: msg,
                successAlert: successStatus,
                failAlert: error
            }
            res.render('dean/viewThesisList', extraData);
        }
        else {
            let thesisList = (thesisListResult).result;
            let extraData = {
                layout: 'layout/deanLayout',
                name: userName, role: userRole,
                thesisList: thesisList,
                alert: msg,
                successAlert: successStatus,
                failAlert: failStatus
            }
            res.render('dean/viewThesisList', extraData);
        }
    }
})

router.get('/viewThesis/:thesisId', verifyJWT, async function (req, res, next) {
    const { userId, userName, userRole } = req;
    const { thesisId } = req.params;
    const { msg, successStatus, failStatus } = req.query;
    if (userRole == "Dean") {
        let thesisResult = await thesisServices.getThesisById(thesisId, userId);
        if (thesisResult.status == "Fail") {
            error = thesisResult.error;
            res.redirect('/dean/viewThesisList?failStatus=' + error);
        } else {
            thesisResult = thesisResult.result;
            let thesis = thesisResult.thesis;
            let invitations = thesisResult.invitations;
            let indianRev = thesisResult.indianRev;
            let foreignRev = thesisResult.foreignRev;
            let extraData = {
                layout: 'layout/deanLayout',
                name: userName, role: userRole,
                thesis: thesis,
                invitations: invitations,
                indianRev: indianRev,
                foreignRev: foreignRev,
                isReviewer: false,
                isScholar: false,
                alert: msg,
                successAlert: successStatus,
                failAlert: failStatus
            }
            res.render('viewThesis', extraData)
        }
    }
    else {
        res.redirect('/users/');
    }
})


router.get('/viewApproveThesisList/', verifyJWT, async function (req, res, next) {
    const { userId, userName, userRole } = req;
    const { msg, successStatus, failStatus } = req.query;
    if (userRole == "Dean") {
        let thesisListResult = await deanServices.getThesisToBeApprovedList();
        if (thesisListResult.status == "Fail") {
            let error = thesisListResult.error;
            let extraData = {
                layout: 'layout/deanLayout',
                name: userName, role: userRole,
                alert: msg,
                successAlert: successStatus,
                failAlert: error
            }
            res.render('dean/viewApproveThesisList', extraData);
        }
        let thesisList = (thesisListResult).result;
        let extraData = {
            layout: 'layout/deanLayout',
            name: userName, role: userRole,
            thesisList: thesisList,
            alert: msg,
            successAlert: successStatus,
            failAlert: failStatus
        }
        res.render('dean/viewApproveThesisList', extraData);
    }
    else {
        res.redirect('/users/');
    }

});

router.get('/approveThesis/:thesisId', verifyJWT, async function (req, res, next) {
    const { userId, userName, userRole } = req;
    const { thesisId } = req.params;
    const { msg, successStatus, failStatus } = req.query;
    if (userRole == "Dean") {
        let thesisResult = await thesisServices.getThesisById(thesisId, userId);
        if (thesisResult.status == "Fail") {
            error = thesisResult.error;
            res.redirect('/dean/viewThesisList?failStatus=' + error);
        } else {
            thesisResult = thesisResult.result;
            let thesis = thesisResult.thesis;
            let invitations = thesisResult.invitations;
            let indianRev = thesisResult.indianRev;
            let foreignRev = thesisResult.foreignRev;
            let extraData = {
                layout: 'layout/deanLayout',
                name: userName,
                thesis: thesis,
                invitations: invitations,
                indianRev: indianRev,
                foreignRev: foreignRev,
                isReviewer: false,
                isScholar: false,
                alert: msg,
                successAlert: successStatus,
                failAlert: failStatus,
            }
            res.render('dean/approveThesis', extraData);
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
        const updationResult = await deanServices.approveThesis(userName, thesisId, thesisName, scholarEmail, mentorEmail, userId);
        if (updationResult.status == "Fail") {
            let error = updationResult.error;
            res.redirect('/dean/viewApproveThesisList?failStatus=' + error);
        } else {
            res.redirect('/dean/viewApproveThesisList?successStatus=Thesis Approved');
        }
    }
    else {
        res.redirect('/users/');
    }
});

module.exports = router;
