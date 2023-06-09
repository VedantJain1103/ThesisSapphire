const bcrypt = require("bcrypt");
const Sib = require("sib-api-v3-sdk");
require("dotenv").config();

let jwtServices = require('../services/jwtServices');
let mailServices = require("../services/mailServices");
let mailDataServices = require("../services/mailDataServices");

const fs = require("fs");
const util = require("util");
const { CloudWatchLogs } = require("aws-sdk");

/*-------------------Functions----------------------*/
async function getUserByEmail(email) {
    let user = await fetch(
        "https://ap-south-1.aws.data.mongodb-api.com/app/pr3003-migmt/endpoint/getUserByEmail?secret=vedant&userEmail=" +
        email,
        {
            method: "GET",
        }
    )
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            // console.log('Request succeeded with JSON response', data);

            return data;
        })
        .catch(function (error) {
            console.log("Request failed", error);
            return { status: "Fail", error: error };
        });
    return user;
}

async function getUserById(id) {
    let user = await fetch(
        "https://ap-south-1.aws.data.mongodb-api.com/app/pr3003-migmt/endpoint/getUserById?secret=vedant&userId=" +
        id,
        {
            method: "GET",
        }
    )
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            // console.log('Request succeeded with JSON response', data);
            return data;
        })
        .catch(function (error) {
            console.log("Request failed", error);
            return { status: "Fail", error: error };
        });
    return user;
}

async function getUserProfileById(id) {
    let user = await fetch(
        "https://ap-south-1.aws.data.mongodb-api.com/app/pr3003-migmt/endpoint/getUserProfileById?secret=vedant&userId=" +
        id,
        {
            method: "GET",
        }
    )
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            // console.log('Request succeeded with JSON response', data);
            return data;
        })
        .catch(function (error) {
            console.log("Request failed", error);
            return { status: "Fail", error: error };
        });
    return user;
}


async function createUser(fullName, email, phone, password) {
    try {
        let hashedPass;
        bcrypt.genSalt(10, function (saltError, salt) {
            if (saltError) {
                throw new Error(saltError);
            } else {
                bcrypt.hash(password, salt, async function (hashError, hashPass) {
                    if (hashError) {
                        throw new Error(hashError);
                    }
                    hashedPass = hashPass;
                    const reqBody = {
                        fullName: fullName,
                        email: email,
                        password: hashedPass,
                        phone: phone,
                    };
                    // console.log(reqBody)
                    await fetch(
                        "https://ap-south-1.aws.data.mongodb-api.com/app/pr3003-migmt/endpoint/createUser?secret=vedant",
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify(reqBody),
                        }
                    )
                        .then(function (response) {
                            return response.json();
                        })
                        .then(function (data) {
                            console.log("Request succeeded with JSON response", data);
                            if (data.status == "Fail") {
                                throw new Error(data.error);
                            } else if (data.status == "Success") {
                                console.log("User created: ", data.result);
                            } else {
                                throw new Error("An unknown error occurred!");
                            }
                        })
                        .catch(function (error) {
                            console.log("Request failed", error);
                            throw new Error(error);
                        });

                });
            }
        });
        return { status: "Success" }
    } catch (err) {
        let result = {
            status: "Fail",
            error: err
        };
        return result;
    }
}

function generateVerificationCode() {
    const max = 999999;
    const min = 100000;
    let code = Math.floor(Math.random() * (max - min + 1)) + min;
    return code;
}

function sendEmailVerification(email) {
    let code = generateVerificationCode();
    const reqBody = {
        userEmail: email,
        code: code,
    };
    let content = mailDataServices.verificationMailContent(code);
    mailServices.sendMail(email, content, "Verification Code");
    console.log(email, code);
    fetch(
        "https://ap-south-1.aws.data.mongodb-api.com/app/pr3003-migmt/endpoint/createVerification?secret=vedant",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: JSON.stringify(reqBody),
        }
    )
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            console.log("Verification created: ", data);
            return  data;
        })
        .catch(function (error) {
            console.log("Request failed", error);
            return { status: "Fail", error: error };
        });
}

