const { MongoClient, ServerApiVersion } = require('mongodb');
const bcrypt = require('bcrypt');
const Sib = require('sib-api-v3-sdk')
require('dotenv').config()

// const uri = process.env.MONGODB_URI;
// const client = new MongoClient(uri);
// const database = client.db("LetUsFarm");

const jwt = require('jsonwebtoken');

const userImageS3 = require('../services/userImageS3');
const userCertificateS3 = require('../services/userCertificateS3');

const fs = require('fs');
const util = require('util');
const unlinkFile = util.promisify(fs.unlink);

async function getUserByRefreshToken(refreshToken) {
    try {
        if (!refreshToken) {
            throw new Error("RefreshToken cannot be null");
        }

        let user = await fetch("https://ap-south-1.aws.data.mongodb-api.com/app/pr3003-migmt/endpoint/getUserByRefreshToken?secret=vedant&refreshToken=" + refreshToken, {
            method: "GET",
        }).then(function (response) {
            return response.json();
        }).then(function (data) {
            // console.log('Request succeeded with JSON response', data);
            if (data) return data;
            else throw new Error("User Not Found");
        }).catch(function (error) {
            console.log('Request failed', error);
            throw new Error(error);
        });
        return user;
    } catch (err) {
        return null;
    }
}
async function getUserProfileById(userId) {
    let userProfile = await fetch("https://ap-south-1.aws.data.mongodb-api.com/app/pr3003-migmt/endpoint/getUserProfileById?secret=vedant&userId=" + userId, {
        method: "GET",
    }).then(function (response) {
        return response.json();
    }).then(function (data) {
        // console.log("UserProfile: ", data);
        if (data) return data;
        else return null;
    }).catch(function (error) {
        console.log('Request Failed', error);
        return null;
    });
    return userProfile;
}

async function createAccessToken(user, userProfile) {
    console.log("User:", user, "UserProfile:", userProfile);
    let role = null;
    if (user.isProfileComplete == true) {
        role = userProfile.role;
    }
    let userBody = {
        "userId": user._id,
        "userName": user.name,
        "userRole": role,
        "isApproved": user.isApproved
    };
    console.log("Cookie data - ", userBody);
    const accessToken = jwt.sign(
        userBody,
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '15m' }
    );
    return accessToken;
}

async function createRefreshToken(user, userProfile) {
    let role = null;
    if (user.isProfileComplete) {
        role = userProfile.role;
    }
    let userBody = {
        "userId": user._id,
        "userName": user.name,
        "userRole": role,
        "isApproved": user.isApproved
    };
    const refreshToken = jwt.sign(
        userBody,
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '1d' }
    );
    return refreshToken;
}

async function refreshAccessTokenByRefreshToken(refreshToken) {
    try {
        const findUser = await getUserByRefreshToken(refreshToken);
        if (findUser.status == "Fail") throw new Error(findUser.error);
        const user = findUser.result;
        const userProfileResult = await getUserProfileById(user._id);
        let userProfile;
        if (!userProfileResult) {
            userProfile = null;
        }
        else if (userProfileResult.status == "Fail") {
            userProfile = null;
        }
        else if (userProfileResult.status == "Success") {
            userProfile = userProfileResult.result;
        }
        const newAccesToken = createAccessToken(user, userProfile);
        if (!newAccesToken) throw new Error("Unable to create Access Token");

        return newAccesToken;
    } catch (err) {
        return null;
    }
}

async function createTokens(user) {
    try {
        const newAccessToken = await createAccessToken(user);
        const newRefreshToken = await createRefreshToken(user);

        const userId = user._id;

        const refreshTokenReqBody = {
            userId: userId,
            refreshToken: newRefreshToken
        };

        let result = {
            status: "Fail",
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        }
        await fetch(
            "https://ap-south-1.aws.data.mongodb-api.com/app/pr3003-migmt/endpoint/createUserRefreshToken?secret=vedant",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    // 'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: JSON.stringify(refreshTokenReqBody),
            }
        ).then(function (response) {
            return response.json();
        })
            .then(function (data) {
                result.status = "Success";
            })
            .catch(function (error) {
                console.log("Request failed", error);
                throw new Error(error);
            });
        return result;
    } catch (err) {
        throw new Error(err);
    }
}
module.exports = {
    getUserByRefreshToken,
    getUserProfileById,
    createAccessToken,
    createRefreshToken,
    refreshAccessTokenByRefreshToken,
    createTokens
};