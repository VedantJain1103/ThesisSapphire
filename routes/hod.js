var express = require('express');
var router = express.Router();

require('dotenv').config()

var hodServices = require('../services/hodServices');
var thesisServices = require('../services/thesisServices');
var accountsServices = require('../services/accountsServices');

const verifyJWT = require('../middleware/verifyJWT');

router.get('/', verifyJWT, async function (req, res, next) {
    const { userId, userName, userRole } = req;
    if (userRole != "HOD") {
        res.redirect('/users/');
    }
    else {
        let user = await accountsServices.getUserById(userId);
        res.render('index', { layout: 'layout/hodLayout', name: user.name });
    }
});

router.get('/viewThesisList/', verifyJWT, async function (req, res, next) {
    const { userId, userName, userRole } = req;
    if (userRole != "HOD") {
        res.redirect('/users/');
    }
    else {
        let getDepartmentResult = await accountsServices.getDepartmentByUserId(userId);
        if (getDepartmentResult.status == "Fail") {
            let error = hodDepartment.error;
            res.render('error', { layout: 'layout/hodLayout', name: userName, error: error });
        }
        else {
            let hodDepartment = getDepartmentResult.result;
            let thesisListResult = await hodServices.getThesisListByDepartment(hodDepartment);
            if (thesisListResult.status == "Fail") {
                let error = thesisListResult.error;
                res.render('error', { layout: 'layout/hodLayout', name: userName, error: error });
            }
            else {
                let thesisList = (thesisListResult).result;
                res.render('hod/viewThesisList', { layout: 'layout/hodLayout', name: userName, thesisList: thesisList });
            }
        }
    }
})

router.get('/viewThesis/:thesisId', verifyJWT, async function (req, res, next) {
    const { userId, userName, userRole } = req;
    const { thesisId } = req.params;
    if (userRole == "HOD") {
        const thesisResult = await thesisServices.getThesisById(thesisId, userId);
        if (thesisResult.status == "Fail") {
            error = thesisResult.error;
            res.render('error', { layout: 'layout/hodLayout', name: userName, error: error });
        } else {
            let thesis = thesisResult.result;
            let isOwner = thesisResult.isOwner;
            res.render('viewThesis', { layout: 'layout/hodLayout', name: userName, thesis: thesis, isOwner: isOwner });
        }
    }
    else {
        res.redirect('/users/');
    }
})


router.get('/viewApproveThesisList/', verifyJWT, async function (req, res, next) {
    const { userId, userName, userRole } = req;
    if (userRole == "HOD") {
        let thesisListResult = await hodServices.getThesisToBeApprovedListById(userId);
        if (thesisListResult.status == "Fail") {
            let error = thesisListResult.error;
            res.render('error', { layout: 'layout/hodLayout', name: userName, error: error });
        }
        let thesisList = (thesisListResult).result;
        res.render('hod/viewApproveThesisList', { layout: 'layout/hodLayout', name: userName, thesisList: thesisList });
    }
    else {
        res.redirect('/users/');
    }

});

router.get('/approveThesis/:thesisId', verifyJWT, async function (req, res, next) {
    const { userId, userName, userRole } = req;
    const { thesisId } = req.params;
    if (userRole == "HOD") {
        const thesisResult = await thesisServices.getThesisById(thesisId, userId);
        if (thesisResult.status == "Fail") {
            error = thesisResult.error;
            res.render('error', { layout: 'layout/hodLayout', name: userName, error: error });
        } else {
            let thesis = thesisResult.result;
            let isOwner = thesisResult.isOwner;
            res.render('hod/approveThesis', { layout: 'layout/hodLayout', name: userName, thesis: thesis, isOwner: isOwner });
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
            res.render('error', { layout: 'layout/hodLayout', error: error });
        } else {
            res.redirect('/hod/viewApproveThesisList/');
        }
    }
    else {
        res.redirect('/users/');
    }
});

module.exports = router;
