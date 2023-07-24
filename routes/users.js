var express = require('express');
var router = express.Router();

require('dotenv').config()

var jwtServices = require('../services/jwtServices');
var adminServices = require('../services/adminServices');
var accountsServices = require('../services/accountsServices');
var thesisServices = require('../services/thesisServices');
var s3Services = require('../services/s3');
var s3UploadServices = require('../services/s3UploadServices');

const fs = require('fs');
const util = require('util');
const unlinkFile = util.promisify(fs.unlink);
var path = require('path');
var multer = require('multer');

const { encrypt, decrypt } = require('../services/encryptionServices');
const verifyJWT = require('../middleware/verifyJWT');
const upload = require('../middleware/uploadFile');
const { verify } = require('crypto');
const { RequestSmsRecipientExport } = require('sib-api-v3-sdk');
// app.use(verifyJWT);

router.get('/thesis/:key', verifyJWT, (req, res) => {
  const { userId, userName, userRole } = req;
  if (userRole == "Admin" || userRole == "Dean" || userRole == "Director" || userRole == "HOD" || userRole == "Faculty" || userRole == "Reviewer" || userRole == "Scholar") {
    const { key } = req.params;
    let file = s3Services.getFileStream(key);
    file.pipe(res);
  }
  else {
    res.render("error.hbs", { layout: 'userLayout', name: userName });
  }
})

router.get('/', verifyJWT, async function (req, res, next) {
  const { userId, userName, userRole } = req;
  if (userRole == "Admin") {
    res.redirect('/admin');
  }
  else if (userRole == "Dean") {
    res.redirect('/dean/');
  }
  else if (userRole == "Director") {
    res.redirect('/director/');
  }
  else if (userRole == "HOD") {
    res.redirect('/hod/');
  }
  else if (userRole == "Faculty") {
    res.redirect('/mentor/');
  }
  else if (userRole == "Reviewer") {
    res.redirect('/reviewer/');
  }
  else if (userRole == "Scholar") {
    res.redirect('/scholar/');
  }
  else {
    res.render("error.hbs", { layout: 'userLayout', name: userName });
  }
});

router.post('/rejectThesis/:thesisId', verifyJWT, async function (req, res, next) {
  const { userId, userName, userRole } = req;
  const { thesisId } = req.params;
  const { thesisName, scholarEmail, mentorEmail, rejectionReason } = req.body;
  if (userRole == "HOD" || userRole == "Dean" || userRole == "Director") {
    const updationResult = await thesisServices.rejectThesis(userId, thesisId, thesisName, scholarEmail, mentorEmail, rejectionReason);
    if (updationResult.status == "Fail") {
      let error = updationResult.error;
      res.render('error', { layout: 'layout/hodLayout', error: error });
    } else {
      res.redirect('/users/');
    }
  }
  else {
    res.redirect('/users/');
  }
});


router.get('/profileCompletion', verifyJWT, async function (req, res, next) {
  let { userId, userName } = req;
  let user = await accountsServices.getUserById(userId);
  let departments = await adminServices.getDepartments();
  let roles = await adminServices.getRoles();
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
  // console.log(roles, departments);
  // let departments = [], roles = [];
  res.render('accounts/profileCompletion', { layout: 'userLayout', name: user.name, email: user.email, departments: departments, roles: roles });
});

router.post('/profileCompletion/reviewer', verifyJWT, async function (req, res, next) {
  const { userId, userName, userRole } = req;
  const { name, email, institute, pfId, department } = req.body;
  console.log(req.body);
  if (!name || !email || !institute || !pfId) {
    error = "Error: Insuficient data.";
    res.render('error', { layout: 'userLayout', error: error });
    return;
  }
  else {
    let profileCompletionStatus = await accountsServices.completeUserProfileReviewer(userId, name, email, institute, pfId);
    if (profileCompletionStatus.status == "Fail") {
      res.render('error', { layout: 'userLayout', error: profileCompletionStatus.error });
    }
    else {
      let refreshToken = req.cookies.jwt_refreshToken;
      let newAccessToken = await jwtServices.refreshAccessTokenByRefreshToken(refreshToken);
      if (newAccessToken) {
        res.cookie('jwt_accessToken', newAccessToken, { httpOnly: true, maxAge: 15 * 60 * 1000 });
        res.redirect('/users/');
      }
      else {
        res.render('accounts/signIn', { title: 'Express', email: '' });
      }
    }
  }
})

router.post('/profileCompletion/connect', verifyJWT, async function (req, res, next) {
  const { userId, userName, userRole } = req;
  let profileCompletionStatus = await accountsServices.connectProfile(userId);
  if (profileCompletionStatus.status == "Fail") {
    res.render('error', { layout: 'userLayout', error: profileCompletionStatus.error });
  }
  else {
    let refreshToken = req.cookies.jwt_refreshToken;
    let newAccessToken = await jwtServices.refreshAccessTokenByRefreshToken(refreshToken);
    if (newAccessToken) {
      res.cookie('jwt_accessToken', newAccessToken, { httpOnly: true, maxAge: 15 * 60 * 1000 });
      res.redirect('/users/');
    }
    else {
      res.render('accounts/signIn', { title: 'Express', email: '' });
    }
  }
})


