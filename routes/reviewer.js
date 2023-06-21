var express = require('express');
var router = express.Router();

require('dotenv').config()

var accountsServices = require('../services/accountsServices');
var reviewerServices = require('../services/reviewerServices');
var thesisServices = require('../services/thesisServices');

const verifyJWT = require('../middleware/verifyJWT');

router.get('/', verifyJWT, async function (req, res, next) {
    const { userId, userName, userRole } = req;
    if (userRole != "Reviewer" && userRole != "HOD" && userRole != "Faculty") {
        res.redirect('/users/')
    }
    res.render('index', { layout: 'layout/reviewerLayout', name: userName });
});

//view invitations
router.get('/invitations/', verifyJWT, async function (req, res, next) {
    const { userId, userName, userRole } = req;
    if (userRole == "Scholar") {
        res.redirect('/users/');
    }
    else {
        let invitationsResult = await reviewerServices.getCurrentInvitationsList(userId);
        if (invitationsResult.status == "Fail") {
            res.render('error.hbs', { layout: 'layout/reviewerLayout', error: invitationsResult.error });
        }
        else {
            let invitations = invitationsResult.result;
            res.render('reviewer/currentInvitations.hbs', { layout: 'layout/reviewerLayout', invitations: invitations, name: userName });
        }

    }
})

// to accept/reject invitations
router.get('/viewInvitation/:invitationId', verifyJWT, async function (req, res, next) {
    const { userId, userName, userRole } = req;
    if (userRole == "Scholar") {
        res.redirect('/users/');
    }
    else {
        let { invitationId } = req.params;
        let invitationResult = await reviewerServices.getInvitationDetailById(invitationId, userId);
        if (invitationResult.status == "Fail") {
            res.render('error.hbs', { layout: 'layout/reviewerLayout', error: invitationResult.error });
        }
        else {
            let invitation = invitationResult.result;
            res.render('reviewer/invitation.hbs', { layout: 'layout/reviewerLayout', invitation: invitation, name: userName });
        }

    }
})

router.post('/rejectInvitation/:invitationId', verifyJWT, async function (req, res, next) {
    const { userId, userName, userRole } = req;
    if (userRole == "Scholar") {
        res.redirect('/users/');
    }
    else {
        let { invitationId } = req.params;
        let invitationResult = await reviewerServices.rejectInvitationById(invitationId, userId);
        if (invitationResult.status == "Fail") {
            res.render('error.hbs', { layout: 'layout/reviewerLayout', error: invitationResult.error });
        }
        else {
            let invitation = invitationResult.result;
            res.redirect('/reviewer/invitations');
        }

    }
})
router.post('/acceptInvitation/:invitationId', verifyJWT, async function (req, res, next) {
    const { userId, userName, userRole } = req;
    if (userRole == "Scholar") {
        res.redirect('/users/');
    }
    else {
        let { invitationId } = req.params;
        let invitationResult = await reviewerServices.acceptInvitationById(invitationId, userId);
        if (invitationResult.status == "Fail") {
            res.render('error.hbs', { layout: 'layout/reviewerLayout', error: invitationResult.error });
        }
        else {
            let invitation = invitationResult.result;
            res.redirect('/reviewer/invitations');
        }

    }
})
// to view invitations history 
// /reviewer/invitations/history
router.get('/invitations/history', verifyJWT, async function (req, res, next) {
    const { userId, userName, userRole } = req;
    if (userRole == "Scholar") {
        res.redirect('/users/');
    }
    else {
        let invitationsResult = await reviewerServices.getInvitationsList(userId);
        if (invitationsResult.status == "Fail") {
            res.render('error.hbs', { layout: 'layout/reviewerLayout', error: invitationsResult.error });
        }
        else {
            let invitations = invitationsResult.result;
            res.render('reviewer/pastInvitations.hbs', { layout: 'layout/reviewerLayout', invitations: invitations, name: userName });
        }

    }
})

// to view under review
// /reviewer/invitations/accepted
router.get('/invitations/accepted', verifyJWT, async function (req, res, next) {
    const { userId, userName, userRole } = req;
    if (userRole == "Scholar") {
        res.redirect('/users/');
    }
    else {
        let invitationsResult = await reviewerServices.getAcceptedInvitationsListForUserId(userId);
        if (invitationsResult.status == "Fail") {
            res.render('error.hbs', { layout: 'layout/reviewerLayout', error: invitationsResult.error });
        }
        else {
            let invitations = invitationsResult.result;
            res.render('reviewer/acceptedInvitations.hbs', { layout: 'layout/reviewerLayout', invitations: invitations, name: userName });
        }

    }
})

router.get('/viewThesis/:thesisId', verifyJWT, async function (req, res, next) {
    const { userId, userName, userRole } = req;
    const { thesisId } = req.params;
    if (userRole != "Scholar") {
        let thesisResult = await reviewerServices.getThesisForReviewer(thesisId, userId);
        if (thesisResult.status == "Fail") {
            error = thesisResult.error;
            res.render('error', { layout: 'layout/reviewerLayout', name: userName, error: error });
        } else {
            thesisResult = thesisResult.result;
            let thesis = thesisResult.thesis;
            let comments = thesisResult.comments;
            res.render('reviewer/viewThesis', { layout: 'layout/reviewerLayout', name: userName, thesis: thesis, comments: comments });
        }
    }
    else {
        res.redirect('/users/');
    }
})

// to comment public (available to scholar)
router.post('/comment/', verifyJWT, async function (req, res, next) {
    const { userId, userName, userRole } = req;
    const { thesisId, description, access } = req.body;
    if (userRole != "Scholar") {
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
    else {
        res.redirect('/users/');
    }
})

//to publish review

// to view completed reviews
// /reviewer/invitations/completed

module.exports = router;