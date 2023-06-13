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

//Get List of Thesis of a particular department
async function getThesisListByDepartment(department) {
    let result = {
        status: "Fail",
        result: null,
        error: null
    }
    if (!department) {
        result.error = "Department name not provided";
        return result;
    }
    let thesisListResult = await fetch("https://ap-south-1.aws.data.mongodb-api.com/app/pr3003-migmt/endpoint/getHODApprovedThesisListByDepartment?secret=vedant&department=" + department, {
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

//Get List of Thesis to be approved by HOD
async function getThesisToBeApprovedListByHOD(hodId) {
    let result = {
        status: "Fail",
        result: null,
        error: null
    }
    if (!hodId) {
        result.error = "Mentor Id not provided";
        return result;
    }
    let thesisListResult = await fetch("https://ap-south-1.aws.data.mongodb-api.com/app/pr3003-migmt/endpoint/getThesisToBeApprovedByHODListByHODId?secret=vedant&userId=" + hodId, {
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

//Get thesis submitted by the mentor
async function getThesisListByMentorId(mentorId) {
    let result = {
        status: "Fail",
        result: null,
        error: null
    }
    if (!mentorId) {
        result.error = "Mentor Id not provided";
        return result;
    }
    let thesisListResult = await fetch("https://ap-south-1.aws.data.mongodb-api.com/app/pr3003-migmt/endpoint/getThesisListByMentorId?secret=vedant&userId=" + mentorId, {
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

//Get Thesis data by thesis Id
async function getThesisById(thesisId) {
    let result = {
        status: "Fail",
        result: null,
        error: null
    }
    if (!thesisId) {
        result.error = "Mentor Id not provided";
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
    result.result = thesisResult.result[0];
    console.log(result.result);
    return result;
}

//Upload Thesis / Forward to HOD
async function uploadThesis(mentorId, scholarEmail, description, thesisName, thesis) {
    let result = {
        status: "Success",
        result: null
    }
    let errResult = {
        status: "Fail",
        error: null
    }
    let mentor = await accountsServices.getUserById(mentorId);
    console.log("mentor", mentor);
    if (!mentor) {
        errResult.error = "Mentor not found";
        return errResult;
    }

    let scholarResult = await accountsServices.getUserByEmail(scholarEmail);
    if (!scholarResult || scholarResult.status == "Fail") {
        errResult.error = "Scholar not found";
        return errResult;
    }
    let scholar = scholarResult.result;

    //pushing thesis into database
    let pushResult = await s3Services.uploadFile(thesis);
    await unlinkFile(thesis.path)
    const thesisReqBody = {
        mentorId: mentor._id,
        thesisName: thesisName,
        thesisLink: `/users/thesis/${pushResult.Key}`,
        scholarId: scholar._id
    };

    //adding in mongoDB
    await fetch("https://ap-south-1.aws.data.mongodb-api.com/app/pr3003-migmt/endpoint/createThesis?secret=vedant", {
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
        console.log("Thesis created Result: ", data);
        result.result = data;
    }).catch(function (error) {
        console.log('Request failed', error);
        return callback(error);
    });

    // Sending Mail
    let content = mailDataServices.thesisSubmissionContent(mentor.name, thesisName);
    let mentorContent = mailDataServices.thesisSubmissionByMentor(scholar.name, thesis);
    mailServices.sendMail(mentor.email, mentorContent, "Thesis Submitted!");
    mailServices.sendMail(scholar.email, content, "Thesis Submitted!");
    return result;
}

//Forward to Dean From HOD
// async function forwardToDean(hodName, thesisId, thesisName, scholarEmail, mentorEmail) {
//     let result = {
//         status: "Fail",
//         result: null,
//         error: null
//     }
//     if (!thesisId) {
//         result.error = "Thesis Id not provided";
//         return result;
//     }
//     let thesisReqBody = {
//         thesisId: thesisId,
//         status: "Forwarded to Dean"
//     }
//     const updation = await fetch("https://ap-south-1.aws.data.mongodb-api.com/app/pr3003-migmt/endpoint/updateThesisStatus?secret=vedant", {
//         method: "POST",
//         headers: {
//             'Content-Type': 'application/json'
//             // 'Content-Type': 'application/x-www-form-urlencoded',
//         },
//         body: JSON.stringify(thesisReqBody)
//     }
//     ).then(function (response) {
//         return response.json();
//     }).then(function (data) {
//         // console.log('Request succeeded with JSON response', data);
//         console.log(data);
//         return data;
//     }).catch(function (error) {
//         console.log('Request failed', error);
//     });
//     if (updation.status == "Fail") return updation;
//     else result.status = "Success";
//     result.result = updation.result;

//     let content = mailDataServices.thesisApprovalByHOD(hodName, thesisName);
//     mailServices.sendMail(scholarEmail, content, "Thesis Forwarded");
//     mailServices.sendMail(mentorEmail, content, "Thesis Forwarded");
//     return result;
// }

//Forward to Director
// async function forwardToDirector(hodName, thesisId, thesisName, scholarEmail, mentorEmail) {
//     let result = {
//         status: "Fail",
//         result: null,
//         error: null
//     }
//     if (!thesisId) {
//         result.error = "Thesis Id not provided";
//         return result;
//     }
//     let thesisReqBody = {
//         thesisId: thesisId,
//         status: "Forwarded to Dean"
//     }
//     const updation = await fetch("https://ap-south-1.aws.data.mongodb-api.com/app/pr3003-migmt/endpoint/updateThesisStatus?secret=vedant", {
//         method: "POST",
//         headers: {
//             'Content-Type': 'application/json'
//             // 'Content-Type': 'application/x-www-form-urlencoded',
//         },
//         body: JSON.stringify(thesisReqBody)
//     }
//     ).then(function (response) {
//         return response.json();
//     }).then(function (data) {
//         // console.log('Request succeeded with JSON response', data);
//         console.log(data);
//         return data;
//     }).catch(function (error) {
//         console.log('Request failed', error);
//     });
//     if (updation.status == "Fail") return updation;
//     else result.status = "Success";
//     result.result = updation.result;

//     let content = mailDataServices.thesisApprovalByHOD(hodName, thesisName);
//     mailServices.sendMail(scholarEmail, content, "Thesis Forwarded");
//     mailServices.sendMail(mentorEmail, content, "Thesis Forwarded");
//     return result;
// }

//Rejection fron HOD
async function rejectThesis(rejectedBy, thesisId, thesisName, scholarEmail, mentorEmail, rejectionReason) {
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
        status: "Rejected",
        rejectionReason: rejectionReason,
        rejectedBy: rejectedBy
    }
    const updation = await fetch("https://ap-south-1.aws.data.mongodb-api.com/app/pr3003-migmt/endpoint/updateThesisStatus?secret=vedant", {
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
        console.log("Rejection thesis result: ", data);
        return data;
    }).catch(function (error) {
        console.log('Request failed', error);
    });
    if (updation.status == "Fail") return updation;
    else result.status = "Success";
    result.result = updation.result;

    let content = mailDataServices.thesisRejectedByHOD(rejectedBy, thesisName);
    mailServices.sendMail(scholarEmail, content, "Thesis Rejected");
    mailServices.sendMail(mentorEmail, content, "Thesis Rejected");
    return result;
}

module.exports = {
    uploadThesis,
    getThesisById,
    getThesisListByDepartment,
    getThesisListByMentorId,
    getThesisToBeApprovedListByHOD,
    // forwardToDirector, To be made
    // forwardToDean,
    rejectThesis,
}