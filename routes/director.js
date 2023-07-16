var express = require('express');
var router = express.Router();

require('dotenv').config()

var directorServices = require('../services/directorServices');
var thesisServices = require('../services/thesisServices');
var adminServices = require('../services/adminServices');

const verifyJWT = require('../middleware/verifyJWT');

router.get('/', verifyJWT, async function (req, res, next) {
    const { userId, userName, userRole } = req;
    const { msg, successStatus, failStatus } = req.query;
    if (userRole != "Director") {
        res.redirect('/users/');
    }
    else {
        let extraData = {
            layout: 'layout/directorLayout',
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
    if (userRole != "Director") {
        res.redirect('/users/');
    }
    else {
        let thesisListResult = await directorServices.getThesisList();
        if (thesisListResult.status == "Fail") {
            let error = thesisListResult.error;
            let extraData = {
                layout: 'layout/directorLayout',
                name: userName, role: userRole,
                alert: msg,
                successAlert: successStatus,
                failAlert: error
            }
            res.render('director/viewThesisList', extraData);
        }
        else {
            let thesisList = (thesisListResult).result;
            let extraData = {
                layout: 'layout/directorLayout',
                name: userName, role: userRole,
                thesisList: thesisList,
                alert: msg,
                successAlert: successStatus,
                failAlert: failStatus
            }
            res.render('director/viewThesisList', extraData);
        }
    }
})

router.get('/viewThesis/:thesisId', verifyJWT, async function (req, res, next) {
    const { userId, userName, userRole } = req;
    const { thesisId } = req.params;
    const { msg, successStatus, failStatus } = req.query;
    if (userRole == "Director") {
        let thesisResult = await thesisServices.getThesisById(thesisId, userId);
        if (thesisResult.status == "Fail") {
            error = thesisResult.error;
            let extraData = {
                layout: 'layout/directorLayout',
                name: userName, role: userRole,
                alert: msg,
                successAlert: successStatus,
                failAlert: error
            }
            res.render('error', extraData);
        } else {
            thesisResult = thesisResult.result;
            let thesis = thesisResult.thesis;
            let invitations = thesisResult.invitations;
            let indianRev = thesisResult.indianRev;
            let foreignRev = thesisResult.foreignRev;
            let extraData = {
                layout: 'layout/directorLayout',
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
    if (userRole == "Director") {
        let thesisListResult = await directorServices.getThesisToBeApprovedList();
        if (thesisListResult.status == "Fail") {
            let error = thesisListResult.error;
            let extraData = {
                layout: 'layout/directorLayout',
                name: userName, role: userRole,
                alert: msg,
                successAlert: successStatus,
                failAlert: error
            }
            res.render('error', extraData);
        }
        else {
            let thesisList = (thesisListResult).result;
            let extraData = {
                layout: 'layout/directorLayout',
                name: userName, role: userRole,
                thesisList: thesisList,
                alert: msg,
                successAlert: successStatus,
                failAlert: failStatus
            }
            res.render('director/viewApproveThesisList', extraData);
        }
    }
    else {
        res.redirect('/users/');
    }

});

router.get('/approveThesis/:thesisId', verifyJWT, async function (req, res, next) {
    const { userId, userName, userRole } = req;
    const { thesisId } = req.params;
    const { msg, successStatus, failStatus } = req.query;
    if (userRole == "Director") {
        let thesisResult = await thesisServices.getThesisById(thesisId, userId);
        if (thesisResult.status == "Fail") {
            error = thesisResult.error;
            let extraData = {
                layout: 'layout/directorLayout',
                name: userName, role: userRole,
                alert: msg,
                successAlert: successStatus,
                failAlert: error
            }
            res.render('error', extraData);
        } else {
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

            thesisResult = thesisResult.result;
            let thesis = thesisResult.thesis;
            let invitations = thesisResult.invitations;
            let indianRev = thesisResult.indianRev;
            let foreignRev = thesisResult.foreignRev;
            let extraData = {
                layout: 'layout/directorLayout',
                name: userName, role: userRole,
                thesis: thesis,
                invitations: invitations,
                indianRev: indianRev,
                foreignRev: foreignRev,
                roles: roles,
                isReviewer: false,
                isScholar: false,
                alert: msg,
                successAlert: successStatus,
                failAlert: failStatus
            }
            res.render('director/approveThesis', extraData);
        }
    }
    else {
        res.redirect('/users/');
    }
})

router.post('/thesis/addReviewer', verifyJWT, async function (req, res, next) {
    const { userId, userName, userRole } = req;
    const { thesisId, revName, revEmail, revOrg, revDesig, revType } = req.body;
    if (userRole != "Director") {
        res.redirect('/users/');
    }
    else {
        console.log("RequestBody:", req.body);
        let addReviewer = await thesisServices.addSuggestedReviewer(thesisId, revName, revEmail, revOrg, revDesig, revType, userId);
        console.log(addReviewer);
        if (addReviewer.status == "Fail") {
            res.redirect(`/director/approveThesis/${thesisId}?failStatus=` + addReviewer.error);
        }
        else {
            res.redirect(`/director/approveThesis/${thesisId}?successStatus=Reviewer Added Successfully`);
        }
    }
});

router.post('/approveThesis/:thesisId', verifyJWT, async function (req, res, next) {
    const { userId, userName, userRole } = req;
    const { thesisId } = req.params;
    const { thesisName, scholarEmail, mentorEmail, mentorName, indianRev, foreignRev } = req.body;
    if (userRole == "Director") {
        //Validating emails provided
        const updationResult = await directorServices.approveThesis(userId, userName, thesisId, thesisName, scholarEmail, mentorEmail, mentorName, indianRev, foreignRev);
        if (updationResult.status == "Fail") {
            let error = updationResult.error;
            res.redirect('/director/approveThesis/' + thesisId + '?failStatus=' + error);
        } else {
            let success = "Thesis Approved"
            res.redirect('/director/approveThesis/' + thesisId + '?successStatus=' + success);
        }
    }
    else {
        res.redirect('/users/');
    }
});

// router.get('/viewUser/:userId', verifyJWT, async function (req, res, next) {
//     const { userID, userName, userRole } = req;
//     const { userId } = req.params;
//     const { msg, successStatus, failStatus } = req.query;
//     if (userRole == "Director") {
//         let users = await directorServices.getUser(userId);
//         if (users.status == "Fail") {
//             let error = users.error;
//             res.render('error', { layout: 'layout/directorLayout', name: userName, error: error });
//         }
//         else {
//             let user = users.result;
//             res.render('director/viewUser', { layout: 'layout/directorLayout', user: user, name: userName })
//         }
//     }
//     else {
//         res.redirect('/users/');
//     }
// })

// router.get('/viewReviewer/:userId', verifyJWT, async function (req, res, next) {
//     const { userID, userName, userRole } = req;
//     const { userId } = req.params;
//     const { msg, successStatus, failStatus } = req.query;
//     if (userRole == "Director") {
//         let users = await directorServices.getReviewer(userId);
//         if (users.status == "Fail") {
//             let error = users.error;
//             res.render('error', { layout: 'layout/directorLayout', name: userName, error: error });
//         }
//         else {
//             let user = users.result;
//             res.render('director/viewReviewer', { layout: 'layout/directorLayout', user: user, name: userName })
//         }
//     }
//     else {
//         res.redirect('/users/');
//     }
// })


// router.post('/approveUser', verifyJWT, async function (req, res, next) {
//     const { userID, userName, userRole } = req;
//     const { userId, userEmail } = req.body;
//     if (userRole == "Director") {
//         let usersUpdation = await directorServices.approveUser(userId, userEmail);
//         if (usersUpdation.status == "Fail") {
//             let error = usersUpdation.error;
//             res.render('error', { layout: 'layout/directorLayout', name: userName, error: error });
//         }
//         else {
//             res.redirect('/director/viewUser/' + userId);
//         }
//     }
//     else {
//         res.redirect('/users/');
//     }
// })


// router.get('/viewApprovedUsers/', verifyJWT, async function (req, res, next) {
//     const { userId, userName, userRole } = req;
//     const { msg, successStatus, failStatus } = req.query;
//     if (userRole == "Director") {
//         let approvedUsers = await directorServices.getApprovedUsers();
//         if (approvedUsers.status == "Fail") {
//             let error = approvedUsers.error;
//             res.render('error', { layout: 'layout/directorLayout', name: userName, error: error });
//         }
//         else {
//             let { approvedFaculty, approvedScholars, approvedReviewers } = approvedUsers.result;
//             res.render('director/viewApprovedUsers', { layout: 'layout/directorLayout', approvedFaculty: approvedFaculty, approvedScholars: approvedScholars, approvedReviewers: approvedReviewers, name: userName })
//         }
//     }
//     else {
//         res.redirect('/users/');
//     }
// });

module.exports = router;
