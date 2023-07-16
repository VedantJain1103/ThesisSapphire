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

// async function getUnapprovedUsers() {
//     let result = {
//         status: "Fail",
//         result: null,
//         error: null
//     }
//     let usersResult = await fetch("https://ap-south-1.aws.data.mongodb-api.com/app/pr3003-migmt/endpoint/getUnapprovedUsers?secret=vedant", {
//         method: "GET",
//     }
//     ).then(function (response) {
//         return response.json();
//     }).then(function (data) {
//         // console.log('Request succeeded with JSON response', data);
//         return data;
//     }).catch(function (error) {
//         console.log('Request failed', error);
//         result.error = error;
//     });
//     if (result.error) return result;
//     if (usersResult.status == "Fail") {
//         result.error = usersResult.error;
//         return result;
//     }
//     let unapprovedUsers = usersResult.result;

//     let unapprovedFaculty = [];
//     let unapprovedScholars = [];
//     unapprovedUsers.forEach(function (user) {
//         if (user.role == "Scholar") {
//             unapprovedScholars.push(user);
//         }
//         else {
//             unapprovedFaculty.push(user);
//         }
//     })

//     result.status = "Success";
//     result.result = {
//         unapprovedFaculty: unapprovedFaculty,
//         unapprovedScholars: unapprovedScholars,
//     };
//     return result;
// }

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

// async function approveUser(userId, userEmail) {
//     let result = {
//         status: "Fail",
//         result: null,
//         error: null
//     }
//     if (!userId || !userEmail) {
//         result.error = "User Id or Email not provided";
//         return result;
//     }
//     let userReqBody = {
//         userId: userId
//     }
//     const updation = await fetch("https://ap-south-1.aws.data.mongodb-api.com/app/pr3003-migmt/endpoint/approveUserByUserId?secret=vedant", {
//         method: "POST",
//         headers: {
//             'Content-Type': 'application/json'
//             // 'Content-Type': 'application/x-www-form-urlencoded',
//         },
//         body: JSON.stringify(userReqBody)
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

//     let content = mailDataServices.userApproved();
//     mailServices.sendMail(userEmail, content, "Account Verified");
//     return result;
// }

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

async function createUserProfileScholar(name, email, institute, department, rollNo, dateOfJoining) {
    let result = {
        status: "Fail",
        error: null
    }
    if (!name || !email || !institute || !department || !rollNo || !dateOfJoining) {
        result.error = "Insufficient data provided.";
        return result;
    }
    let reqBody = {
        userName: name,
        userEmail: email,
        rollNo: rollNo,
        department: department,
        dateOfJoining: dateOfJoining,
        institute: institute
    }
    console.log("Sending data to Server:\nCreating Scholar Profile", reqBody);
    const creation = await fetch(
        "https://ap-south-1.aws.data.mongodb-api.com/app/pr3003-migmt/endpoint/createScholarProfile?secret=vedant",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: JSON.stringify(reqBody),
        }
    ).then(function (response) {
        return response.json();
    })
        .then(function (data) {
            return data;
        })
        .catch(function (error) {
            console.log("Request failed", error);
            result.error = error;
            return result;
        });
    return creation;
}

async function createUserProfileFaculty(name, email, institute, department, pfId, role) {
    let result = {
        status: "Fail",
        error: null
    }
    if (!name || !email || !institute || !department || !pfId || !role) {
        result.error = "Insufficient data provided.";
        return result;
    }
    let reqBody = {
        userName: name,
        userEmail: email,
        role: role,
        institute: institute,
        department: department,
        pfId: pfId
    }
    console.log("Sending data to Server:\nCreating Faculty Profile", reqBody);
    const creation = await fetch(
        "https://ap-south-1.aws.data.mongodb-api.com/app/pr3003-migmt/endpoint/createMentorProfile?secret=vedant",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: JSON.stringify(reqBody),
        }
    ).then(function (response) {
        return response.json();
    })
        .then(function (data) {
            return data;
        })
        .catch(function (error) {
            console.log("Request failed", error);
            result.error = error;
            return result;
        });
    return creation;
}

