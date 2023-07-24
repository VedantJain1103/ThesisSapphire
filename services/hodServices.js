require("dotenv").config();

const mailServices = require("../services/mailServices");
const mailDataServices = require("../services/mailDataServices");

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

async function getThesisToBeApprovedListById(hodId) {
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

async function approveThesis(hodName, thesisId, thesisName, scholarEmail, mentorEmail) {
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
        status: "Forwarded to Dean"
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
        // console.log('Request succeeded with JSON response', data);
        console.log(data);
        return data;
    }).catch(function (error) {
        console.log('Request failed', error);
    });
    if (updation.status == "Fail") return updation;
    else result.status = "Success";
    result.result = updation.result;

    let content = mailDataServices.thesisApprovalByHOD(hodName, thesisName);
    mailServices.sendMail(scholarEmail, content, "Thesis Forwarded");
    mailServices.sendMail(mentorEmail, content, "Thesis Forwarded");
    return result;
}

module.exports = {
    getThesisById,
    getThesisListByDepartment,
    getThesisToBeApprovedListById,
    approveThesis
}