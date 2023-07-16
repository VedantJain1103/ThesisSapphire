var express = require('express');
var router = express.Router();

require('dotenv').config()

var adminServices = require('../services/adminServices');
var accountsServices = require('../services/accountsServices');

const verifyJWT = require('../middleware/verifyJWT');


router.get('/', verifyJWT, async function (req, res, next) {
    const { userId, userName, userRole } = req;
    if (userRole != "Admin") {
        res.redirect('/users/');
    }
    else {
        res.render('index', { layout: 'layout/adminLayout', name: userName, role: userRole });
    }
});


//-----------------USERS ACTION----------------------------
// Not needed as per new changes
// Faculty and student approval

// router.get('/viewUnapprovedUsers/', verifyJWT, async function (req, res, next) {
//     const { userId, userName, userRole } = req;
//     if (userRole == "Admin") {
//         let unapprovedUsers = await adminServices.getUnapprovedUsers();
//         if (unapprovedUsers.status == "Fail") {
//             let error = unapprovedUsers.error;
//             res.render('error', { layout: 'layout/adminLayout', name: userName, error: error });
//         }
//         else {
//             let { unapprovedFaculty, unapprovedScholars } = unapprovedUsers.result;
//             res.render('admin/viewUnapprovedUsers', { layout: 'layout/adminLayout', unapprovedFaculty: unapprovedFaculty, unapprovedScholars: unapprovedScholars, name: userName })
//         }
//     }
//     else {
//         res.redirect('/users/');
//     }
// });

//view user
router.get('/viewUser/:userId', verifyJWT, async function (req, res, next) {
    const { userID, userName, userRole } = req;
    const { userId } = req.params;
    if (userRole == "Admin") {
        let users = await adminServices.getUser(userId);
        if (users.status == "Fail") {
            let error = users.error;
            res.render('error', { layout: 'layout/adminLayout', name: userName, error: error });
        }
        else {
            let user = users.result;
            res.render('admin/viewUser', { layout: 'layout/adminLayout', user: user, name: userName })
        }
    }
    else {
        res.redirect('/users/');
    }
})

//vier reviewer
router.get('/viewReviewer/:userId', verifyJWT, async function (req, res, next) {
    const { userID, userName, userRole } = req;
    const { userId } = req.params;
    if (userRole == "Admin") {
        let users = await adminServices.getReviewer(userId);
        if (users.status == "Fail") {
            let error = users.error;
            res.render('error', { layout: 'layout/adminLayout', name: userName, error: error });
        }
        else {
            let user = users.result;
            res.render('admin/viewReviewer', { layout: 'layout/adminLayout', user: user, name: userName })
        }
    }
    else {
        res.redirect('/users/');
    }
})

//No need as per new changes
//Approve user
// router.post('/approveUser', verifyJWT, async function (req, res, next) {
//     const { userID, userName, userRole } = req;
//     const { userId, userEmail } = req.body;
//     if (userRole == "Admin") {
//         let usersUpdation = await directorServices.approveUser(userId, userEmail);
//         if (usersUpdation.status == "Fail") {
//             let error = usersUpdation.error;
//             res.render('error', { layout: 'layout/adminLayout', name: userName, error: error });
//         }
//         else {
//             res.redirect('/admin/viewUser/' + userId);
//         }
//     }
//     else {
//         res.redirect('/users/');
//     }
// })

router.get('/viewApprovedUsers/', verifyJWT, async function (req, res, next) {
    const { userId, userName, userRole } = req;
    if (userRole == "Admin") {
        let approvedUsers = await adminServices.getApprovedUsers();
        if (approvedUsers.status == "Fail") {
            let error = approvedUsers.error;
            res.render('error', { layout: 'layout/adminLayout', name: userName, error: error });
        }
        else {
            let { approvedFaculty, approvedScholars, approvedReviewers } = approvedUsers.result;
            res.render('Admin/viewApprovedUsers', { layout: 'layout/adminLayout', approvedFaculty: approvedFaculty, approvedScholars: approvedScholars, approvedReviewers: approvedReviewers, name: userName })
        }
    }
    else {
        res.redirect('/users/');
    }
});


