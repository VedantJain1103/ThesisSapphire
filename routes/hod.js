var express = require('express');
var router = express.Router();

require('dotenv').config()

var hodServices = require('../services/hodServices');

const verifyJWT = require('../middleware/verifyJWT');

router.get('/viewApproveThesisList/', verifyJWT, async function (req, res, next) {
    const { userId, userName, userRole } = req;
    if (userRole == "HOD") {
        let thesisListResult = await hodServices.getThesisToBeApprovedListById(userId);
        if (thesisListResult.status == "Fail") {
            let error = thesisListResult.error;
            res.render('error', { layout: 'userLayout', name: userName, error: error });
        }
        let thesisList = (thesisListResult).result;
        res.render('hod/viewApproveThesisList', { layout: 'userLayout', name: userName, thesisList: thesisList });
    }
    else if (userRole == "Dean") {
        // reviewed thesis    
    }
  
});
  
router.post('/approveThesis/:thesisId', verifyJWT, async function (req, res, next) {
    const { userId, userName, userRole } = req;
    const { thesisId } = req.params;
    const { thesisName, scholarEmail, mentorEmail } = req.body;
    if (userRole == "HOD") {
        let status = "Forwarded to Dean";
        const updationResult = await hodServices.approveThesis(userName, thesisId, thesisName, scholarEmail, mentorEmail);
        if (updationResult.status == "Fail") {
            let error = updationResult.error;
            res.render('error', { layout: 'userLayout', error: error });
        } else {
            res.redirect('/users/viewApproveThesisList/');
        }
    }
});

module.exports = router;
  