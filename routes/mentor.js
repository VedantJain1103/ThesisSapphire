var express = require('express');
var router = express.Router();

require('dotenv').config()

const thesisServices = require("../services/thesisServices");
var accountsServices = require('../services/accountsServices');
var adminServices = require('../services/adminServices');

const verifyJWT = require('../middleware/verifyJWT');
const upload = require('../middleware/uploadFile');

router.get('/', verifyJWT, async function (req, res, next) {
    const { userId, userName, userRole } = req;
    const { msg, successStatus, failStatus } = req.query;
    if (userRole != "Faculty") {
        res.redirect('/users/');
    }
    else {
        let user = await accountsServices.getUserById(userId);
        let extraData = {
            layout: 'layout/facultyLayout',
            name: userName, role: userRole,
            alert: msg,
            successAlert: successStatus,
            failAlert: failStatus
        }
        res.render('index', extraData);
    }
});

//Publishing thesis

//uploading thesis data
router.get('/thesis/upload', verifyJWT, function (req, res, next) {
    const { userId, userName, userRole } = req;
    const { msg, successStatus, failStatus } = req.query;
    if (userRole != "Faculty") {
        res.redirect('/users/');
    }
    else {
        let extraData = {
            layout: 'layout/facultyLayout',
            name: userName, role: userRole,
            alert: msg,
            successAlert: successStatus,
            failAlert: failStatus
        };
        res.render('mentor/uploadThesis', extraData);
    }
});

router.post('/thesis/upload', verifyJWT, upload.any(), async function (req, res, next) {
    try {
        // console.log(req);
        const { userId, userName, userRole } = req;
        console.log(req.files);
        if (userRole != "Faculty") {
            res.redirect('/users/');
        }
        else {
            const { scholarEmail, thesisName } = req.body;
            let thesisfiles = req.files;
            let result = await thesisServices.uploadThesis(userId, scholarEmail, thesisName, thesisfiles);
            if (result.status == "Fail") {
                res.redirect('/mentor/thesis/upload?failStatus=' + result.error);
            }
            else {
                let thesisId = result.result.addThesis.insertedId;
                console.log(result);
                res.redirect(`/mentor/thesis/submit/${thesisId}?successStatus=Thesis Uploaded Successfully`);
            }
        }
    } catch (error) {
        res.send(error);
    }
});

//adding reviewers to thesis
router.post('/thesis/addReviewer', verifyJWT, async function (req, res, next) {
    const { userId, userName, userRole } = req;
    const { thesisId, revName, revEmail, revOrg, revDesig, revType } = req.body;
    if (userRole != "Faculty") {
        res.redirect('/users/');
    }
    else {
        console.log("RequestBody:", req.body);
        let addReviewer = await thesisServices.addSuggestedReviewer(thesisId, revName, revEmail, revOrg, revDesig, revType, userId);
        console.log(addReviewer);
        if (addReviewer.status == "Fail") {
            res.redirect(`/mentor/thesis/submit/${thesisId}?failStatus=` + addReviewer.error);
        }
        else {
            res.redirect(`/mentor/thesis/submit/${thesisId}?successStatus=Reviewer Added Successfully`);
        }
    }
});

//removing reviewers from thesis
router.post('/thesis/removeReviewer/:thesisId/:reviewerId', verifyJWT, async function (req, res, next) {
    const { userId, userName, userRole } = req;
    const { thesisId, reviewerId } = req.params;
    if (userRole != "Faculty") {
        res.redirect('/users/');
    }
    else {
        console.log("RequestBody:", req.body);
        let removeReviewer = await thesisServices.removeSuggestedReviewer(reviewerId, userId);
        console.log(removeReviewer);
        if (removeReviewer.status == "Fail") {
            res.redirect(`/mentor/thesis/submit/${thesisId}?failStatus=` + removeReviewer.error);
        }
        else {
            res.redirect(`/mentor/thesis/submit/${thesisId}?successStatus=Reviewer Removed Successfully`);
        }
    }
});

