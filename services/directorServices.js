require("dotenv").config();

const mailServices = require("../services/mailServices");
const mailDataServices = require("../services/mailDataServices");

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

async function approveThesis(userId, directorName, thesisId, thesisName, scholarEmail, mentorEmail, mentorName, indianRev, foreignRev) {
    let result = {
        status: "Fail",
        result: null,
        error: null
    }
    if (!userId || !thesisId) {
        result.error = "Thesis Id not provided";
        return result;
    }
    let thesisReqBody = {
        userId: userId,
        thesisId: thesisId,
        indianRev: indianRev,
        foreignRev: foreignRev
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

    mailServices.sendMail(indianRev, invitationContent, "Invited for thesis review");
    mailServices.sendMail(foreignRev, invitationContent, "Invited for thesis review");

    let content = mailDataServices.thesisApprovalByDirector(directorName, thesisName);

    mailServices.sendMail(scholarEmail, content, "Thesis Forwarded");
    mailServices.sendMail(mentorEmail, content, "Thesis Forwarded");

    return result;
}

async function getUnapprovedUsers() {
    let result = {
        status: "Fail",
        result: null,
        error: null
    }
    let usersResult = await fetch("https://ap-south-1.aws.data.mongodb-api.com/app/pr3003-migmt/endpoint/getUnapprovedUsers?secret=vedant", {
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
    if (usersResult.status == "Fail") {
        result.error = usersResult.error;
        return result;
    }
    let unapprovedUsers = usersResult.result;

    let unapprovedFaculty = [];
    let unapprovedScholars = [];
    unapprovedUsers.forEach(function (user) {
        if (user.role == "Scholar") {
            unapprovedScholars.push(user);
        }
        else {
            unapprovedFaculty.push(user);
        }
    })

    result.status = "Success";
    result.result = {
        unapprovedFaculty: unapprovedFaculty,
        unapprovedScholars: unapprovedScholars,
    };
    return result;
}

async function getUser(userId) {
    let result = {
        status: "Fail",
        result: null,
        error: null
    }
    if (!userId) {
        result.error = "User Id not provided";
        return result;
    }
    let usersResult = await fetch("https://ap-south-1.aws.data.mongodb-api.com/app/pr3003-migmt/endpoint/getUserByUserId?secret=vedant&userId=" + userId, {
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
    if (usersResult.status == "Fail") {
        result.error = usersResult.error;
        return result;
    }
    result.status = "Success";
    result.result = usersResult.result[0];
    return result;
}

async function getReviewer(userId) {
    let result = {
        status: "Fail",
        result: null,
        error: null
    }
    if (!userId) {
        result.error = "User Id not provided";
        return result;
    }
    let usersResult = await fetch("https://ap-south-1.aws.data.mongodb-api.com/app/pr3003-migmt/endpoint/getReviewerByUserId?secret=vedant&userId=" + userId, {
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
    if (usersResult.status == "Fail") {
        result.error = usersResult.error;
        return result;
    }
    result.status = "Success";
    result.result = usersResult.result[0];
    return result;
}
async function approveUser(userId, userEmail) {
    let result = {
        status: "Fail",
        result: null,
        error: null
    }
    if (!userId || !userEmail) {
        result.error = "User Id or Email not provided";
        return result;
    }
    let userReqBody = {
        userId: userId
    }
    const updation = await fetch("https://ap-south-1.aws.data.mongodb-api.com/app/pr3003-migmt/endpoint/approveUserByUserId?secret=vedant", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify(userReqBody)
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

    let content = mailDataServices.userApproved();
    mailServices.sendMail(userEmail, content, "Account Verified");
    return result;
}

async function getApprovedUsers() {
    let result = {
        status: "Fail",
        result: null,
        error: null
    }
    let usersResult = await fetch("https://ap-south-1.aws.data.mongodb-api.com/app/pr3003-migmt/endpoint/getApprovedUsers?secret=vedant", {
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
    if (usersResult.status == "Fail") {
        result.error = usersResult.error;
        return result;
    }
    let approvedUsers = usersResult.result;

    let approvedFaculty = [];
    let approvedScholars = [];
    let approvedReviewers = [];
    approvedUsers.forEach(function (user) {
        if (user.role == "Scholar") {
            approvedScholars.push(user);
        }
        else if (user.role == "Reviewer") {
            approvedReviewers.push(user);
        }
        else {
            approvedFaculty.push(user);
        }
    })

    result.status = "Success";
    result.result = {
        approvedFaculty: approvedFaculty,
        approvedScholars: approvedScholars,
        approvedReviewers: approvedReviewers
    };
    return result;
}

module.exports = {
    getThesisById,
    getThesisList,
    getThesisToBeApprovedList,
    approveThesis,
    getUnapprovedUsers,
    getUser,
    getReviewer,
    approveUser,
    getApprovedUsers
}