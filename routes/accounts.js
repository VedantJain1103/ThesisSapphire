const express = require('express');
require('dotenv').config()

const router = express.Router();

const jwt = require('jsonwebtoken');

const accountsServices = require('../services/accountsServices');
const jwtServices = require('../services/jwtServices');
const { encrypt, decrypt } = require('../services/encryptionServices');
const { NetworkFirewall } = require('aws-sdk');

//-----------------------REGISTER----------------------------------------
router.get('/register', (req, res) => {
    let { msg, failStatus, successStatus } = req.query;
    let extraData = {
        // fullName: fullName,
        // email: email,
        // phone: phone,
        alert: msg,
        failAlert: failStatus,
        successAlert: successStatus,
    }
    res.render('accounts/register', extraData);
});

router.post('/register', async (req, res) => {
    const { fullName, email, phone, password, confirmPassword } = req.body;
    let { msg, failStatus, successStatus } = req.query;
    if (password == null || (password != confirmPassword)) {
        let error = "Passwords do not match";
        let extraData = {
            fullName: fullName,
            email: email,
            phone: phone,
            alert: msg,
            failAlert: error,
            successAlert: successStatus,
        }
        res.render('accounts/register', extraData);
    }
    else {
        let strongPasswordReq = new RegExp('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})');
        // atleast one lower case char
        // atleast one upper case char
        // atleast one digit
        // atleast one special char
        // atleast of length 8
        if (strongPasswordReq.test(password)) {
            let result = await accountsServices.createUser(fullName, email, phone, password);
            if (result.status == "Fail") {
                let error = result.error;
                let extraData = {
                    fullName: fullName,
                    email: email,
                    phone: phone,
                    alert: msg,
                    failAlert: error,
                    successAlert: successStatus,
                }
                res.render('accounts/register', extraData);
            }
            else {
                res.redirect('/accounts/sendVerification?successStatus=Registration Successfull');
            }
        } else {
            let error = "Enter a valid password.";
            let extraData = {
                fullName: fullName,
                email: email,
                phone: phone,
                alert: msg,
                failAlert: error,
                successAlert: successStatus,
            }
            res.render('accounts/register', extraData);
        }
    }
});

//-----------------------VERIFICATION---------------------------------------
router.get('/sendVerification', (req, res) => {
    let { msg, failStatus, successStatus } = req.query;
    let extraData = {
        alert: msg,
        failAlert: failStatus,
        successAlert: successStatus
    }
    res.render('accounts/sendVerificationCode', extraData);
})

router.post('/sendVerification', async (req, res) => {
    let { email } = req.body;
    let sendVerificationResult = await accountsServices.sendEmailVerification(email);
    if (sendVerificationResult.status == "Fail") res.render('accounts/sendVerificationCode', { error: sendVerificationResult.error });
    else res.redirect('/accounts/verification/' + email + '?successStatus=Verification Code Sent')
})

router.get('/verification', (req, res, next) => {
    let { msg, failStatus, successStatus } = req.query;
    let extraData = {
        alert: msg,
        failAlert: failStatus,
        successAlert: successStatus
    }
    res.render('accounts/verification', extraData);
})
router.get('/verification/:email', (req, res) => {
    let { email } = req.params;
    let { msg, failStatus, successStatus } = req.query;
    let extraData = {
        layout: 'layout',
        email: email,
        alert: msg,
        failAlert: failStatus,
        successAlert: successStatus
    }
    res.render('accounts/verification', extraData);
});

router.post('/verification', async (req, res) => {
    let { emailV, code } = req.body;
    code = Number(code);
    console.log(code);
    let verificationResult = await accountsServices.checkVerification(emailV, code);
    if (verificationResult.status == "Fail") {
        let error = verificationResult.error;
        res.redirect('/accounts/verification/' + emailV + '?failStatus=' + error);
    }
    else {
        res.redirect('/accounts/signIn/?successStatus=Verification Successful');
    }
});


//------------------------------SIGN IN------------------------------------------
router.get('/signIn', async (req, res) => {
    const cookies = req.cookies;
    let { msg, failStatus, successStatus } = req.query;
    let extraData = {
        alert: msg,
        failAlert: failStatus,
        successAlert: successStatus,
    }
    if (!cookies?.jwt_accessToken) {
        if (!cookies?.jwt_refreshToken) {
            res.render('accounts/signIn', extraData);
        }
        else {
            let refreshToken = cookies.jwt_refreshToken;
            let newAccessToken = await jwtServices.refreshAccessTokenByRefreshToken(refreshToken);
            if (newAccessToken) {
                res.cookie('jwt_accessToken', newAccessToken, { httpOnly: true, maxAge: 15 * 60 * 1000 });
                res.redirect('/users/');
            }
            else {
                res.render('accounts/signIn', extraData);
            }
        }
    } else {
        res.redirect('/users/?successStatus=Welcome');
    }
    // res.render('accounts/signIn', { title: 'Express', email: '' });
});

router.post('/signIn', async (req, res) => {
    const { email, password } = req.body;
    let result = await accountsServices.signIn(email, password);
    if (result.status == "Fail") {
        let error = result.error;
        if (error == "Email not verified") {
            let result = accountsServices.sendEmailVerification(email);
            if (result.status == "Success") {
                res.redirect('/accounts/verification?successStatus=Verification Code sent to the email');
            }
            else {
                res.redirect('/accounts/signIn?failStatus=' + error);
            }
        }
        else {
            res.redirect('/accounts/signIn?failStatus=' + error);
        }
    }
    else {
        const { user, refreshToken, accessToken } = result;
        console.log("signing in: ", user, "\nRefresh Token:", refreshToken, "\nAccess Token:", accessToken);
        res.cookie('jwt_refreshToken', refreshToken, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
        res.cookie('jwt_accessToken', accessToken, { httpOnly: true, maxAge: 15 * 60 * 1000 });
        // res.header('Authorization', 'Authorization ' + accessToken);
        // req.header('authorization','Authorization ' + accessToken)
        // console.log(res);
        // console.log(res.headersSent);
        // req.userId = foundUser._id;
        res.redirect(`/users/?successStatus=Welcome`);

    }
});

// --------------------------SIGN-OUT--------------------------------------------
router.get('/signOut', (req, res) => {
    res.clearCookie("jwt_accessToken");
    res.clearCookie("jwt_refreshToken");
    res.redirect('/');
})



module.exports = router;