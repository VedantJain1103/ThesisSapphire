require("dotenv").config();

function isValidEmail(email) {
    var validEmailRegex = /^\S+@\S+\.\S+$/
    return email.match(validEmailRegex);
}


module.exports = {
    isValidEmail
};
