var express = require('express');
var router = express.Router();

require('dotenv').config()

var directorServices = require('../services/directorServices');
var thesisServices = require('../services/thesisServices');
var accountsServices = require('../services/accountsServices');

const verifyJWT = require('../middleware/verifyJWT');

router.get('/', verifyJWT, async function (req, res, next) {
    const { userId, userName, userRole } = req;
    if (userRole != "Director") {
        res.redirect('/users/');
    }
    else {
        let user = await accountsServices.getUserById(userId);
        res.render('index', { layout: 'layout/directorLayout', name: user.name });
    }
});

router.get('/viewThesisList/', verifyJWT, async function (req, res, next) {
    const { userId, userName, userRole } = req;
    if (userRole != "Director") {
        res.redirect('/users/');
    }
    else {
        let thesisListResult = await directorServices.getThesisList();
        if (thesisListResult.status == "Fail") {
            let error = thesisListResult.error;
            res.render('error', { layout: 'layout/directorLayout', name: userName, error: error });
        }
        else {
            let thesisList = (thesisListResult).result;
            res.render('director/viewThesisList', { layout: 'layout/directorLayout', name: userName, thesisList: thesisList });
        }
    }
})

router.get('/viewThesis/:thesisId', verifyJWT, async function (req, res, next) {
    const { userId, userName, userRole } = req;
    const { thesisId } = req.params;
    if (userRole == "Director") {
        let thesisResult = await thesisServices.getThesisById(thesisId, userId);
        if (thesisResult.status == "Fail") {
            error = thesisResult.error;
            res.render('error', { layout: 'layout/directorLayout', name: userName, error: error });
        } else {
            thesisResult = thesisResult.result;
            let thesis = thesisResult.thesis;
            let invitations = thesisResult.invitations;
            let isOwner = thesisResult.isOwner;
            let comments = thesisResult.comments;
            res.render('viewThesis', { layout: 'layout/directorLayout', name: userName, thesis: thesis, invitations: invitations, comments: comments, isOwner: isOwner });
        }
    }
    else {
        res.redirect('/users/');
    }
})


router.get('/viewApproveThesisList/', verifyJWT, async function (req, res, next) {
    const { userId, userName, userRole } = req;
    if (userRole == "Director") {
        let thesisListResult = await directorServices.getThesisToBeApprovedList();
        if (thesisListResult.status == "Fail") {
            let error = thesisListResult.error;
            res.render('error', { layout: 'layout/directorLayout', name: userName, error: error });
        }
        let thesisList = (thesisListResult).result;
        res.render('director/viewApproveThesisList', { layout: 'layout/directorLayout', name: userName, thesisList: thesisList });
    }
    else {
        res.redirect('/users/');
    }

});

router.get('/approveThesis/:thesisId', verifyJWT, async function (req, res, next) {
    const { userId, userName, userRole } = req;
    const { thesisId } = req.params;
    if (userRole == "Director") {
        let thesisResult = await thesisServices.getThesisById(thesisId, userId);
        if (thesisResult.status == "Fail") {
            error = thesisResult.error;
            res.render('error', { layout: 'layout/directorLayout', name: userName, error: error });
        } else {
            thesisResult = thesisResult.result;
            let thesis = thesisResult.thesis;
            let invitations = thesisResult.invitations;
            let isOwner = thesisResult.isOwner;
            res.render('director/approveThesis', { layout: 'layout/directorLayout', name: userName, thesis: thesis, invitations: invitations, isOwner: isOwner });
        }
    }
    else {
        res.redirect('/users/');
    }
})

