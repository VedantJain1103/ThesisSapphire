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

            //For approved user functionality
            // req.isApproved = decoded.isApproved;

            let routeUrl = req.route.path;
            console.log("verifying- ", req.userId, " ", req.userName, " ", req.userRole);

            //For checking the route
            // console.log(routeUrl != "/profileCompletion")
            // // if (routeUrl == "/profileCompletion") {
            // //     next();
            // // }

            if (!req.userRole) {
                if ((routeUrl != "/profileCompletion") && (routeUrl != "/profileCompletion/connect") && (routeUrl != "/profileCompletion/reviewer") && (routeUrl != "/profileCompletion/scholar")) {
                    res.redirect('/users/profileCompletion');
                    return;
                }
                else {
                    next();
                }
            }
            // For approved users --
            // else {
            //     if (!req.isApproved) {
            //         if (routeUrl != "/notApproved") {
            //             res.redirect('/users/notApproved');
            //             return;
            //         }
            //         else next();
            //     }
            //     else next();
            // }
            else next();
        }
    );
}

module.exports = verifyJWT