router.post('/profileCompletion/faculty', verifyJWT, async function (req, res, next) {
  const { userId, userName, userRole } = req;
  const { name, email, institute, department, pfId, role } = req.body;
  console.log(req.body);
  if (!name || !email || !institute || !department || !pfId || !role) {
    error = "Error: Insuficient data.";
    res.render('error', { layout: 'userLayout', error: error });
    return;
  }
  else {
    let profileCompletionStatus = await accountsServices.completeUserProfileFaculty(userId, name, email, institute, department, pfId, role);
    console.log(profileCompletionStatus);
    if (profileCompletionStatus.status == "Fail") {
      res.render('error', { layout: 'userLayout', error: profileCompletionStatus.error });
    }
    else {
      let refreshToken = req.cookies.jwt_refreshToken;
      let newAccessToken = await jwtServices.refreshAccessTokenByRefreshToken(refreshToken);
      if (newAccessToken) {
        res.cookie('jwt_accessToken', newAccessToken, { httpOnly: true, maxAge: 15 * 60 * 1000 });
        res.redirect('/users/');
      }
      else {
        res.render('accounts/signIn', { title: 'Express', email: '' });
      }
    }
  }
})

router.post('/profileCompletion/scholar', verifyJWT, async function (req, res, next) {
  const { userId, userName, userRole } = req;
  const { name, email, institute, department, rollNo, dateOfJoining } = req.body;
  console.log(req.body);
  if (!name || !email || !institute || !department) {
    error = "Error: Insuficient data.";
    res.render('error', { layout: 'userLayout', error: error });
    return;
  }
  if (!rollNo && !dateOfJoining) {
    error = "Error: Insuficient data.";
    res.render('error', { layout: 'userLayout', error: error });
  }
  else {
    let profileCompletionStatus = await accountsServices.completeUserProfileScholar(userId, name, email, institute, department, rollNo, dateOfJoining);
    if (profileCompletionStatus.status == "Fail") {
      res.render('error', { layout: 'userLayout', error: profileCompletionStatus.error });
    }
    else {
      let refreshToken = req.cookies.jwt_refreshToken;
      let newAccessToken = await jwtServices.refreshAccessTokenByRefreshToken(refreshToken);
      if (newAccessToken) {
        res.cookie('jwt_accessToken', newAccessToken, { httpOnly: true, maxAge: 15 * 60 * 1000 });
        res.redirect('/users/');
      }
      else {
        res.render('accounts/signIn', { title: 'Express', email: '' });
      }
    }
  }
})

router.post('/profileCompletion', verifyJWT, async function (req, res, next) {
  const { userId, userName, userRole } = req;
  const { name, email, institute, department, role, rollNo, dateOfJoining, pfId } = req.body;
  console.log(req.body);
  if (!name || !email || !institute || !department || !role) {
    error = "Error: Insuficient data.";
    res.render('error', { layout: 'userLayout', error: error });
    return;
  }
  // const today = new Date();
  console.log(dateOfJoining);
  if (role != "Scholar" && role != "Faculty" && role != "Reviewer" && role != "Dean" && role != "HOD") {
    error = "Error: Incorrect data";
    res.render('error', { layout: 'userLayout', error: error });
  }
  else if (role == "Scholar" && !rollNo && !dateOfJoining) {
    error = "Error: Insuficient data.";
    res.render('error', { layout: 'userLayout', error: error });
  }
  else if ((role == "Faculty" || role == "Reviewer" || role == "Dean" || role == "HOD") && (!pfId)) {
    res.send("Error: Insuficient data.");
  }
  else {
    let profileCompletionStatus = await accountsServices.completeUserProfile(userId, name, email, institute, department, role, rollNo, dateOfJoining, pfId);
    if (profileCompletionStatus.status == "Fail") {
      res.render('error', { layout: 'userLayout', error: profileCompletionStatus.error });
    }
    else {
      let refreshToken = req.cookies.jwt_refreshToken;
      let newAccessToken = await jwtServices.refreshAccessTokenByRefreshToken(refreshToken);
      if (newAccessToken) {
        res.cookie('jwt_accessToken', newAccessToken, { httpOnly: true, maxAge: 15 * 60 * 1000 });
        res.redirect('/users/');
      }
      else {
        res.render('accounts/signIn', { title: 'Express', email: '' });
      }
    }
  }
})

router.get('/notApproved', verifyJWT, async function (req, res, next) {
  const { userId, userName, userRole } = req;
  console.log(userName, userId, userRole);
  res.render('notApproved', { layout: 'userLayout', name: userName })
})


module.exports = router;
