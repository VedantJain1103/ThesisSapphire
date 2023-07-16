var express = require('express');
var router = express.Router();

require('dotenv').config()

var hodServices = require('../services/hodServices');
var thesisServices = require('../services/thesisServices');
var accountsServices = require('../services/accountsServices');

const verifyJWT = require('../middleware/verifyJWT');

router.get('/', verifyJWT, async function (req, res, next) {
    const { userId, userName, userRole } = req;
    const { msg, successStatus, failStatus } = req.query;
    if (userRole != "HOD") {
        res.redirect('/users/');
    }
    else {
        let user = await accountsServices.getUserById(userId);
        let extraData = {
            layout: 'layout/hodLayout',
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
    if (userRole != "HOD") {
        res.redirect('/users/');
    }
    else {
        let getDepartmentResult = await accountsServices.getDepartmentByUserId(userId);
        if (getDepartmentResult.status == "Fail") {
            let error = hodDepartment.error;
            let extraData = {
                layout: 'layout/hodLayout',
                name: userName, role: userRole,
                alert: msg,
                successAlert: successStatus,
                failAlert: error
            }
            res.render('hod/viewThesisList', extraData);
        }
        else {
            let hodDepartment = getDepartmentResult.result;
            let thesisListResult = await hodServices.getThesisListByDepartment(hodDepartment);
            if (thesisListResult.status == "Fail") {
                let error = thesisListResult.error;
                let extraData = {
                    layout: 'layout/hodLayout',
                    name: userName, role: userRole,
                    alert: msg,
                    successAlert: successStatus,
                    failAlert: error
                }
                res.render('hod/viewThesisList', extraData);
            }
            else {
                let thesisList = (thesisListResult).result;
                let extraData = {
                    layout: 'layout/hodLayout',
                    name: userName, role: userRole,
                    thesisList: thesisList,
                    alert: msg,
                    successAlert: successStatus,
                    failAlert: failStatus
                }
                res.render('hod/viewThesisList', extraData);
            }
        }
    }
})

router.get('/viewThesis/:thesisId', verifyJWT, async function (req, res, next) {
    const { userId, userName, userRole } = req;
    const { thesisId } = req.params;
    const { msg, successStatus, failStatus } = req.query;
    if (userRole == "HOD") {
        let thesisResult = await thesisServices.getThesisById(thesisId, userId);
        if (thesisResult.status == "Fail") {
            error = thesisResult.error;
            res.render('error', { layout: 'layout/hodLayout', name: userName, error: error });
        } else {
            thesisResult = thesisResult.result;
            let thesis = thesisResult.thesis;
            let invitations = thesisResult.invitations;
            let indianRev = thesisResult.indianRev;
            let foreignRev = thesisResult.foreignRev;
            let extraData = {
                layout: 'layout/hodLayout',
                name: userName,
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
            res.render('viewThesis', extraData);
        }
    }
    else {
        res.redirect('/users/');
    }
})


router.get('/viewApproveThesisList/', verifyJWT, async function (req, res, next) {
    const { userId, userName, userRole } = req;
    const { msg, successStatus, failStatus } = req.query;
    if (userRole == "HOD") {
        let thesisListResult = await hodServices.getThesisToBeApprovedListById(userId);
        if (thesisListResult.status == "Fail") {
            let error = thesisListResult.error;
            let extraData = {
                layout: 'layout/hodLayout',
                name: userName, role: userRole,
                thesisList: thesisList,
                alert: msg,
                successAlert: successStatus,
                failAlert: error
            }
            res.render('hod/viewApproveThesisList', extraData);
        }
        let thesisList = (thesisListResult).result;
        let extraData = {
            layout: 'layout/hodLayout',
            name: userName, role: userRole,
            thesisList: thesisList,
            alert: msg,
            successAlert: successStatus,
            failAlert: failStatus
        }
        res.render('hod/viewApproveThesisList', extraData);
    }
    else {
        res.redirect('/users/');
    }

});

router.get('/approveThesis/:thesisId', verifyJWT, async function (req, res, next) {
    const { userId, userName, userRole } = req;
    const { thesisId } = req.params;
    const { msg, successStatus, failStatus } = req.query;
    if (userRole == "HOD") {
        let thesisResult = await thesisServices.getThesisById(thesisId, userId);
        if (thesisResult.status == "Fail") {
            error = thesisResult.error;
            let extraData = {
                layout: 'layout/hodLayout',
                name: userName, role: userRole,
                alert: msg,
                successAlert: successStatus,
                failAlert: error,
            }
            res.render('hod/approveThesis', extraData);
        }
        else {
            thesisResult = thesisResult.result;
            let thesis = thesisResult.thesis;
            let invitations = thesisResult.invitations;
            let indianRev = thesisResult.indianRev;
            let foreignRev = thesisResult.foreignRev;
            let extraData = {
                layout: 'layout/hodLayout',
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
            res.render('hod/approveThesis', extraData);
        }
    }
    else {
        res.redirect('/users/');
    }
})

router.post('/approveThesis/forwardToDean/:thesisId', verifyJWT, async function (req, res, next) {
    const { userId, userName, userRole } = req;
    const { thesisId } = req.params;
    const { thesisName, scholarEmail, mentorEmail } = req.body;
    if (userRole == "HOD") {
        let status = "Forwarded to Dean";
        const updationResult = await hodServices.approveThesis(userName, thesisId, thesisName, scholarEmail, mentorEmail);
        if (updationResult.status == "Fail") {
            let error = updationResult.error;
            res.redirect('/hod/viewApproveThesisList?failStatus=' + error);
        } else {
            res.redirect('/hod/viewApproveThesisList?successStatus=Thesis Approved');
        }
    }
    else {
        res.redirect('/users/');
    }
});

module.exports = router;