async function checkVerification(email, code) {
    try {
        //Checking user
        let findUser = await getUserByEmail(email);
        console.log("User found: ", findUser);
        if (findUser.status == "Fail") {
            return {
                status: "Fail",
                error: findUser.error
            };
        }
        const user = findUser.result;
        const userId = user._id;

        //Fetching verification
        let findVerification;
        await fetch(
            "https://ap-south-1.aws.data.mongodb-api.com/app/pr3003-migmt/endpoint/getVerificationByUserId?secret=vedant&userId=" +
            userId,
            {
                method: "GET",
            }
        )
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                // console.log('Request succeeded with JSON response', data);
                console.log("verification founded: ", data);
                findVerification = data;
            })
            .catch(function (error) {
                console.log("Request failed", error);
                throw new Error(error);
            });
        if (findVerification.status == "Fail") {
            throw new Error(findVerification.error);
        }
        const verification = findVerification.result;
        if (verification) {
            const currDate = Date.now();
            if (currDate - verification.createdAt > 600000) {
                let sendverificationError = sendEmailVerification(email);
                if (sendverificationError)
                    throw new Error(sendverificationError);
                else {
                    let sendverificationError = sendEmailVerification(email);
                    if (sendverificationError)
                        throw new Error(sendverificationError);

                    return {
                        status: "Fail",
                        error: "We have sent a new verification code"
                    }
                }
            } else if (verification.code == code) {
                //updating user's verification status
                const userReqBody = {
                    userEmail: email,
                };
                fetch(
                    "https://ap-south-1.aws.data.mongodb-api.com/app/pr3003-migmt/endpoint/updateUserVerificationByUserEmail?secret=vedant",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            // 'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        body: JSON.stringify(userReqBody),
                    }
                )
                    .then(function (response) {
                        return response.json();
                    })
                    .then(function (data) {
                        console.log("Updation of user: ", data);
                    })
                    .catch(function (error) {
                        console.log("Request failed", error);
                        throw new Error(error);
                    });

                //updating verification's status to SUCCESS
                const verificationReqBody = {
                    verificationId: verification._id,
                    status: "Successs",
                };
                const result = fetch(
                    "https://ap-south-1.aws.data.mongodb-api.com/app/pr3003-migmt/endpoint/updateVerificationsStatusById?secret=vedant",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            // 'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        body: JSON.stringify(verificationReqBody),
                    }
                )
                    .then(function (response) {
                        return response.json();
                    })
                    .then(function (data) {
                        console.log("updation of  verification", data);
                        return {
                            status: "Success",
                            result: "Verified"
                        };
                    })
                    .catch(function (error) {
                        console.log("Request failed", error);
                        throw new Error(error);
                    });
                return result;
            } else {
                //updating verification's status to FAILED
                const verificationReqBody = {
                    verificationId: verification._id,
                    status: "Failed",
                };
                fetch(
                    "https://ap-south-1.aws.data.mongodb-api.com/app/pr3003-migmt/endpoint/updateUserVerificationByUserEmail?secret=vedant",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            // 'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        body: JSON.stringify(verificationReqBody),
                    }
                )
                    .then(function (response) {
                        return response.json();
                    })
                    .then(function (data) {
                        let sendverificationError = sendEmailVerification(email);
                        if (sendverificationError)
                            throw new Error(sendverificationError);

                        return {
                            status: "Fail",
                            error: "We have sent a new verification code"
                        }
                    })
                    .catch(function (error) {
                        console.log("Request failed", error);
                        throw new Error(error);
                    });
                throw new Error("Incorrect Code");
            }
        } else {
            let sendverificationError = sendEmailVerification(email);
            if (sendverificationError)
                throw new Error(sendverificationError);

            return {
                status: "Fail",
                error: "We have sent a new verification code"
            }
            // sendEmailVerification(email, function (error) {
            //     if (error) return callback(error);
            //     else {
            //         return callback("We have sent a verification Code");
            //     }
            // });
        }
    } catch (err) {
        return {
            status: "Fail",
            error: err
        }
    }

}