router.get('/thesis/submit/:thesisId', verifyJWT, async function (req, res, next) {
    const { userId, userName, userRole } = req;
    const { thesisId } = req.params;
    const { msg, successStatus, failStatus } = req.query;
    if (userRole != "Faculty") {
        res.redirect('/users/');
    }
    else {
        let reviewers = await thesisServices.getSuggestedReviewers(thesisId, userId);
        let thesisStatus = await thesisServices.getThesisStatus(thesisId, userId);
        // console.log(thesisStatus);
        let roles = await adminServices.getRoles();

        //Removing Reviewer, Scholar and Admin role from roles
        for (let i = 0; i < roles.length; i++) {
            if (roles[i].name == "Reviewer") {
                let spliced = roles.splice(i, 1);
            }
        }
        for (let i = 0; i < roles.length; i++) {
            if (roles[i].name == "Scholar") {
                let spliced = roles.splice(i, 1);
            }
        }
        for (let i = 0; i < roles.length; i++) {
            if (roles[i].name == "Admin") {
                let spliced = roles.splice(i, 1);
            }
        }
        let result = reviewers.result;
        if (reviewers.status == "Fail") {
            let extraData = {
                layout: 'layout/facultyLayout',
                name: userName, role: userRole,
                thesisId: thesisId,
                alert: msg,
                successAlert: successStatus,
                failAlert: reviewers.error,
            };
            res.render('mentor/submitThesis', extraData);
        }
        else if (thesisStatus.status == "Fail") {
            let extraData = {
                layout: 'layout/facultyLayout',
                name: userName, role: userRole,
                thesisId: thesisId,
                alert: msg,
                successAlert: successStatus,
                failAlert: thesisStatus.error,
            };
            res.render('mentor/submitThesis', extraData);
        }
        else {
            let indianRev = result.indianReviewers;
            let foreignRev = result.foreignReviewers;
            let thesisCurrentStatus = thesisStatus.result.status;
            let extraData = {
                layout: 'layout/facultyLayout',
                name: userName, role: userRole,
                thesisId: thesisId,
                thesisStatus: thesisCurrentStatus,
                indianRev: indianRev,
                foreignRev: foreignRev,
                roles: roles,
                alert: msg,
                successAlert: successStatus,
                failAlert: failStatus
            };
            res.render('mentor/submitThesis', extraData);
        }
    }
});

//submitting thesis
router.post('/thesis/submit/:thesisId', verifyJWT, async function (req, res, next) {
    const { userId, userName, userRole } = req;
    const { thesisId } = req.params;
    if (userRole != "Faculty") {
        res.redirect('/users/');
    }
    else {
        console.log("RequestBody:", req.body);
        let submit = await thesisServices.submitThesis(thesisId, userId);
        console.log(submit);
        if (submit.status == "Fail") {
            res.redirect(`/mentor/thesis/submit/${thesisId}?failStatus=` + submit.error);
        }
        else {
            res.redirect(`/mentor/thesis/submit/${thesisId}?successStatus=Thesis Submitted Successfully`);
        }
    }
});

//View thesis
router.get('/viewThesis/:thesisId', verifyJWT, async function (req, res, next) {
    const { userId, userName, userRole } = req;
    const { thesisId } = req.params;
    if (userRole != "Faculty") {
        res.redirect('/users/');
    }
    else {
        let thesisResult = await thesisServices.getThesisById(thesisId, userId);
        if (thesisResult.status == "Fail") {
            error = thesisResult.error;
            res.render('error', { layout: 'layout/facultyLayout', name: userName, error: error });
        } else {
            thesisResult = thesisResult.result;
            let thesis = thesisResult.thesis;
            let invitations = thesisResult.invitations;
            let indianRev = thesisResult.indianRev;
            let foreignRev = thesisResult.foreignRev;
            let extraData = {
                layout: 'layout/facultyLayout',
                name: userName,
                thesis: thesis,
                invitations: invitations,
                indianRev: indianRev,
                foreignRev: foreignRev,
                isReviewer: false,
                isScholar: false
            }
            res.render('viewThesis', extraData);
        }
    }
});
//View thesis list
router.get('/viewThesisList/', verifyJWT, async function (req, res, next) {
    const { userId, userName, userRole } = req;
    if (userRole == "Faculty") {
        let thesisListResult = await thesisServices.getThesisListByMentorId(userId);
        if (thesisListResult.status == "Fail") {
            let error = thesisListResult.error;
            res.render('error', { layout: 'layout/facultyLayout', name: userName, error: error });
        }
        let thesisList = (thesisListResult).result;
        console.log("ThesisList:", thesisList);
        res.render('mentor/viewThesisList', { layout: 'layout/facultyLayout', name: userName, thesisList: thesisList });
    }
    else {
        res.redirect('/users/');
    }

});

module.exports = router;