router.post('/approveThesis/:thesisId', verifyJWT, async function (req, res, next) {
    const { userId, userName, userRole } = req;
    const { thesisId } = req.params;
    const { thesisName, scholarEmail, mentorEmail, mentorName, remail } = req.body;
    if (userRole == "Director") {
        //Validating emails provided
        const remails = remail.split(" ");
        console.log(remails);
        var validEmailRegex = /^\S+@\S+\.\S+$/;
        let validEmails = true;
        for (let email of remails) {
            if (email.match(validEmailRegex)) {
                console.log("Valid", email);
            }
            else {
                console.log("Invalid", email);
                validEmails = false;
            }
        }
        //redirecting back if invalid email provided
        if (!validEmails) {
            const thesisResult = await thesisServices.getThesisById(thesisId, userId);
            if (thesisResult.status == "Fail") {
                error = thesisResult.error;
                res.render('error', { layout: 'layout/directorLayout', name: userName, error: error });
            } else {
                let thesis = thesisResult.result;
                let invitations = thesisResult.invitations;
                let isOwner = thesisResult.isOwner;
                res.render('director/approveThesis', { layout: 'layout/directorLayout', name: userName, thesis: thesis, invitations: invitations, isOwner: isOwner, invalidEmail: "Invalid Reviewer email provided!", remail: remail });
            }
            console.log("Invalid Email");
        }
        else {
            const updationResult = await directorServices.approveThesis(userName, thesisId, thesisName, scholarEmail, mentorEmail, mentorName, remails);
            if (updationResult.status == "Fail") {
                let error = updationResult.error;
                res.render('error', { layout: 'layout/directorLayout', error: error });
            } else {
                res.redirect('/director/viewApproveThesisList/');
            }
        }
    }
    else {
        res.redirect('/users/');
    }
});

// Faculty and student approval

router.get('/viewUnapprovedUsers/', verifyJWT, async function (req, res, next) {
    const { userId, userName, userRole } = req;
    if (userRole == "Director") {
        let unapprovedUsers = await directorServices.getUnapprovedUsers();
        if (unapprovedUsers.status == "Fail") {
            let error = unapprovedUsers.error;
            res.render('error', { layout: 'layout/directorLayout', name: userName, error: error });
        }
        else {
            let { unapprovedFaculty, unapprovedScholars } = unapprovedUsers.result;
            res.render('director/viewUnapprovedUsers', { layout: 'layout/directorLayout', unapprovedFaculty: unapprovedFaculty, unapprovedScholars: unapprovedScholars, name: userName })
        }
    }
    else {
        res.redirect('/users/');
    }
});

router.get('/viewUser/:userId', verifyJWT, async function (req, res, next) {
    const { userID, userName, userRole } = req;
    const { userId } = req.params;
    if (userRole == "Director") {
        let users = await directorServices.getUser(userId);
        if (users.status == "Fail") {
            let error = users.error;
            res.render('error', { layout: 'layout/directorLayout', name: userName, error: error });
        }
        else {
            let user = users.result;
            res.render('director/viewUser', { layout: 'layout/directorLayout', user: user, name: userName })
        }
    }
    else {
        res.redirect('/users/');
    }
})

router.get('/viewReviewer/:userId', verifyJWT, async function (req, res, next) {
    const { userID, userName, userRole } = req;
    const { userId } = req.params;
    if (userRole == "Director") {
        let users = await directorServices.getReviewer(userId);
        if (users.status == "Fail") {
            let error = users.error;
            res.render('error', { layout: 'layout/directorLayout', name: userName, error: error });
        }
        else {
            let user = users.result;
            res.render('director/viewReviewer', { layout: 'layout/directorLayout', user: user, name: userName })
        }
    }
    else {
        res.redirect('/users/');
    }
})


router.post('/approveUser', verifyJWT, async function (req, res, next) {
    const { userID, userName, userRole } = req;
    const { userId, userEmail } = req.body;
    if (userRole == "Director") {
        let usersUpdation = await directorServices.approveUser(userId, userEmail);
        if (usersUpdation.status == "Fail") {
            let error = usersUpdation.error;
            res.render('error', { layout: 'layout/directorLayout', name: userName, error: error });
        }
        else {
            res.redirect('/director/viewUser/' + userId);
        }
    }
    else {
        res.redirect('/users/');
    }
})


router.get('/viewApprovedUsers/', verifyJWT, async function (req, res, next) {
    const { userId, userName, userRole } = req;
    if (userRole == "Director") {
        let approvedUsers = await directorServices.getApprovedUsers();
        if (approvedUsers.status == "Fail") {
            let error = approvedUsers.error;
            res.render('error', { layout: 'layout/directorLayout', name: userName, error: error });
        }
        else {
            let { approvedFaculty, approvedScholars, approvedReviewers } = approvedUsers.result;
            res.render('director/viewApprovedUsers', { layout: 'layout/directorLayout', approvedFaculty: approvedFaculty, approvedScholars: approvedScholars, approvedReviewers: approvedReviewers, name: userName })
        }
    }
    else {
        res.redirect('/users/');
    }
});

module.exports = router;