//---------------------INSTITUTE ACTIONS-------------------
router.get('/departments/view', verifyJWT, async function (req, res, next) {
    const { userId, userRole, userName } = req;
    const { msg, successStatus, failStatus } = req.query;
    if (userRole != "Admin") {
        res.redirect('/users/');
    }
    else {
        const departments = await adminServices.getDepartments();
        let extraData = {
            layout: 'layout/adminLayout',
            name: userName, role: userRole,
            departments: departments,
            alert: msg,
            successAlert: successStatus,
            failAlert: failStatus
        };
        res.render('admin/viewDepartments.hbs', extraData)
    }
})
router.post('/departments/create', verifyJWT, async function (req, res, next) {
    const { userId, userRole, userName } = req;
    const { name } = req.body;
    if (userRole != "Admin") {
        res.redirect('/users/');
    }
    else {
        const creation = await adminServices.createDepartment(userId, name);
        if (creation.status == "Fail") {
            res.redirect('/admin/departments/view?failStatus=' + creation.error);
        }
        else res.redirect('/admin/departments/view?successStatus=Department added successfuully');
    }
})
router.post('/departments/delete/', verifyJWT, async function (req, res, next) {
    const { userId, userRole, userName } = req;
    const { departmentId } = req.body;
    if (userRole != "Admin") {
        res.redirect('/users/');
    }
    else {
        const deletion = await adminServices.deleteDepartment(userId, departmentId);
        if (deletion.status == "Fail") {
            res.redirect('/admin/departments/view?failStatus=' + deletion.error);
        }
        else res.redirect('/admin/departments/view?successStatus=Department deleted successfuully');
    }
})


router.get('/roles/view', verifyJWT, async function (req, res, next) {
    const { userId, userRole, userName } = req;
    const { msg, failStatus, successStatus } = req.query;
    if (userRole != "Admin") {
        res.redirect('/users/');
    }
    else {
        const roles = await adminServices.getRoles();
        let extraData = {
            layout: 'layout/adminLayout',
            name: userName, role: userRole,
            roles: roles,
            alert: msg,
            successAlert: successStatus,
            failAlert: failStatus
        };
        res.render('admin/viewRoles.hbs', extraData)
    }
})
router.post('/roles/create', verifyJWT, async function (req, res, next) {
    const { userId, userRole, userName } = req;
    const { name } = req.body;
    if (userRole != "Admin") {
        res.redirect('/users/');
    }
    else {
        const creation = await adminServices.createRole(userId, name);
        if (creation.status == "Fail") {
            res.redirect('/admin/roles/view?failStatus=' + creation.error);
        }
        else res.redirect('/admin/roles/view?successStatus=Department added successfuully');
    }
})
router.post('/roles/delete/', verifyJWT, async function (req, res, next) {
    const { userId, userRole, userName } = req;
    const { roleId } = req.body;
    if (userRole != "Admin") {
        res.redirect('/users/');
    }
    else {
        const deletion = await adminServices.deleteRole(userId, roleId);
        if (deletion.status == "Fail") {
            res.redirect('/admin/roles/view?failStatus=' + deletion.error);
        }
        else res.redirect('/admin/roles/view?successStatus=Department deleted successfuully');
    }
})

router.get('/createProfiles', verifyJWT, async function (req, res, next) {
    const { userId, userRole, userName } = req;
    const { msg, successStatus, failStatus } = req.query;
    if (userRole != "Admin") {
        res.redirect('/users/');
    }
    else {
        let user = await accountsServices.getUserById(userId);
        let departments = await adminServices.getDepartments();
        let roles = await adminServices.getRoles();
        for (let i = 0; i < roles.length; i++) {
            if (roles[i].name == "Reviewer") {
                let spliced = roles.splice(i, 1);
            }
        }
        for (let i = 0; i < roles.length; i++) {
            if (roles[i].name == "Scholar") {
                let spliced = roles.splice(i, 1);
            }
        }
        let extraData = {
            layout: 'layout/adminLayout',
            name: userName, role: userRole,
            departments: departments,
            roles: roles,
            alert: msg,
            successAlert: successStatus,
            failAlert: failStatus
        };
        res.render('admin/createProfiles.hbs', extraData)
    }
});

router.post('/createProfile/scholar', verifyJWT, async function (req, res, next) {
    const { userId, userRole, userName } = req;
    const { name, email, institute, department, rollNo, dateOfJoining } = req.body;
    if (userRole != "Admin") {
        res.redirect('/users/');
    }
    else {
        const creation = await adminServices.createUserProfileScholar(name, email, institute, department, rollNo, dateOfJoining);
        if (creation.status == "Fail") {
            res.redirect('/admin/createProfiles?failStatus=' + creation.error);
        }
        else {
            res.redirect('/admin/createProfiles?successStatus=User Profile Created');
        }
    }
})

router.post('/createProfile/faculty', verifyJWT, async function (req, res, next) {
    const { userId, userRole, userName } = req;
    const { name, email, institute, department, pfId, role } = req.body;
    if (userRole != "Admin") {
        res.redirect('/users/');
    }
    else {
        const creation = await adminServices.createUserProfileFaculty(name, email, institute, department, pfId, role);
        if (creation.status == "Fail") {
            res.redirect('/admin/createProfiles?failStatus=' + creation.error);
        }
        else {
            res.redirect('/admin/createProfiles?successStatus=User Profile Created');
        }
    }
})

module.exports = router;
