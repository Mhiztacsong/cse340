const utilities = require("../utilities/")


/********************
 * Deliver login view
 *******************/
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/login", {
        title: "Login",
        nav,
        message: req.flash("message"),
    })
}

/* ************************
* Deliver registration view
**************************/
async function buildRegister(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/Register", {
        title: "Register",
        nav,
        message: req.flash("message"),
        errors: null
    })
}

module.exports = { buildLogin, buildRegister }