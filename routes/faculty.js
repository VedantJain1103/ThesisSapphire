var express = require('express');
var router = express.Router();

require('dotenv').config()

var mentorServices = require('../services/mentorServices');

const verifyJWT = require('../middleware/verifyJWT');
const upload = require('../middleware/uploadFile');

router.get('/publish', verifyJWT, function (req, res, next) {
    const { userId, userName, userRole } = req;
    res.render('mentor/uploadThesis', { layout: 'userLayout', name: userName });
  });
  
router.post('/publish', verifyJWT, upload.single('thesis'), async function (req, res, next) {
    try {
        // console.log(req);
        const { userId, userName, userRole } = req;
        const { sEmail, description } = req.body;
        const thesis = req.file;
        let result = await mentorServices.uploadThesis(userId, sEmail, thesisName, thesis);
        if (result.status == "Fail") throw new Error(result.error);
        else res.redirect('/users/');
    } catch (error) {
        res.send(error);
    }
});
  
  
router.get('/viewThesis/:thesisId', verifyJWT, async function (req, res, next) {
    const { userId, userName, userRole } = req;
    const { thesisId } = req.params;
    const thesisResult = await mentorServices.getThesisById(thesisId);
    if (thesisResult.status == "Fail") {
        error = thesisResult.error;
        res.render('error', { layout: 'userLayout', name: userName, error: error });
    } else {
        let thesis = thesisResult.result;
        res.render('mentor/viewThesis', { layout: 'userLayout', name: userName, thesis: thesis });
    }
});
  
router.get('/viewThesisList/', verifyJWT, async function (req, res, next) {
    const { userId, userName, userRole } = req;
    if (userRole == "Scholar") {
        // submitted thesis
    }
    if (userRole == "Reviewer") {
        // reviewed thesis    
    }
    let thesisListResult = await mentorServices.getThesisListById(userId);
    if (thesisListResult.status == "Fail") {
        let error = thesisListResult.error;
        res.render('error', { layout: 'userLayout', name: userName, error: error });
    }
    let thesisList = (thesisListResult).result;
    res.render('mentor/viewThesisList', { layout: 'userLayout', name: userName, thesisList: thesisList });
});
  
module.exports = router;