function verificationMailContent(code) {
    let content = `
    Your one time verification code is -
        <h1>${code}</h1>
    This is a one time verification code.
    Thank you for registering at LetUsFarm`
    return content;
}

function userApproved() {
    const today = new Date();
    const yyyy = today.getFullYear();
    let mm = today.getMonth() + 1; // Months start at 0!
    let dd = today.getDate();

    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;

    const formattedToday = dd + '/' + mm + '/' + yyyy;
    let content = `Your account has been verified successfully.<br>Thank you for showing your patience.<br>Sorry for the incovenience caused.<br>
                You can now start exploring the functionalities of the website after signing in to your account.<br><br>
                <i>Date:${formattedToday}</i>
                `
    return content;
}

function thesisSubmissionContent(mentor, thesis) {
    const today = new Date();
    const yyyy = today.getFullYear();
    let mm = today.getMonth() + 1; // Months start at 0!
    let dd = today.getDate();

    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;

    const formattedToday = dd + '/' + mm + '/' + yyyy;
    let content = `Your thesis has been submitted by <b>${mentor}</b> on <u>${formattedToday}</u> on the topic <i>"${thesis}"</i>.`
    return content;
}

function thesisSubmissionByMentor(scholar, thesis) {
    const today = new Date();
    const yyyy = today.getFullYear();
    let mm = today.getMonth() + 1; // Months start at 0!
    let dd = today.getDate();

    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;

    const formattedToday = dd + '/' + mm + '/' + yyyy;
    let content = `Theis by ${scholar} on the topic <i>"${thesis}"</i> under your mentorship have been successfully submitted on <u>${formattedToday}</u> .`
    return content;
}
function thesisApprovalByHOD(HOD, thesis) {
    const today = new Date();
    const yyyy = today.getFullYear();
    let mm = today.getMonth() + 1; // Months start at 0!
    let dd = today.getDate();

    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;

    const formattedToday = dd + '/' + mm + '/' + yyyy;
    let content = `Thesis on the topic <i>"${thesis}"</i> has been forwarded by <b>${HOD}</b> to the DEAN on <u>${formattedToday}</u> .`
    return content;
}

function thesisRejected(thesis) {
    const today = new Date();
    const yyyy = today.getFullYear();
    let mm = today.getMonth() + 1; // Months start at 0!
    let dd = today.getDate();

    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;

    const formattedToday = dd + '/' + mm + '/' + yyyy;
    let content = `Thesis on the topic <i>"${thesis}"</i> has been rejected on <u>${formattedToday}</u> .`
    return content;
}

function thesisApprovalByDirector(Director, thesis) {
    const today = new Date();
    const yyyy = today.getFullYear();
    let mm = today.getMonth() + 1; // Months start at 0!
    let dd = today.getDate();

    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;

    const formattedToday = dd + '/' + mm + '/' + yyyy;
    let content = `Thesis on the topic <i>"${thesis}"</i> has been forwarded to be reviewed by <b>${Director}</b> on <u>${formattedToday}</u> .`
    return content;
}

function invitationContent(Director, thesis, mentorName) {
    const today = new Date();
    const yyyy = today.getFullYear();
    let mm = today.getMonth() + 1; // Months start at 0!
    let dd = today.getDate();

    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;

    const formattedToday = dd + '/' + mm + '/' + yyyy;
    let content = `Dear Sir/Ma'am,<br>You have been invited to review the thesis on the topic <i>"${thesis}"</i> under ${mentorName} by <b>${Director}</b> of IIITDM Jabalpur.<br>
                Please sign in at <a>http://localhost:3000/</a>
                <br>Date:<u>${formattedToday}</u> .`
    return content;
}

module.exports = {
    verificationMailContent,
    userApproved,
    thesisSubmissionContent,
    thesisSubmissionByMentor,
    thesisApprovalByHOD,
    thesisRejected,
    thesisApprovalByDirector,
    invitationContent,
}