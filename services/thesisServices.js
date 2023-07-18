const Sib = require("sib-api-v3-sdk");
require("dotenv").config();

const jwt = require("jsonwebtoken");

const accountsServices = require("../services/accountsServices");
const regexServices = require('../services/regexServices');
const s3Services = require('../services/s3');
const s3UploadServices = require('../services/s3UploadServices');
const mailServices = require("../services/mailServices");
const mailDataServices = require("../services/mailDataServices");

const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);

function createThesisFileName(fileOriginalName, userId) {
    const today = new Date();
    const yyyy = today.getFullYear();
    let mm = today.getMonth() + 1; // Months start at 0!
    let dd = today.getDate();

    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;

    const formattedToday = dd + '' + mm + '' + yyyy;
    const fileName = formattedToday + '-' + userId + '-' + fileOriginalName;
    return fileName;
}

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

//Get thesisList of a scholar
async function getThesisListByScholarId(scholarId) {
    let result = {
        status: "Fail",
        result: null,
        error: null
    }
    if (!scholarId) {
        result.error = "Scholar Id not provided";
        return result;
    }
    let thesisListResult = await fetch("https://ap-south-1.aws.data.mongodb-api.com/app/pr3003-migmt/endpoint/getThesisListByScholarId?secret=vedant&userId=" + scholarId, {
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
async function getThesisById(thesisId, userId) {
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
        console.log('Request succeeded with JSON response', data);
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
    let thesis = thesisResult.result.thesis[0];
    let thesisAccessIds = thesisResult.result.thesisAccessIds;

    const isReviewer = thesisAccessIds.some(element => {
        if (element.userId === userId) {
            return true;
        }

        return false;
    });
    console.log("Is user reviewer of thesis:", isReviewer)
    let isScholar = false;
    if (userId == thesis.scholarId) isScholar = true;
    console.log("Is scholar of this thesis", isScholar);
    let indianRev = thesisResult.result.thesisSuggestedIndianReviewers;
    let foreignRev = thesisResult.result.thesisSuggestedForeignReviewers;
    result.result = {
        thesis: thesis,
        invitations: thesisResult.result.invitations,
        indianRev: indianRev,
        foreignRev: foreignRev,
        isScholar: isScholar,
        isReviewer: isReviewer
    }
    console.log(result);
    return result;
}

async function getThesisStatus(thesisId, userId) {
    let result = {
        status: "Fail",
        result: null,
        error: null
    }
    if (!thesisId || !userId) {
        result.error = "Insuficient data";
        return result;
    }

    let thesisStatus = await fetch("https://ap-south-1.aws.data.mongodb-api.com/app/pr3003-migmt/endpoint/getThesisStatus?secret=vedant&thesisId=" + thesisId + "&userId=" + userId, {
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
        return result;
    });
    return thesisStatus;
}
//Upload Thesis / Forward to HOD
async function uploadThesis(mentorId, scholarEmail, thesisName, files) {
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
    console.log("scholar", scholar);

    //pushing thesis into database
    if (files.length != 3) {
        result.error = "Files not chosen";
        return error;
    }
    let thesis, synopsis, plagiarism;
    for (let i = 0; i < files.length; ++i) {
        if (files[i].fieldname == "synopsis") {
            synopsis = files[i];
        }
        else if (files[i].fieldname == "plagiarism") {
            plagiarism = files[i];
        }
        else if (files[i].fieldname == "thesis") {
            thesis = files[i];
        }
        else {
            result.error = "Incorrect files";
            return error;
        }
    }
    console.log("thesis:", thesis);
    console.log("synopsis:", synopsis);
    console.log("plag:", plagiarism);

    let thesisFileName = createThesisFileName(thesis.originalname, mentorId);
    let synopsisFileName = createThesisFileName(synopsis.originalname, mentorId);
    let plagFileName = createThesisFileName(plagiarism.originalname, mentorId);

    let pushThesis = await s3UploadServices.uploadFile(thesis, thesisFileName);
    let pushSynopsis = await s3UploadServices.uploadFile(synopsis, synopsisFileName);
    let pushPlagiarism = await s3UploadServices.uploadFile(plagiarism, plagFileName);
    console.log(pushThesis);
    console.log(pushSynopsis);
    console.log(pushPlagiarism);

    // let pushThesisResult = await s3Services.uploadFile(thesis);
    // await unlinkFile(thesis.path);
    // let pushSynopsisResult = await s3Services.uploadFile(synopsis);
    // await unlinkFile(synopsis.path);
    // let pushPlagiarismResult = await s3Services.uploadFile(plagiarism);
    // await unlinkFile(plagiarism.path);
    let thesisReqBody = {
        mentorId: mentor._id,
        thesisName: thesisName,
        thesisLink: `/users/thesis/` + thesisFileName,
        synopsisLink: `/users/thesis/` + synopsisFileName,
        plagiarismLink: `/users/thesis/` + plagFileName,
        scholarId: scholar._id
    };

    let res = await fetch("https://ap-south-1.aws.data.mongodb-api.com/app/pr3003-migmt/endpoint/createThesis?secret=vedant", {
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
        return data;
    }).catch(function (error) {
        console.log('Request failed', error);
        result.error = error;
        return result;
    });
    return res;
}
//add reviewer to a thesis
async function addSuggestedReviewer(thesisId, reviewerName, reviewerEmail, reviewerOrg, reviewerDesig, reviewerType, userId) {
    let result = {
        status: "Fail",
        result: null,
        error: null
    };
    if (!thesisId || !reviewerName || !reviewerEmail || !reviewerOrg || !reviewerDesig || !reviewerType || !userId) {
        result.error = "Insufficient data";
        return result;
    }
    if (!regexServices.isValidEmail(reviewerEmail)) {
        result.error = "Incorrect email format";
        return result;
    }
    let reviewerReqBody = {
        thesisId: thesisId,
        reviewerName: reviewerName,
        reviewerEmail: reviewerEmail,
        reviewerOrg: reviewerOrg,
        reviewerDesig: reviewerDesig,
        reviewerType: reviewerType,
        userId: userId
    };
    console.log("sending: ", reviewerReqBody);
    let addReviewer = await fetch("https://ap-south-1.aws.data.mongodb-api.com/app/pr3003-migmt/endpoint/addReviewerToThesis?secret=vedant", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify(reviewerReqBody)
    }
    ).then(function (response) {
        return response.json();
    }).then(function (data) {
        // console.log('Request succeeded with JSON response', data);
        console.log("Reviewer added", data);
        return data;
    }).catch(function (error) {
        console.log('Request failed', error);
        result.error = error;
        return result;
    });

    return addReviewer;
}

async function getSuggestedReviewers(thesisId, userId) {
    let result = {
        status: "Fail",
        result: null,
        error: null
    }
    if (!thesisId || !userId) {
        result.error = "Insufficient Data";
        return result;
    }

    let reviewers = await fetch("https://ap-south-1.aws.data.mongodb-api.com/app/pr3003-migmt/endpoint/getSuggestedReviewersOfThesis?secret=vedant&thesisId=" + thesisId + "&userId=" + userId, {
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

    return reviewers;
}

async function removeSuggestedReviewer(reviewerId, userId) {
    let result = {
        status: "Fail",
        result: null,
        error: null
    };
    if (!reviewerId || !userId) {
        result.error = "Insufficient data";
        return result;
    }
    let reviewerReqBody = {
        reviewerId: reviewerId,
        userId: userId,
    };
    console.log("sending: ", reviewerReqBody);
    let removeReviewer = await fetch("https://ap-south-1.aws.data.mongodb-api.com/app/pr3003-migmt/endpoint/removeSuggestedReviewerFromThesis?secret=vedant", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify(reviewerReqBody)
    }
    ).then(function (response) {
        return response.json();
    }).then(function (data) {
        // console.log('Request succeeded with JSON response', data);
        console.log("Reviewer added", data);
        return data;
    }).catch(function (error) {
        console.log('Request failed', error);
        result.error = error;
        return result;
    });

    return removeReviewer;
}

async function submitThesis(thesisId, userId) {
    let result = {
        status: "Fail",
        result: null,
        error: null
    }
    if (!thesisId || !userId) {
        result.error = "Insufficient Data";
        return result;
    }

    let thesisReqBody = {
        thesisId: thesisId,
        userId: userId
    };
    console.log("sending: ", thesisReqBody);
    let submit = await fetch("https://ap-south-1.aws.data.mongodb-api.com/app/pr3003-migmt/endpoint/submitThesis?secret=vedant", {
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
        console.log("Thesis submission", data);
        return data;
    }).catch(function (error) {
        console.log('Request failed', error);
        result.error = error;
        return result;
    });

    let thesisData = await getThesisById(thesisId, userId);
    let thesis = thesisData.result.thesis;
    let mentorEmail = thesis.mentorEmail;
    let mentorName = thesis.mentorName;
    let scholarEmail = thesis.scholarEmail;
    let scholarName = thesis.scholarName;
    // Sending Mail
    let content = mailDataServices.thesisSubmissionContent(mentorName, thesis.name);
    let mentorContent = mailDataServices.thesisSubmissionByMentor(scholarName, thesis.name);
    mailServices.sendMail(mentorEmail, mentorContent, "Thesis Submitted!");
    mailServices.sendMail(scholarEmail, content, "Thesis Submitted!");

    return submit;

}

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
        rejectionReason: rejectionReason,
        rejectedBy: rejectedBy
    }
    const updation = await fetch("https://ap-south-1.aws.data.mongodb-api.com/app/pr3003-migmt/endpoint/rejectThesis?secret=vedant", {
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

    let content = mailDataServices.thesisRejected(rejectedBy, thesisName);
    mailServices.sendMail(scholarEmail, content, "Thesis Rejected");
    mailServices.sendMail(mentorEmail, content, "Thesis Rejected");
    return result;
}

async function getThesisInvitationStatusById(thesisId, userId) {
    let result = {
        status: "Fail",
        result: null,
        isOwner: false,
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
    const user = {
        userId: userId
    }
    let thesis = thesisResult.result.thesis[0];
    let thesisAccessIds = thesisResult.result.thesisAccessIds;

    const isOwner = thesisAccessIds.some(element => {
        if (element.userId === userId) {
            return true;
        }

        return false;
    });
    console.log("Is user owner of thesis:", isOwner)
    if (isOwner) {
        result.isOwner = true;
    }
    result.result = {
        thesis: thesis,
        invitatoins: thesisResult.result.invitations
    }
    console.log(result);
    return result;
}

module.exports = {
    createThesisFileName,
    uploadThesis,
    addSuggestedReviewer,
    getSuggestedReviewers,
    removeSuggestedReviewer,
    submitThesis,
    getThesisById,
    getThesisStatus,
    getThesisListByDepartment,
    getThesisListByMentorId,
    getThesisListByScholarId,
    getThesisToBeApprovedListByHOD,
    rejectThesis,
}