async function getDepartments() {
    let departments = await fetch("https://ap-south-1.aws.data.mongodb-api.com/app/pr3003-migmt/endpoint/getDepartments?secret=vedant", {
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
    return departments;
}

async function createDepartment(userId, name) {
    let result = {
        status: "Fail",
        result: null,
        error: null
    }
    if (!name || !userId) {
        result.error = "Insufficient Data."
        return result;
    }
    let depReqBody = {
        department: name,
        userId: userId
    }
    const creation = await fetch(
        "https://ap-south-1.aws.data.mongodb-api.com/app/pr3003-migmt/endpoint/createDepartment?secret=vedant",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: JSON.stringify(depReqBody),
        }
    ).then(function (response) {
        return response.json();
    })
        .then(function (data) {
            return data;
        })
        .catch(function (error) {
            console.log("Request failed", error);
            result.error = error;
            return result;
        });
    return creation;
}

async function deleteDepartment(userId, departmentId) {
    let result = {
        status: "Fail",
        result: null,
        error: null
    }
    if (!departmentId || !userId) {
        result.error = "Insufficient Data."
        return result;
    }
    let depReqBody = {
        departmentId: departmentId,
        userId: userId
    }
    const deletion = await fetch(
        "https://ap-south-1.aws.data.mongodb-api.com/app/pr3003-migmt/endpoint/deleteDepartment?secret=vedant",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: JSON.stringify(depReqBody),
        }
    ).then(function (response) {
        return response.json();
    })
        .then(function (data) {
            return data;
        })
        .catch(function (error) {
            console.log("Request failed", error);
            result.error = error;
            return result;
        });
    return deletion;
}

async function getRoles() {
    let departments = await fetch("https://ap-south-1.aws.data.mongodb-api.com/app/pr3003-migmt/endpoint/getRoles?secret=vedant", {
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
    return departments;
}

async function createRole(userId, name) {
    let result = {
        status: "Fail",
        result: null,
        error: null
    }
    if (!name || !userId) {
        result.error = "Insufficient Data."
        return result;
    }
    let roleReqBody = {
        roleName: name,
        userId: userId
    }
    const creation = await fetch(
        "https://ap-south-1.aws.data.mongodb-api.com/app/pr3003-migmt/endpoint/createRole?secret=vedant",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: JSON.stringify(roleReqBody),
        }
    ).then(function (response) {
        return response.json();
    })
        .then(function (data) {
            return data;
        })
        .catch(function (error) {
            console.log("Request failed", error);
            result.error = error;
            return result;
        });
    return creation;
}

async function deleteRole(userId, roleId) {
    let result = {
        status: "Fail",
        result: null,
        error: null
    }
    if (!roleId || !userId) {
        result.error = "Insufficient Data."
        return result;
    }
    let roleReqBody = {
        roleId: roleId,
        userId: userId
    }
    const deletion = await fetch(
        "https://ap-south-1.aws.data.mongodb-api.com/app/pr3003-migmt/endpoint/deleteRole?secret=vedant",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: JSON.stringify(roleReqBody),
        }
    ).then(function (response) {
        return response.json();
    })
        .then(function (data) {
            return data;
        })
        .catch(function (error) {
            console.log("Request failed", error);
            result.error = error;
            return result;
        });
    return deletion;
}

module.exports = {
    //getting users
    // getUnapprovedUsers, ---- Not needed as per new changes
    getUser,
    getReviewer,
    // approveUser, ---- Not needed as per new changes
    getApprovedUsers,

    //creating profiles
    createUserProfileScholar,
    createUserProfileFaculty,

    getDepartments,
    createDepartment,
    deleteDepartment,

    getRoles,
    createRole,
    deleteRole
}