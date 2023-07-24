require("dotenv").config();

const accountsServices = require("../services/accountsServices");

async function getInvitationsList(userId) {
    let result = {
        status: "Fail",
        result: null,
        error: null
    }
    let invitationsResult = await fetch("https://ap-south-1.aws.data.mongodb-api.com/app/pr3003-migmt/endpoint/getAllInvitationsForUserId?secret=vedant&userId=" + userId, {
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
    if (invitationsResult.status == "Fail") {
        result.error = invitationsResult.error;
        return result;
    }
    result.status = "Success";
    result.result = invitationsResult.result;
    return result;
}

async function getCurrentInvitationsList(userId) {
    let result = {
        status: "Fail",
        result: null,
        error: null
    }
    let invitationsResult = await fetch("https://ap-south-1.aws.data.mongodb-api.com/app/pr3003-migmt/endpoint/getCurrentInvitationsListByUserId?secret=vedant&userId=" + userId, {
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
    if (invitationsResult.status == "Fail") {
        result.error = invitationsResult.error;
        return result;
    }
    result.status = "Success";
    result.result = invitationsResult.result;
    return result;
}

async function getInvitationDetailById(invitationId, userId) {
    let result = {
        status: "Fail",
        result: null,
        error: null
    }
    if (!invitationId || !userId) {
        result.error = "Insufficient Data";
        return result;
    }
    let invitationResult = await fetch("https://ap-south-1.aws.data.mongodb-api.com/app/pr3003-migmt/endpoint/getInvitationDetailById?secret=vedant&invitationId=" + invitationId
        + "&userId=" + userId, {
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
    if (invitationResult.status == "Fail") {
        result.error = invitationResult.error;
        return result;
    }
    result.status = "Success";
    console.log("Invitation: ", invitationResult);
    result.result = invitationResult.result[0];
    return result;
}

async function rejectInvitationById(invitationId, userId) {
    let result = {
        status: "Fail",
        result: null,
        error: null
    }
    if (!invitationId || !userId) {
        result.error = "Insufficient Data";
        return result;
    }
    let thesisReqBody = {
        invitationId: invitationId,
        userId: userId,
        status: "Rejected"
    }
    const updation = await fetch("https://ap-south-1.aws.data.mongodb-api.com/app/pr3003-migmt/endpoint/updateInvitationStatusById?secret=vedant", {
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
    return updation;
}

async function acceptInvitationById(invitationId, userId) {
    let result = {
        status: "Fail",
        result: null,
        error: null
    }
    if (!invitationId || !userId) {
        result.error = "Insufficient Data";
        return result;
    }
    let thesisReqBody = {
        invitationId: invitationId,
        userId: userId,
        status: "Accepted"
    }
    const user = await accountsServices.getUserById(userId);
    console.log(user);
    const updation = await fetch("https://ap-south-1.aws.data.mongodb-api.com/app/pr3003-migmt/endpoint/updateInvitationStatusById?secret=vedant", {
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
    return updation;
}

async function getAcceptedInvitationsListForUserId(userId) {
    let result = {
        status: "Fail",
        result: null,
        error: null
    }
    let invitationsResult = await fetch("https://ap-south-1.aws.data.mongodb-api.com/app/pr3003-migmt/endpoint/getAcceptedInvitationsListForUserId?secret=vedant&userId=" + userId, {
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
    if (invitationsResult.status == "Fail") {
        result.error = invitationsResult.error;
        return result;
    }
    result.status = "Success";
    result.result = invitationsResult.result;
    return result;
}

async function getThesisForReviewer(thesisId, reviewerId) {
    let result = {
        status: "Fail",
        result: null,
        error: null
    }
    if (!thesisId || !reviewerId) {
        result.error = "Insufficient Data";
        return result;
    }
    let thesisResult = await fetch("https://ap-south-1.aws.data.mongodb-api.com/app/pr3003-migmt/endpoint/getThesisDataForReviewer?secret=vedant&thesisId=" + thesisId + "&reviewerId=" + reviewerId, {
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
    return thesisResult;

}

async function postComment(thesisId, reviewerId, description, access) {
    let result = {
        status: "Fail",
        result: null,
        error: null
    }
    if (!thesisId || !reviewerId || !description || (access != "Private" && access != "Public")) {
        result.error = "Insufficient Data";
        return result;
    }
    let commentDataReqBody = {
        thesisId: thesisId,
        reviewerId: reviewerId,
        description: description,
        access: access
    }
    let postComment = await fetch("https://ap-south-1.aws.data.mongodb-api.com/app/pr3003-migmt/endpoint/createThesisComment?secret=vedant", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify(commentDataReqBody)
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
    return postComment;
}
module.exports = {
    getInvitationDetailById,
    getInvitationsList,
    getCurrentInvitationsList,
    getAcceptedInvitationsListForUserId,
    rejectInvitationById,
    acceptInvitationById,
    getThesisForReviewer,
    postComment
}