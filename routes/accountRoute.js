// Needed Resources
const regValidate = require('../utilities/account-validation')
const express = require("express")
const router = new express.Router()
const utilities = require("../utilities/")
const accountController = require("../controllers/accountController")



router.get("/login", utilities.handleErrors(accountController.buildLogin));

router.get("/register", utilities.handleErrors(accountController.buildRegister))

router.post(
    "/register",
    regValidate.registationRules(),
    regValidate.checkRegData, 
    utilities.handleErrors(accountController.registerAccount)
)


// Process the login attempt
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

// Default account management route
router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildAccountManagement));



// Route to display the update view for a specific account
router.get(
  "/edit/:accountId",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildUpdateForm)
);


// Handle account info update
router.post(
  "/update",
  utilities.checkLogin,
  regValidate.updateAccountRules(),
  regValidate.checkUpdateData,
  utilities.handleErrors(accountController.updateAccount)
)

// Handle password change
router.post(
  "/change-password",
  utilities.checkLogin,
  regValidate.changePasswordRules(),
  regValidate.checkPasswordChangeData,
  utilities.handleErrors(accountController.changePassword)
)

// Inside accountRoute.js
router.get("/logout", accountController.logoutAccount);



module.exports = router;