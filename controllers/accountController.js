const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()


/********************
 * Deliver login view
 *******************/
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/login", {
        title: "Login",
        nav,
        errors: [],
        message: req.flash("message"),
    })
}

/* ************************
* Deliver registration view
**************************/
async function buildRegister(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/register", {
        title: "Register",
        nav,
        errors: null,
        message: null
    })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body


  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "message",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.redirect("/account/login")
  } else {
    req.flash("message", "Sorry, the registration failed.")
    res.redirect("/account/register")
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)

  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    return res.status(400).render("account/login", {
      title: "Login",
      nav,
      message: null,
      errors: null,
      account_email,
    })
  }

  try {
    const match = await bcrypt.compare(account_password, accountData.account_password)
    if (match) {
      delete accountData.account_password

      const accessToken = jwt.sign(
        {
          account_id: accountData.account_id,
          account_firstname: accountData.account_firstname,
          account_lastname: accountData.account_lastname,
          account_email: accountData.account_email,
          account_type: accountData.account_type,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '1h' }
      )

      res.cookie("jwt", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 3600000
      })

      return res.redirect("/account/")
    } else {
      req.flash("notice", "Please check your credentials and try again.")
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    req.flash("notice", "An unexpected error occurred. Please try again.")
    return res.status(500).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
  }
}

const buildAccountManagement = async (req, res) => {
  const nav = await utilities.getNav()
  const token = req.cookies.jwt

  if (!token) {
    req.flash("message", "You must be logged in to access this page.")
    return res.redirect("/account/login")
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

    res.render("account/account-management", {
      title: "Account Management",
      nav,
      account_firstname: decoded.account_firstname,
      account_type: decoded.account_type,
      account_id: decoded.account_id,
      message: req.flash("message"),
      errors: null,
    })
  } catch (err) {
    req.flash("message", "Invalid session. Please log in again.")
    res.redirect("/account/login")
  }
}

async function buildUpdateForm(req, res) {
  const nav = await utilities.getNav()
  const accountId = req.params.accountId

  try {
    const accountData = await accountModel.getAccountById(accountId)
    if (!accountData) {
      req.flash("message", "Account not found.")
      return res.redirect("/account/")
    }
    res.render("account/update-account", {
      title: "Update Account Information",
      nav,
      account: accountData,
      errors: [],
      message: req.flash("message"),
    })
  } catch (error) {
    console.error(error)
    req.flash("message", "There was a problem loading your account information.")
    res.redirect("/account/")
  }
}


async function updateAccount(req, res) {
  const { account_id, account_firstname, account_lastname, account_email } = req.body;
  const nav = await utilities.getNav();

  try {
    const updateResult = await accountModel.updateAccount(
      account_id,
      account_firstname,
      account_lastname,
      account_email
    );

    if (updateResult) {
      req.flash("message", "Account updated successfully.");
      res.redirect("/account/");
    } else {
      res.status(500).render("account/update-account", {
        title: "Update Account Information",
        nav,
        account: req.body,
        errors: [{ msg: "Account update failed. Please try again." }],
        message: null,
      });
    }
  } catch (err) {
    console.error(err);
    req.flash("message", "An unexpected error occurred.");
    res.redirect("/account/");
  }
}


async function changePassword(req, res) {
  const { account_id, account_password } = req.body
  const hashedPassword = await bcrypt.hash(account_password, 10)
  const updateResult = await accountModel.updatePassword(account_id, hashedPassword)

  if (updateResult) {
    req.flash("message", "Password changed successfully.")
    res.redirect("/account/")
  } else {
    req.flash("message", "Password change failed.")
    res.redirect(`/account/edit/${account_id}`)
  }
}

// Inside accountController.js
async function logoutAccount(req, res) {
  res.clearCookie("jwt"); // This deletes the token cookie
  req.flash("notice", "You have been logged out.");
  return res.redirect("/");
};



module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildAccountManagement, buildUpdateForm, updateAccount, changePassword, logoutAccount}