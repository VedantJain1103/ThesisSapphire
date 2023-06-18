const Sib = require("sib-api-v3-sdk");
require("dotenv").config();

const jwt = require("jsonwebtoken");

const accountsServices = require("../services/accountsServices");
const s3Services = require('../services/s3');
const mailServices = require("../services/mailServices");
const mailDataServices = require("../services/mailDataServices");

const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);

async function getThesisList() {
    let result = {
        status: "Fail",
        result: null,
        error: null
    }
    let thesisListResult = await fetch("https://ap-south-1.aws.data.mongodb-api.com/app/pr3003-migmt/endpoint/getApprovedThesisList?secret=vedant", {
        method: "GET",
    }
    ).then(function (response) {
        return response.json();
    }).then(function (data) {
        // console.log('Request succeeded with JSON response', data);
        return data;
    }).catch(function (error) {
        console.log('Request failed', error);
        result.error = error;
    });
    return thesisListResult;
}

async function getThesisToBeApprovedList() {
    let result = {
        status: "Fail",
        result: null,
        error: null
    }
    let thesisListResult = await fetch("https://ap-south-1.aws.data.mongodb-api.com/app/pr3003-migmt/endpoint/getThesisToBeApprovedByDirector?secret=vedant", {
        method: "GET",
    }
    ).then(function (response) {
        return response.json();
    }).then(function (data) {
        // console.log('Request succeeded with JSON response', data);
        return data;
    }).catch(function (error) {
        console.log('Request failed', error);
        result.error = error;
    });
    if (result.error) return result;
    if (thesisListResult.status == "Fail") {
        result.error = thesisListResult.error;
        return result;
    }
    result.status = "Success";
    result.result = thesisListResult.result;
    return result;
}

async function getThesisById(thesisId) {
    let result = {
        status: "Fail",
        result: null,
        error: null
    }
    if (!thesisId) {
        result.error = "Thesis Id not provided";
        return result;
    }
    let thesisResult = await fetch("https://ap-south-1.aws.data.mongodb-api.com/app/pr3003-migmt/endpoint/getThesisById?secret=vedant&thesisId=" + thesisId, {
        method: "GET",
    }
    ).then(function (response) {
        return response.json();
    }).then(function (data) {
        // console.log('Request succeeded with JSON response', data);
        return data;
    }).catch(function (error) {
        console.log('Request failed', error);
        result.error = error;
    });
    if (result.error) return result;
    if (thesisResult.status == "Fail") {
        result.error = thesisResult.error;
        return result;
    }
    result.status = "Success";
    console.log("Thesis: ", thesisResult);
    result.result = thesisResult.result[0];
    return result;
}

async function approveThesis(directorName, thesisId, thesisName, scholarEmail, mentorEmail, mentorName, remails) {
    let result = {
        status: "Fail",
        result: null,
        error: null
    }
    if (!thesisId) {
        result.error = "Thesis Id not provided";
        return result;
    }
    let thesisReqBody = {
        thesisId: thesisId,
        remails: remails
    }
    const updation = await fetch("https://ap-south-1.aws.data.mongodb-api.com/app/pr3003-migmt/endpoint/forwardThesisToReviewers?secret=vedant", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify(thesisReqBody)
    }
    ).then(function (response) {
        return response.json();
    }).then(function (data) {
        // console.log('Request succeeded with JSON response', data);
        console.log(data);
        return data;
    }).catch(function (error) {
        console.log('Request failed', error);
    });
    if (updation.status == "Fail") return updation;
    else result.status = "Success";
    result.result = updation.result;

    let invitationContent = mailDataServices.invitationContent(directorName, thesisName, mentorName);
    for (let email of remails) {
        mailServices.sendMail(email, invitationContent, "Invited for thesis review");
    }
    let content = mailDataServices.thesisApprovalByDirector(directorName, thesisName);
    mailServices.sendMail(scholarEmail, content, "Thesis Forwarded");
    mailServices.sendMail(mentorEmail, content, "Thesis Forwarded");
    return result;
}

module.exports = {
    getThesisById,
    getThesisList,
    getThesisToBeApprovedList,
    approveThesis
}