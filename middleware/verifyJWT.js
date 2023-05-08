const jwt = require('jsonwebtoken');
require('dotenv').config()

const verifyJWT = (req, res, next) => {
    // const authHeader = req.headers['Authorization'];
    // console.log("authheader", authHeader);
    // if (!authHeader) return res.sendStatus(401);
    // const token = authHeader.split(' ')[1];
    if (!req.cookies?.jwt_accessToken) {
        res.redirect('/accounts/signIn');
        return;
    }
    const token = req.cookies.jwt_accessToken
    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        (err, decoded) => {
            if (err) return res.redirect('/accounts/signIn');
            req.userId = decoded.userId;
            req.userName = decoded.userName;
            req.userRole = decoded.userRole;
            let routeUrl = req.route.path;
            // console.log(routeUrl != "/profileCompletion")
            // // if (routeUrl == "/profileCompletion") {
            // //     next();
            // // }
            if (!req.userRole && routeUrl != "/profileCompletion") {
                res.redirect('/users/profileCompletion');
                return;
            }
            next();
        }
    );
    // req.userId = "6438ef10f98841e106fd056f";
    // req.userName = "Vedant";
    // req.userRole = "HOD";
    // next();
}

module.exports = verifyJWT