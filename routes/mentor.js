var express = require('express');
var router = express.Router();

require('dotenv').config()

const thesisServices = require("../services/thesisServices");
var accountsServices = require('../services/accountsServices');

const verifyJWT = require('../middleware/verifyJWT');
const upload = require('../middleware/uploadFile');

router.get('/', verifyJWT, async function (req, res, next) {
    const { userId, userName, userRole } = req;
    if (userRole != "Faculty") {
        res.redirect('/users/');
    }
    else {
        let user = await accountsServices.getUserById(userId);
        res.render('index', { layout: 'layout/facultyLayout', name: user.name });
    }
});


//Publishing thesis
router.get('/publish', verifyJWT, function (req, res, next) {
    const { userId, userName, userRole } = req;
    if (userRole != "Faculty") {
        res.redirect('/users/');
    }
    else res.render('mentor/uploadThesis', { layout: 'layout/facultyLayout', name: userName });
});

router.post('/publish', verifyJWT, upload.single('thesis'), async function (req, res, next) {
    try {
        // console.log(req);
        const { userId, userName, userRole } = req;
        if (userRole != "Faculty") {
            res.render('error.hbs', { layout: 'layout/userLayout', name: userName });
        }
        else {
            const { scholarEmail, description, thesisName } = req.body;
            const thesis = req.file;
            let result = await thesisServices.uploadThesis(userId, scholarEmail, description, thesisName, thesis);
            if (result.status == "Fail") throw new Error(result.error);
            else res.redirect('/users/');
        }
    } catch (error) {
        res.send(error);
    }
});


router.get('/viewThesis/:thesisId', verifyJWT, async function (req, res, next) {
    const { userId, userName, userRole } = req;
    const { thesisId } = req.params;
    if (userRole != "Faculty") {
        res.redirect('/users/');
    }
    else {
        const thesisResult = await thesisServices.getThesisById(thesisId, userId);
        if (thesisResult.status == "Fail") {
            error = thesisResult.error;
            res.render('error', { layout: 'layout/facultyLayout', name: userName, error: error });
        } else {
            let thesis = thesisResult.result;
            let isOwner = thesisResult.isOwner;
            res.render('viewThesis', { layout: 'layout/facultyLayout', name: userName, thesis: thesis, isOwner: isOwner });
        }
    }
});

router.get('/viewThesisList/', verifyJWT, async function (req, res, next) {
    const { userId, userName, userRole } = req;
    if (userRole == "Faculty") {
        let thesisListResult = await thesisServices.getThesisListByMentorId(userId);
        if (thesisListResult.status == "Fail") {
            let error = thesisListResult.error;
            res.render('error', { layout: 'layout/facultyLayout', name: userName, error: error });
        }
        let thesisList = (thesisListResult).result;
        res.render('mentor/viewThesisList', { layout: 'layout/facultyLayout', name: userName, thesisList: thesisList });
    }
    else {
        res.redirect('/users/');
    }

});

module.exports = router;