async function signIn(email, password, callback) {
    const errResult = {
        status: "Fail",
        error: null
    }
    const findUser = await getUserByEmail(email);
    console.log("User found - ", findUser);
    if (findUser.status == "Fail") {
        errResult.error = findUser.error;
        return callback(errResult);
    }

    // console.log("User Found: ", findUser);
    const user = findUser.result;
    if (!user.isEmailVerified) {
        return callback({ user, _, _ });
    }

    // const accessToken = await jwtServices.createAccessToken(user);
    //matching password
    let passMatch;
    bcrypt.compare(password, user.password,async function (error, isMatch) {
        if (error) {
            errResult.error = error;
            return callback(errResult);
        } else if (!isMatch) {
            errResult.error = "Wrong Password";
            return callback(errResult);
        } else {
            passMatch = true;
            //creating tokens
            // console.log(user);
            const userProfile = await getUserProfileById(user._id);
            console.log("UserProfile-", userProfile.result);
            const accessToken = await jwtServices.createAccessToken(user,userProfile.result);
            const refreshToken = await jwtServices.createRefreshToken(user, userProfile.result);

            // const { status, accessToken, refreshToken } = await jwtServices.createTokens(user);

            //Adding refresh Token in database
            const refreshTokenBody = {
                userId: user._id,
                refreshToken: refreshToken,
            };
            const updation = await fetch(
                "https://ap-south-1.aws.data.mongodb-api.com/app/pr3003-migmt/endpoint/createUserRefreshToken?secret=vedant",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        // 'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: JSON.stringify(refreshTokenBody),
                }
            ).then(function (response) {
                return response.json();
            })
                .then(function (data) {
                    return data;
                })
                .catch(function (error) {
                    console.log("Request failed", error);
                    errResult.error = error;
                    return callback(errResult);
                });
            if (!updation) {
                errResult.error = "Unable to add tokens";
                return callback(errResult);
            }
            const result = {
                status: "Success",
                user: user,
                refreshToken: refreshToken,
                accessToken: accessToken
            }
            // console.log("Result: ",result)
            return callback(result);
        }
    });
}

async function updateUserProfileStatus(userId, status) {
    let profileStatusReqBody = {
        userId: userId,
        status: status
    };
    let updation = await fetch("https://ap-south-1.aws.data.mongodb-api.com/app/pr3003-migmt/endpoint/updateUserProfileStatusByUserId?secret=vedant", {
        method: "POST",
        headers: {
            "Content-Type":"application/json",
        },
        body: JSON.stringify(profileStatusReqBody)
    }).then(function (response) {
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
    return updation;
}

async function completeUserProfile(userId, name, email, institute, department, role, rollNo, dateOfJoining, pfId) {
    const userResult = await getUserByEmail(email);
    let result = {
        status: "Fail",
        error: null
    }
    if (userResult.status=="Fail") {
        result.error = userResult.error;
        return result;
    }
    const user = userResult.result;
    if (userId != user._id||name!==user.name||email!==user.email) {
        result.error = "Incorrect data";
        return result;
    }
    if (role == "Scholar") {
        let reqBody = {
            userId: userId,
            institute: institute,
            rollNo: rollNo,
            department: department,
            dateOfJoining: dateOfJoining,
        }
        const updation = await fetch(
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
        if (updation.status == "Fail") {
            result.error = updation.error;
            return result;
        }
        else {
            result.status = "Success";
            let statusUpdation = await updateUserProfileStatus(userId, true);
            if (statusUpdation.status == "Fail") {
                result.status = "Fail";
                result.error = statusUpdation.error;
            }
            return result;
        }
    }
    else if (role == "Reviewer") {
        let reqBody = {
            userId: userId,
            institute: institute,
            department: department,
            pfId: pfId
        }
        const updation = await fetch(
            "https://ap-south-1.aws.data.mongodb-api.com/app/pr3003-migmt/endpoint/createReviewerProfile?secret=vedant",
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
        if (updation.status == "Fail") {
            result.error = updation.error;
            return result;
        }
        else {
            result.status = "Success";
            let statusUpdation = await updateUserProfileStatus(userId, true);
            if (statusUpdation.status == "Fail") {
                result.status = "Fail";
                result.error = statusUpdation.error;
            }
            return result;
        }
    }
    else{
        let reqBody = {
            userId: userId,
            role: role,
            institute: institute,
            department: department,
            pfId: pfId
        }
        const updation = await fetch(
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
        if (updation.status == "Fail") {
            result.error = updation.error;
            return result;
        }
        else {
            result.status = "Success";
            let statusUpdation = await updateUserProfileStatus(userId, true);
            if (statusUpdation.status == "Fail") {
                result.status = "Fail";
                result.error = statusUpdation.error;
            }
            return result;
        }
    }
}
module.exports = {
    // isAuthentic,
    // isApproved,
    getUserByEmail,
    getUserById,
    getUserProfileById,
    // getUserProfileByEmail,
    createUser,
    signIn,
    sendEmailVerification,
    checkVerification,
    completeUserProfile,
    updateUserProfileStatus
    // profileCompletion,
};
