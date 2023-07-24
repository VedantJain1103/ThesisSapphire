var express = require('express');
var router = express.Router();

require('dotenv').config()

var accountsServices = require('../services/accountsServices');
var reviewerServices = require('../services/reviewerServices');
var thesisServices = require('../services/thesisServices');

const verifyJWT = require('../middleware/verifyJWT');

router.get('/', verifyJWT, async function (req, res, next) {
    const { userId, userName, userRole } = req;
    const { msg, successStatus, failStatus } = req.query;
    if (userRole != "Reviewer") {
        res.redirect('/users/')
    }
    else {
        let extraData = {
            layout: 'layout/reviewerLayout',
            name: userName, role: userRole,
            alert: msg,
            successAlert: successStatus,
            failAlert: failStatus,
        }
        res.render('index', extraData);
    }
});

//view invitations
router.get('/invitations/', verifyJWT, async function (req, res, next) {
    const { userId, userName, userRole } = req;
    const { msg, successStatus, failStatus } = req.query;
    if (userRole != "Reviewer") {
        res.redirect('/users/');
    }
    else {
        let invitationsResult = await reviewerServices.getCurrentInvitationsList(userId);
        if (invitationsResult.status == "Fail") {
            let error = invitationsResult.error;
            res.redirect('/reviewer?failStatus=' + error);
        }
        else {
            let invitations = invitationsResult.result;
            let extraData = {
                layout: 'layout/reviewerLayout',
                name: userName, role: userRole,
                invitations: invitations,
                alert: msg,
                successAlert: successStatus,
                failAlert: failStatus,
            }
            res.render('reviewer/currentInvitations.hbs', extraData);
        }

    }
})

// to accept/reject invitations
router.get('/viewInvitation/:invitationId', verifyJWT, async function (req, res, next) {
    const { userId, userName, userRole } = req;
    const { msg, successStatus, failStatus } = req.query;
    if (userRole != "Reviewer") {
        res.redirect('/users/');
    }
    else {
        let { invitationId } = req.params;
        let invitationResult = await reviewerServices.getInvitationDetailById(invitationId, userId);
        if (invitationResult.status == "Fail") {
            let error = invitationResult.error;
            res.redirect('/reviewer?failStatus=' + error);
        }
        else {
            let invitation = invitationResult.result;
            let extraData = {
                layout: 'layout/reviewerLayout',
                name: userName, role: userRole,
                invitation: invitation,
                alert: msg,
                successAlert: successStatus,
                failAlert: failStatus,
            }
            res.render('reviewer/invitation.hbs', extraData);
        }

    }
})

router.post('/declineInvitation/:invitationId', verifyJWT, async function (req, res, next) {
    const { userId, userName, userRole } = req;
    if (userRole != "Reviewer") {
        res.redirect('/users/');
    }
    else {
        let { invitationId } = req.params;
        let invitationResult = await reviewerServices.rejectInvitationById(invitationId, userId);
        if (invitationResult.status == "Fail") {
            let error = invitationResult.error;
            res.redirect('/reviewer/invitations?failStatus=' + error);
        }
        else {
            res.redirect('/reviewer/invitations?successStatus=Invitation Declined');
        }

    }
})
router.post('/acceptInvitation/:invitationId', verifyJWT, async function (req, res, next) {
    const { userId, userName, userRole } = req;
    if (userRole != "Reviewer") {
        res.redirect('/users/');
    }
    else {
        let { invitationId } = req.params;
        let invitationResult = await reviewerServices.acceptInvitationById(invitationId, userId);
        if (invitationResult.status == "Fail") {
            let error = invitationResult.error;
            res.redirect('/reviewer/invitations?failStatus=' + error);
        }
        else {
            res.redirect('/reviewer/invitations?successStatus=Invitation Accepted');
        }

    }
})
// to view invitations history 
// /reviewer/invitations/history
router.get('/invitations/history', verifyJWT, async function (req, res, next) {
    const { userId, userName, userRole } = req;
    const { msg, successStatus, failStatus } = req.query;
    if (userRole != "Reviewer") {
        res.redirect('/users/');
    }
    else {
        let invitationsResult = await reviewerServices.getInvitationsList(userId);
        if (invitationsResult.status == "Fail") {
            let error = invitationsResult.error;
            res.redirect('/reviewer?failStatus=' + error);
        }
        else {
            let invitations = invitationsResult.result;
            let extraData = {
                layout: 'layout/reviewerLayout',
                name: userName, role: userRole,
                invitations: invitations,
                alert: msg,
                successAlert: successStatus,
                failAlert: failStatus,
            }
            res.render('reviewer/pastInvitations.hbs', extraData);
        }

    }
})

// to view under review
// /reviewer/invitations/accepted
router.get('/invitations/accepted', verifyJWT, async function (req, res, next) {
    const { userId, userName, userRole } = req;
    const { msg, successStatus, failStatus } = req.query;
    if (userRole != "Reviewer") {
        res.redirect('/users/');
    }
    else {
        let invitationsResult = await reviewerServices.getAcceptedInvitationsListForUserId(userId);
        if (invitationsResult.status == "Fail") {
            let error = invitationsResult.error;
            res.redirect('/reviewer?failStatus=' + error);
        }
        else {
            let invitations = invitationsResult.result;
            let extraData = {
                layout: 'layout/reviewerLayout',
                name: userName, role: userRole,
                invitations: invitations,
                alert: msg,
                successAlert: successStatus,
                failAlert: failStatus,
            }
            res.render('reviewer/acceptedInvitations.hbs', extraData);
        }

    }
})

router.get('/viewThesis/:thesisId', verifyJWT, async function (req, res, next) {
    const { userId, userName, userRole } = req;
    const { thesisId } = req.params;
    const { msg, successStatus, failStatus } = req.query;
    if (userRole != "Reviewer") {
        res.redirect('/users/');
    }
    else {
        let thesisResult = await reviewerServices.getThesisForReviewer(thesisId, userId);
        if (thesisResult.status == "Fail") {
            error = thesisResult.error;
            res.redirect('/reviewer?failStatus=' + error);
        } else {
            thesisResult = thesisResult.result;
            let thesis = thesisResult.thesis;
            let extraData = {
                layout: 'layout/reviewerLayout',
                name: userName, role: userRole,
                thesis: thesis,
                alert: msg,
                successAlert: successStatus,
                failAlert: failStatus,
            }
            res.render('reviewer/viewThesis', extraData);
        }
    }
})

router.get('/submitReview/:thesisId', verifyJWT, async function (req, res, next) {
    const { userId, userName, userRole } = req;
    const { thesisId } = req.params;
    const { msg, successStatus, failStatus } = req.query;
    if (userRole != "Reviewer") {
        res.redirect('/users/');
    }
    else {
        let thesisResult = await reviewerServices.getThesisForReviewer(thesisId, userId);
        if (thesisResult.status == "Fail") {
            error = thesisResult.error;
            res.redirect('/reviewer?failStatus=' + error);
        } else {
            thesisResult = thesisResult.result;
            let thesis = thesisResult.thesis;
            let extraData = {
                layout: 'layout/reviewerLayout',
                name: userName, role: userRole,
                thesis: thesis,
                alert: msg,
                successAlert: successStatus,
                failAlert: failStatus,
            }
            res.render('reviewer/viewThesis', extraData);
        }
    }
})

// to comment public (available to scholar)
router.post('/comment/', verifyJWT, async function (req, res, next) {
    const { userId, userName, userRole } = req;
    const { thesisId, description, access } = req.body;
    if (userRole != "Reviewer") {
        res.redirect('/users/');
    }
    else {
        let commentAccess = "Public";
        let reviewerId = userId;
        if (access == "Private") commentAccess = "Private";
        let post = await reviewerServices.postComment(thesisId, reviewerId, description, commentAccess);
        if (post.status == "Fail") {
            res.render('error.hbs', { layout: "layout/reviewerLayout", error: post.error, name: userName })
        }
        else {
            res.redirect(`/reviewer/viewThesis/${thesisId}`);
        }
    }
})

//to publish review

// to view completed reviews
// /reviewer/invitations/completed

module.exports = router;